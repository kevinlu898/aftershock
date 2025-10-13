/* Lessons and Modules for prepare page*/
export const PREPARE_MODULES = [
  {
    id: "1",
    title: "Post-shaking Checklist",
    description: "Keep yourself safe(kys)",
    checklistItems: [
      { id: 1, text: "Research local fault lines", completed: false },
      {
        id: 2,
        text: "Check if you are in a liquefaction zone",
        completed: false,
      },
      { id: 3, text: "Identify local emergency resources", completed: false },
    ],
  },
  {
    id: "2",
    title: "Important Documents",
    description: "Keep all of these at hand.",
    checklistItems: [
      { id: 1, text: "Research local fault lines", completed: false },
      {
        id: 2,
        text: "Check if you are in a liquefaction zone",
        completed: false,
      },
      { id: 3, text: "Identify local emergency resources", completed: false },
    ],
  },
];

// Helper function to get lesson data by ID
export const getLessonById = (lessonId) => {
  for (const module of PREPARE_MODULES) {
    const lesson = module.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
};

// Helper function to get module data by ID
export const getModuleById = (moduleId) => {
  return PREPARE_MODULES.find((module) => module.id === moduleId);
};
