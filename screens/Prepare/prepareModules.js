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
      { 
        id: '1-1', 
        title: 'How Earthquakes Work', 
        duration: '5 min', 
        completed: true,
        type: 'lesson',
        content: {
          text: `Earthquakes are caused by the sudden movement of tectonic plates beneath the Earth's surface. These plates are constantly moving, but sometimes they get stuck at their edges due to friction. When the stress on the edge overcomes the friction, there is an earthquake that releases energy in waves that travel through the earth's crust.

Key Concepts:
• Tectonic Plates: Large pieces of Earth's crust
• Fault Lines: Where plates meet and can slip
• Epicenter: Point on surface directly above where quake starts
• Magnitude: Measures energy released

Remember: Even small earthquakes can be warning signs for larger ones. Always be prepared!`,
          videoUrl: 'earthquake_science',
          checklistItems: [
            { id: 1, text: 'Understand plate tectonics basics', completed: false },
            { id: 2, text: 'Learn about fault lines in your area', completed: false },
            { id: 3, text: 'Know the difference between magnitude and intensity', completed: false }
          ],
          quizQuestions: [
            {
              id: 1,
              question: 'What causes earthquakes?',
              options: [
                'Weather changes',
                'Tectonic plate movement', 
                'Ocean currents',
                'Volcanic activity only'
              ],
              correctAnswer: 1
            },
            {
              id: 2,
              question: 'What is the epicenter of an earthquake?',
              options: [
                'The point where it starts underground',
                'The point on the surface directly above where it starts',
                'The area with the most damage',
                'The location of the seismic station'
              ],
              correctAnswer: 1
            }
          ]
        }
      },
      { 
        id: '1-2', 
        title: 'Know Your Risk', 
        duration: '8 min', 
        completed: true,
        type: 'lesson',
        content: {
          text: `Understanding your local earthquake risk is crucial for proper preparation. Different regions face different levels of seismic activity based on their proximity to fault lines and geological conditions.

California-Specific Risks:
• San Andreas Fault System
• Hayward Fault in Bay Area
• Cascadia Subduction Zone potential
• Local soil conditions affecting shaking intensity

Check your area's seismic hazard maps and know if you're in a liquefaction zone or landslide-prone area.`,
          videoUrl: 'local_risks',
          checklistItems: [
            { id: 1, text: 'Research local fault lines', completed: false },
            { id: 2, text: 'Check if you are in a liquefaction zone', completed: false },
            { id: 3, text: 'Identify local emergency resources', completed: false }
          ],
          quizQuestions: [
            {
              id: 1,
              question: 'Which fault is most dangerous for the Bay Area?',
              options: [
                'San Andreas Fault',
                'Hayward Fault',
                'Calaveras Fault',
                'All of the above'
              ],
              correctAnswer: 1
            }
          ]
        }
      },
      { 
        id: '1-3', 
        title: 'Myths vs Facts', 
        duration: '5 min', 
        completed: false,
        type: 'quiz',
        content: {
          text: `Test your knowledge about common earthquake misconceptions. Knowing the facts could save your life!`,
          quizQuestions: [
            {
              id: 1,
              question: 'During an earthquake, you should:',
              options: [
                'Stand in a doorway',
                'Run outside immediately',
                'Drop, Cover, and Hold On',
                'Get in your car and drive away'
              ],
              correctAnswer: 2
            },
            {
              id: 2,
              question: 'Earthquakes can be predicted:',
              options: [
                'True - scientists know exactly when they will happen',
                'False - we can only forecast probabilities',
                'Only in California',
                'Only for large earthquakes'
              ],
              correctAnswer: 1
            },
            {
              id: 3,
              question: 'Small earthquakes relieve pressure and prevent big ones:',
              options: [
                'True - they release built-up energy',
                'False - they don\'t prevent larger quakes',
                'Only in some cases',
                'Scientists are not sure'
              ],
              correctAnswer: 1
            }
          ]
        }
      },
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
      { 
        id: '2-1', 
        title: 'Learn the Basics', 
        duration: '10 min', 
        completed: true,
        type: 'lesson',
        content: {
          text: `Every family needs an earthquake plan. This lesson covers the essential elements everyone should include in their emergency plan.`,
          checklistItems: [
            { id: 1, text: 'Identify safe spots in each room', completed: true },
            { id: 2, text: 'Choose two meeting places', completed: true },
            { id: 3, text: 'Learn emergency contact numbers', completed: true }
          ]
        }
      },
      { 
        id: '2-2', 
        title: 'Define Contacts', 
        duration: '15 min', 
        completed: true,
        type: 'checklist',
        content: {
          text: `Set up your emergency communication plan. Text messages often work when phone calls don't during emergencies.`,
          checklistItems: [
            { id: 1, text: 'Choose an out-of-state contact person', completed: true },
            { id: 2, text: 'Save emergency numbers in your phone', completed: true },
            { id: 3, text: 'Practice texting family members', completed: true },
            { id: 4, text: 'Set up group chat for family updates', completed: true }
          ]
        }
      },
      { 
        id: '2-3', 
        title: 'Practice Your Plan', 
        duration: '5 min', 
        completed: true,
        type: 'practice',
        content: {
          text: `Run through your earthquake drill with family members. Practice makes perfect!`,
          checklistItems: [
            { id: 1, text: 'Conduct a family earthquake drill', completed: true },
            { id: 2, text: 'Time how long it takes to get to safe spots', completed: true },
            { id: 3, text: 'Review and improve your plan', completed: true }
          ]
        }
      },
    ]
  },
  {
    id: '3',
    title: 'Build Your Kits',
    icon: 'medical-bag',
    description: 'Assemble emergency supplies',
    progress: 0.2,
    completed: false,
    lessons: [
      { 
        id: '3-1', 
        title: 'Go-Bag Essentials', 
        duration: '20 min', 
        completed: true,
        type: 'checklist',
        content: {
          text: `Your go-bag should contain supplies to survive for at least 72 hours. Keep it by your door or in your car.`,
          checklistItems: [
            { id: 1, text: 'Water (1 gallon per person per day)', completed: true },
            { id: 2, text: 'Non-perishable food', completed: true },
            { id: 3, text: 'First aid kit', completed: false },
            { id: 4, text: 'Flashlight and batteries', completed: false },
            { id: 5, text: 'Portable radio', completed: false },
            { id: 6, text: 'Important documents copies', completed: false }
          ]
        }
      },
      { 
        id: '3-2', 
        title: 'Home Kit', 
        duration: '25 min', 
        completed: false,
        type: 'checklist',
        content: {
          text: `Your home emergency kit should support your family for up to two weeks.`,
          checklistItems: [
            { id: 1, text: 'Two-week water supply', completed: false },
            { id: 2, text: 'Canned and dry foods', completed: false },
            { id: 3, text: 'Manual can opener', completed: false },
            { id: 4, text: 'Cooking supplies', completed: false },
            { id: 5, text: 'Sanitation supplies', completed: false }
          ]
        }
      },
      { 
        id: '3-3', 
        title: 'Car Kit', 
        duration: '15 min', 
        completed: false,
        type: 'checklist',
        content: {
          text: `Keep emergency supplies in your vehicle in case you're away from home during a quake.`,
          checklistItems: [
            { id: 1, text: 'Emergency blanket', completed: false },
            { id: 2, text: 'Jumper cables', completed: false },
            { id: 3, text: 'Road flares', completed: false },
            { id: 4, text: 'Basic tools', completed: false },
            { id: 5, text: 'Water and snacks', completed: false }
          ]
        }
      },
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
      { 
        id: '4-1', 
        title: 'Identify Hazards', 
        duration: '15 min', 
        completed: false,
        type: 'checklist',
        content: {
          text: `Walk through your home room by room to identify potential earthquake hazards.`,
          checklistItems: [
            { id: 1, text: 'Secure tall furniture to walls', completed: false },
            { id: 2, text: 'Move heavy objects to lower shelves', completed: false },
            { id: 3, text: 'Check for unsecured water heater', completed: false },
            { id: 4, text: 'Identify broken glass risks', completed: false },
            { id: 5, text: 'Secure overhead light fixtures', completed: false }
          ]
        }
      },
      { 
        id: '4-2', 
        title: 'Shut Off Utilities', 
        duration: '10 min', 
        completed: false,
        type: 'lesson',
        content: {
          text: `Learn how and when to shut off your gas, water, and electricity after an earthquake.`,
          videoUrl: 'utility_shutoff',
          checklistItems: [
            { id: 1, text: 'Locate gas shut-off valve', completed: false },
            { id: 2, text: 'Find main water shut-off', completed: false },
            { id: 3, text: 'Identify circuit breaker', completed: false },
            { id: 4, text: 'Practice shutting off utilities', completed: false }
          ],
          quizQuestions: [
            {
              id: 1,
              question: 'When should you shut off your gas?',
              options: [
                'After every earthquake',
                'Only if you smell gas or hear hissing',
                'Immediately after shaking stops',
                'Never - wait for utility company'
              ],
              correctAnswer: 1
            }
          ]
        }
      },
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
      { 
        id: '5-1', 
        title: 'Document Belongings', 
        duration: '30 min', 
        completed: false,
        type: 'checklist',
        content: {
          text: `Create a home inventory for insurance purposes. Take photos or videos of your belongings.`,
          checklistItems: [
            { id: 1, text: 'Photograph each room', completed: false },
            { id: 2, text: 'Document valuable items', completed: false },
            { id: 3, text: 'Keep receipts for major purchases', completed: false },
            { id: 4, text: 'Store documentation in cloud storage', completed: false }
          ]
        }
      },
      { 
        id: '5-2', 
        title: 'Review Insurance', 
        duration: '15 min', 
        completed: false,
        type: 'lesson',
        content: {
          text: `Understand your insurance coverage and consider earthquake insurance if you don't have it.`,
          checklistItems: [
            { id: 1, text: 'Review homeowners/renters policy', completed: false },
            { id: 2, text: 'Check earthquake insurance coverage', completed: false },
            { id: 3, text: 'Understand your deductible', completed: false },
            { id: 4, text: 'Know how to file a claim', completed: false }
          ],
          quizQuestions: [
            {
              id: 1,
              question: 'Is earthquake damage covered by standard homeowners insurance?',
              options: [
                'Yes, always',
                'No, you need separate earthquake insurance',
                'Only in California',
                'Only for renters'
              ],
              correctAnswer: 1
            }
          ]
        }
      },
    ]
  },
];

// Helper function to get lesson data by ID
export const getLessonById = (lessonId) => {
  for (const module of PREPARE_MODULES) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
};

// Helper function to get module data by ID
export const getModuleById = (moduleId) => {
  return PREPARE_MODULES.find(module => module.id === moduleId);
};