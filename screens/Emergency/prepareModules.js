/* Lessons and Modules for prepare page*/
export const PREPARE_MODULES = [
  {
    id: "1",
    title: "Post-shaking Checklist",
    description: "Keep yourself safe after an earthquake.",
    checklistItems: [
      {
        id: 1,
        text: "Check yourself and others for injuries.",
        completed: false,
      },
      { id: 2, text: "Be prepared for aftershocks.", completed: false },
      {
        id: 3,
        text: "Inspect your home for structural damage and hazards (gas, water, electric).",
        completed: false,
      },
      {
        id: 4,
        text: "Turn off utilities if you suspect leaks or damage.",
        completed: false,
      },
      {
        id: 5,
        text: "Listen to emergency broadcasts for updates and instructions.",
        completed: false,
      },
      { id: 6, text: "Limit phone use to emergencies only.", completed: false },
      {
        id: 7,
        text: "Stay away from damaged buildings and areas.",
        completed: false,
      },
      {
        id: 8,
        text: "Wear sturdy shoes and protective clothing if you must go outside.",
        completed: false,
      },
      {
        id: 9,
        text: "Check for fires and extinguish if safe to do so.",
        completed: false,
      },
      {
        id: 10,
        text: "Help neighbors who may require special assistance.",
        completed: false,
      },
    ],
  },
  {
    id: "2",
    title: "Important Documents",
    description: "Keep all of these at hand.",
    checklistItems: [
      {
        id: 1,
        text: "Identification (ID, driver's license, passport)",
        completed: false,
      },
      { id: 2, text: "Medical records and prescriptions", completed: false },
      {
        id: 3,
        text: "Insurance policies (health, home, auto)",
        completed: false,
      },
      { id: 4, text: "Emergency contact list", completed: false },
      {
        id: 5,
        text: "Bank account and financial information",
        completed: false,
      },
      {
        id: 6,
        text: "Proof of address (utility bill, lease, etc.)",
        completed: false,
      },
      {
        id: 7,
        text: "Birth certificates and Social Security cards",
        completed: false,
      },
      {
        id: 8,
        text: "List of important passwords and account numbers",
        completed: false,
      },
      {
        id: 9,
        text: "Pet vaccination and ownership records (if applicable)",
        completed: false,
      },
      { id: 10, text: "Copies of keys (home, car, safe)", completed: false },
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
