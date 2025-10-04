/* Lessons and Modules for prepare page*/
export const PREPARE_MODULES = [
  {
    id: '1',
    title: 'Understand Earthquakes',
    icon: 'brain',
    description: 'Know your risk and the science',
    progress: 0.4,
    completed: false,
    lessons: [
      { id: '1-1', title: 'How Earthquakes Work', duration: '5 min', completed: true },
      { id: '1-2', title: 'Know Your Risk', duration: '8 min', completed: true },
      { id: '1-3', title: 'Myths vs Facts', duration: '5 min', completed: false },
    ]
  },
  {
    id: '2',
    title: 'Make Your Plan',
    icon: 'clipboard-list',
    description: 'Create your emergency plan',
    progress: 1.0,
    completed: true,
    lessons: [
      { id: '2-1', title: 'Learn the Basics', duration: '10 min', completed: true },
      { id: '2-2', title: 'Define Contacts', duration: '15 min', completed: true },
      { id: '2-3', title: 'Practice Your Plan', duration: '5 min', completed: true },
    ]
  },
  {
    id: '3',
    title: 'Build Your Kits',
    icon: 'backpack',
    description: 'Assemble emergency supplies',
    progress: 0.2,
    completed: false,
    lessons: [
      { id: '3-1', title: 'Go-Bag Essentials', duration: '20 min', completed: true },
      { id: '3-2', title: 'Home Kit', duration: '25 min', completed: false },
      { id: '3-3', title: 'Car Kit', duration: '15 min', completed: false },
    ]
  },
  {
    id: '4',
    title: 'Secure Your Home',
    icon: 'home-alert',
    description: 'Prevent injuries and damage',
    progress: 0.0,
    completed: false,
    lessons: [
      { id: '4-1', title: 'Identify Hazards', duration: '15 min', completed: false },
      { id: '4-2', title: 'Shut Off Utilities', duration: '10 min', completed: false },
    ]
  },
  {
    id: '5',
    title: 'Finalize & Review',
    icon: 'check-circle',
    description: 'Tie up loose ends',
    progress: 0.0,
    completed: false,
    lessons: [
      { id: '5-1', title: 'Document Belongings', duration: '30 min', completed: false },
      { id: '5-2', title: 'Review Insurance', duration: '15 min', completed: false },
    ]
  },
];