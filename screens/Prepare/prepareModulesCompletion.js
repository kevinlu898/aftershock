import AsyncStorage from '@react-native-async-storage/async-storage';
import { PREPARE_MODULES, getLessonPages } from './prepareModules';

let auth = null;
let database = null;
try {
  // try to require firebase modules only if installed
  // eslint-disable-next-line global-require
  auth = require('@react-native-firebase/auth').default;
  // eslint-disable-next-line global-require
  database = require('@react-native-firebase/database').default;
} catch (e) {
  console.warn('prepareModulesCompletion: Firebase packages not found, remote sync disabled');
}

const STORAGE_KEY = 'PREPARE_COMPLETION_V1';

// State shape:
// { modules: { [moduleId]: { completed: bool, lessons: { [lessonId]: { completed: bool, currentPageIndex: number } } } } }

const buildInitialState = () => {
  const state = { modules: {} };
  PREPARE_MODULES.forEach((m) => {
    const lessons = {};
    m.lessons.forEach((l) => {
      const pages = getLessonPages(l) || [];
      lessons[l.id] = {
        completed: !!l.completed,
        currentPageIndex: 0,
        pageCount: pages.length || 0,
      };
    });
    state.modules[m.id] = { completed: !!m.completed, lessons };
  });
  return state;
};

const readStorage = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn('prepareModulesCompletion: readStorage error', e);
    return null;
  }
};

const writeStorage = async (state) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('prepareModulesCompletion: writeStorage error', e);
  }
};

const writeFirebase = async (state) => {
  if (!auth || !database) return; // firebase not available
  try {
    const user = auth().currentUser;
    if (!user) return;
    await database().ref(`/users/${user.uid}/prepareCompletion`).set(state);
  } catch (e) {
    console.warn('prepareModulesCompletion: writeFirebase error', e);
  }
};

const readFirebase = async () => {
  if (!auth || !database) return null; // firebase not available
  try {
    const user = auth().currentUser;
    if (!user) return null;
    const snap = await database().ref(`/users/${user.uid}/prepareCompletion`).once('value');
    return snap.exists() ? snap.val() : null;
  } catch (e) {
    console.warn('prepareModulesCompletion: readFirebase error', e);
    return null;
  }
};

// Initialize: prefer Firebase data (if user logged in), otherwise use local AsyncStorage, otherwise build skeleton
export const initCompletionState = async () => {
  // Try firebase first
  let remote = null;
  try {
    remote = await readFirebase();
  } catch (e) {
    remote = null;
  }

  if (remote) {
    // save to async storage and return
    await writeStorage(remote);
    return remote;
  }

  // Fallback to AsyncStorage
  const local = await readStorage();
  if (local) return local;

  // Create initial skeleton
  const initial = buildInitialState();
  await writeStorage(initial);
  // attempt to write to firebase if logged in
  try { await writeFirebase(initial); } catch (e) {}
  return initial;
};

// Always read from async storage to ensure up-to-date
export const getCompletionState = async () => {
  const s = await readStorage();
  if (s) return s;
  const init = await initCompletionState();
  return init;
};

// Set current page index for a lesson and persist
export const setLessonCurrentPage = async (moduleId, lessonId, pageIndex) => {
  const state = (await getCompletionState()) || buildInitialState();
  if (!state.modules[moduleId]) state.modules[moduleId] = { completed: false, lessons: {} };
  if (!state.modules[moduleId].lessons[lessonId]) state.modules[moduleId].lessons[lessonId] = { completed: false, currentPageIndex: 0 };

  state.modules[moduleId].lessons[lessonId].currentPageIndex = pageIndex;

  // If pageIndex >= pageCount mark lesson completed
  const pageCount = state.modules[moduleId].lessons[lessonId].pageCount || 0;
  if (pageCount > 0 && pageIndex >= pageCount) {
    state.modules[moduleId].lessons[lessonId].completed = true;
  }

  await writeStorage(state);
  await writeFirebase(state);
  return state;
};

// Mark a lesson completed; set currentPageIndex to pageCount
export const markLessonCompleted = async (moduleId, lessonId) => {
  const state = (await getCompletionState()) || buildInitialState();
  if (!state.modules[moduleId]) state.modules[moduleId] = { completed: false, lessons: {} };
  if (!state.modules[moduleId].lessons[lessonId]) state.modules[moduleId].lessons[lessonId] = { completed: false, currentPageIndex: 0 };

  const pageCount = state.modules[moduleId].lessons[lessonId].pageCount || 0;
  state.modules[moduleId].lessons[lessonId].completed = true;
  state.modules[moduleId].lessons[lessonId].currentPageIndex = pageCount;

  // Update module completed if all lessons completed
  const lessons = state.modules[moduleId].lessons;
  const allDone = Object.keys(lessons).every(lid => lessons[lid].completed);
  state.modules[moduleId].completed = allDone;

  await writeStorage(state);
  await writeFirebase(state);
  return state;
};

// Mark module completed or not
export const setModuleCompleted = async (moduleId, completed) => {
  const state = (await getCompletionState()) || buildInitialState();
  if (!state.modules[moduleId]) state.modules[moduleId] = { completed: false, lessons: {} };
  state.modules[moduleId].completed = !!completed;
  await writeStorage(state);
  await writeFirebase(state);
  return state;
};

// Utility: sync remote -> local on app open. If remote missing, create based on PREPARE_MODULES
export const syncFromFirebaseToLocal = async () => {
  const remote = await readFirebase();
  if (remote) {
    await writeStorage(remote);
    return remote;
  }
  // no remote, ensure local exists
  const local = await readStorage();
  if (local) return local;
  const init = buildInitialState();
  await writeStorage(init);
  return init;
};

export default {
  initCompletionState,
  getCompletionState,
  setLessonCurrentPage,
  markLessonCompleted,
  setModuleCompleted,
  syncFromFirebaseToLocal,
};
