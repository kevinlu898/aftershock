import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "./firebaseConfig";

const STORAGE_KEY = "ONBOARDING_V1";

const readString = async (key) => {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
};

const onboardingEvents = {
  _listeners: {},
  on(event, cb) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(cb);
    return () => this.off(event, cb);
  },
  off(event, cb) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter((f) => f !== cb);
  },
  emit(event, payload) {
    (this._listeners[event] || []).forEach((f) => {
      try {
        f(payload);
      } catch (e) {
        console.warn("onboardingState: listener error", e);
      }
    });
  },
};

export const events = onboardingEvents;

const readJsonArray = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [];
  }
};

export const ONBOARDING_STEPS = [
  {
    id: "location",
    title: "Your area",
    icon: "map-marker-radius",
    nudgeTitle: "Confirm your ZIP code",
    route: null,
    hasData: async () => !!(await readString("postalcode")),
  },
  {
    id: "alerts",
    title: "Alerts",
    icon: "alert-circle",
    nudgeTitle: "Turn on earthquake alerts",
    route: null,
    hasData: async (state) =>
      (state?.steps?.alerts?.permission ?? "undetermined") !== "undetermined",
  },
  {
    id: "contacts",
    title: "Emergency contacts",
    icon: "phone",
    nudgeTitle: "Add an emergency contact",
    route: "ContactInfo",
    hasData: async () => (await readJsonArray("emergency_contacts")).length > 0,
  },
  {
    id: "medical",
    title: "Medical info",
    icon: "medical-bag",
    nudgeTitle: "Add your medical details",
    route: "MedicalInfo",
    hasData: async () => (await readJsonArray("medical_info")).length > 0,
  },
];

export const STEP_COUNT = ONBOARDING_STEPS.length;

export const WELCOME_INDEX = 0;
export const FIRST_STEP_INDEX = 1;
export const FINISH_INDEX = STEP_COUNT + 1;

const buildInitialState = () => {
  const steps = {};
  ONBOARDING_STEPS.forEach((s) => {
    steps[s.id] = { visited: false, skipped: false };
  });
  steps.alerts.permission = "undetermined";
  return {
    version: 1,
    status: "not_started",
    currentStepIndex: WELCOME_INDEX,
    startedAt: null,
    completedAt: null,
    nudgeSnoozedUntil: null,
    steps,
  };
};

const readStorage = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("onboardingState: readStorage error", e);
    return null;
  }
};

const writeStorage = async (state) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("onboardingState: writeStorage error", e);
  }
};

const commit = async (state) => {
  await writeStorage(state);
  onboardingEvents.emit("changed", state);
  return state;
};

const normalize = (stored) => {
  const base = buildInitialState();
  if (!stored || typeof stored !== "object") return base;
  const steps = { ...base.steps };
  ONBOARDING_STEPS.forEach((s) => {
    steps[s.id] = { ...base.steps[s.id], ...(stored.steps?.[s.id] || {}) };
  });
  return { ...base, ...stored, steps };
};

export const getOnboardingState = async () => {
  const stored = await readStorage();
  if (stored) return normalize(stored);
  const initial = buildInitialState();
  await writeStorage(initial);
  return initial;
};

export const setCurrentStep = async (index) => {
  const state = await getOnboardingState();
  const clamped = Math.min(Math.max(Number(index) || 0, 0), FINISH_INDEX);
  state.currentStepIndex = clamped;
  if (state.status === "not_started") {
    state.status = "in_progress";
    state.startedAt = new Date().toISOString();
  }
  const step = ONBOARDING_STEPS[clamped - FIRST_STEP_INDEX];
  if (step) state.steps[step.id].visited = true;
  return commit(state);
};

export const markStepDone = async (stepId, extra = {}) => {
  const state = await getOnboardingState();
  if (!state.steps[stepId]) return state;
  state.steps[stepId] = {
    ...state.steps[stepId],
    ...extra,
    visited: true,
    skipped: false,
  };
  return commit(state);
};

export const markStepSkipped = async (stepId, extra = {}) => {
  const state = await getOnboardingState();
  if (!state.steps[stepId]) return state;
  state.steps[stepId] = {
    ...state.steps[stepId],
    ...extra,
    visited: true,
    skipped: true,
  };
  return commit(state);
};

export const updateUserDoc = async (fields) => {
  try {
    const username = await readString("username");
    if (!username) return false;
    const snap = await getDocs(
      query(collection(db, "user"), where("username", "==", username))
    );
    if (snap.empty) return false;
    await updateDoc(doc(db, "user", snap.docs[0].id), fields);
    return true;
  } catch (e) {
    console.warn("onboardingState: could not update user doc", e);
    return false;
  }
};

export const saveZipToAccount = (zip) => updateUserDoc({ zip_code: zip });

const syncCompletionToFirestore = (completedAt) =>
  updateUserDoc({ onboarding_completed_at: completedAt });

export const markOnboardingComplete = async () => {
  const state = await getOnboardingState();
  const completedAt = new Date().toISOString();
  state.status = "completed";
  state.completedAt = completedAt;
  state.currentStepIndex = FINISH_INDEX;
  await commit(state);
  syncCompletionToFirestore(completedAt);
  return state;
};

export const dismissOnboarding = async () => {
  const state = await getOnboardingState();
  state.status = "dismissed";
  ONBOARDING_STEPS.forEach((s) => {
    if (!state.steps[s.id].visited) state.steps[s.id].skipped = true;
  });
  return commit(state);
};

export const seedCompletionFromRemote = async (completedAt) => {
  if (!completedAt) return null;
  const state = await getOnboardingState();
  if (state.status === "completed") return state;
  state.status = "completed";
  state.completedAt = completedAt;
  state.currentStepIndex = FINISH_INDEX;
  return commit(state);
};

export const snoozeNudge = async (days = 7) => {
  const state = await getOnboardingState();
  state.nudgeSnoozedUntil = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000
  ).toISOString();
  return commit(state);
};

export const resetOnboarding = async () => commit(buildInitialState());

/** Steps with no data behind them, for the dashboard nudge. */
export const getPendingSteps = async () => {
  const state = await getOnboardingState();
  const pending = [];
  for (const step of ONBOARDING_STEPS) {
    let done = false;
    try {
      done = await step.hasData(state);
    } catch {
      done = false;
    }
    if (!done) {
      pending.push({ ...step, skipped: !!state.steps[step.id]?.skipped });
    }
  }
  return pending;
};

export const getSetupScore = async () => {
  const pending = await getPendingSteps();
  return (STEP_COUNT - pending.length) / STEP_COUNT;
};

export const isNudgeSnoozed = (state) => {
  if (!state?.nudgeSnoozedUntil) return false;
  return new Date(state.nudgeSnoozedUntil).getTime() > Date.now();
};

export default {
  events,
  ONBOARDING_STEPS,
  getOnboardingState,
  setCurrentStep,
  markStepDone,
  markStepSkipped,
  markOnboardingComplete,
  dismissOnboarding,
  seedCompletionFromRemote,
  snoozeNudge,
  resetOnboarding,
  getPendingSteps,
  getSetupScore,
};
