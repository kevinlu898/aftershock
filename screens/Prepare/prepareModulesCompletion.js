import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'PREPARE_COMPLETION_V1';

const completionEvents = {
  _listeners: {},
  on(event, cb) {
    this._listeners[event] = this._listeners[event] || [];
    this._listeners[event].push(cb);
    return () => this.off(event, cb);
  },
  off(event, cb) {
    if (!this._listeners[event]) return;
    this._listeners[event] = this._listeners[event].filter(f => f !== cb);
  },
  emit(event, payload) {
    (this._listeners[event] || []).forEach((f) => {
      try { f(payload); } catch (e) { console.warn('prepareModulesCompletion: listener error', e); }
    });
  }
};

// Build initial default state
const buildInitialState = () => {
  const state = { modules: {} };
  try {
    const { PREPARE_MODULES, getLessonPages } = require('./prepareModules');
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
  } catch (e) {
    console.warn('prepareModulesCompletion: could not load PREPARE_MODULES for initial state', e);
  }
  return state;
};

// AsyncStorage read/write
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
    console.log('prepareModulesCompletion: wrote state to AsyncStorage');
  } catch (e) {
    console.warn('prepareModulesCompletion: writeStorage error', e);
  }
};

// Utility: Get page count from module/lesson definition
const getPageCountFromCatalog = (moduleId, lessonId) => {
  try {
    const { PREPARE_MODULES, getLessonPages } = require('./prepareModules');
    const m = PREPARE_MODULES.find(mm => mm.id === moduleId);
    if (!m) return 0;
    const l = m.lessons.find(ll => ll.id === lessonId);
    if (!l) return 0;
    const pages = getLessonPages(l) || [];
    return pages.length || 0;
  } catch (e) {
    console.warn('prepareModulesCompletion: getPageCountFromCatalog require failed', e);
    return 0;
  }
};

// Initialize local completion state
export const initCompletionState = async () => {
  const local = await readStorage();
  if (local) return local;
  const initial = buildInitialState();
  await writeStorage(initial);
  completionEvents.emit('changed', initial);
  return initial;
};

// Get most recent completion data
export const getCompletionState = async () => {
  const s = await readStorage();
  if (s) return s;
  const init = await initCompletionState();
  return init;
};

// Update a lesson’s page progress
export const setLessonCurrentPage = async (moduleId, lessonId, pageIndex) => {
  console.log('prepareModulesCompletion: setLessonCurrentPage', moduleId, lessonId, pageIndex);
  try {
    const state = (await getCompletionState()) || buildInitialState();
    if (!state.modules[moduleId]) state.modules[moduleId] = { completed: false, lessons: {} };
    if (!state.modules[moduleId].lessons[lessonId]) {
      state.modules[moduleId].lessons[lessonId] = { completed: false, currentPageIndex: 0 };
    }

    // Ensure page count exists
    let pageCount = state.modules[moduleId].lessons[lessonId].pageCount;
    if (!pageCount || pageCount <= 0) {
      pageCount = getPageCountFromCatalog(moduleId, lessonId) || 0;
      state.modules[moduleId].lessons[lessonId].pageCount = pageCount;
    }

    state.modules[moduleId].lessons[lessonId].currentPageIndex = pageIndex;
    if (pageCount > 0 && pageIndex >= pageCount) {
      state.modules[moduleId].lessons[lessonId].completed = true;
    }

    await writeStorage(state);
    completionEvents.emit('changed', state);
    console.log('prepareModulesCompletion: setLessonCurrentPage persisted');
    return state;
  } catch (e) {
    console.warn('prepareModulesCompletion: setLessonCurrentPage error', e);
    throw e;
  }
};

// Mark a lesson completed
export const markLessonCompleted = async (moduleId, lessonId) => {
  console.log('prepareModulesCompletion: markLessonCompleted', moduleId, lessonId);
  try {
    const state = (await getCompletionState()) || buildInitialState();
    if (!state.modules[moduleId]) state.modules[moduleId] = { completed: false, lessons: {} };
    if (!state.modules[moduleId].lessons[lessonId]) {
      state.modules[moduleId].lessons[lessonId] = { completed: false, currentPageIndex: 0 };
    }

    let pageCount = state.modules[moduleId].lessons[lessonId].pageCount;
    if (!pageCount || pageCount <= 0) {
      pageCount = getPageCountFromCatalog(moduleId, lessonId) || 0;
      state.modules[moduleId].lessons[lessonId].pageCount = pageCount;
    }

    state.modules[moduleId].lessons[lessonId].completed = true;
    state.modules[moduleId].lessons[lessonId].currentPageIndex = pageCount;

    // Check if all lessons in this module are complete
    const lessons = state.modules[moduleId].lessons;
    const allDone = Object.keys(lessons).every(lid => lessons[lid].completed);
    state.modules[moduleId].completed = allDone;

    await writeStorage(state);
    completionEvents.emit('changed', state);
    console.log('prepareModulesCompletion: markLessonCompleted persisted');
    return state;
  } catch (e) {
    console.warn('prepareModulesCompletion: markLessonCompleted error', e);
    throw e;
  }
};

// Mark an entire module complete/incomplete
export const setModuleCompleted = async (moduleId, completed) => {
  try {
    const state = (await getCompletionState()) || buildInitialState();
    if (!state.modules[moduleId]) state.modules[moduleId] = { completed: false, lessons: {} };
    state.modules[moduleId].completed = !!completed;
    await writeStorage(state);
    completionEvents.emit('changed', state);
    return state;
  } catch (e) {
    console.warn('prepareModulesCompletion: setModuleCompleted error', e);
    throw e;
  }
};

export default {
  initCompletionState,
  getCompletionState,
  setLessonCurrentPage,
  markLessonCompleted,
  setModuleCompleted,
  events: completionEvents,
};
