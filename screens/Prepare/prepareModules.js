import { getCompletionState } from './prepareModulesCompletion';

/* Lessons and Modules for prepare page*/
export const PREPARE_MODULES = [
    {
        id: '1',
        title: 'Understand Earthquakes',
        icon: 'brain',
        description: 'Know your risk and the science',
        progress: 0.4,
        lessons: [
            {
                id: '1-1',
                title: 'How Earthquakes Work',
                duration: '5 min',
                type: 'lesson',
                content: {
                    // New: pages array to allow multiple pages per lesson (ordered)
                    pages: [
                        {
                            id: '1-1-p1',
                            type: 'text',
                            title: 'How Earthquakes Work',
                            body: `Earthquakes are caused by the sudden movement of tectonic plates beneath the Earth's surface. These plates are constantly moving, but sometimes they get stuck at their edges due to friction. When the stress on the edge overcomes the friction, there is an earthquake that releases energy in waves that travel through the earth's crust.

Key Concepts:\n• Tectonic Plates: Large pieces of Earth's crust\n• Fault Lines: Where plates meet and can slip\n• Epicenter: Point on surface directly above where quake starts\n• Magnitude: Measures energy released\n\nRemember: Even small earthquakes can be warning signs for larger ones. Always be prepared!`,
                        },
                        {
                            id: '1-1-p2',
                            type: 'text',
                            title: 'How d Work',
                            body: `Earthquakes are caused by the sudden movement of tectonic plates beneath the Earth's surface. These plates are constantly moving, but sometimes they get stuck at their edges due to friction. When the stress on the edge overcomes the friction, there is an earthquake that releases energy in waves that travel through the earth's crust.

Key Concepts:\n• Tectonic Plates: Large pieces of Earth's crust\n• Fault Lines: Where plates meet and can slip\n• Epicenter: Point on surface directly above where quake starts\n• Magnitude: Measures energy released\n\nRemember: Even small earthquakes can be warning signs for larger ones. Always be prepared!`,
                        },
                        {
                            id: '1-1-p3',
                            type: 'video',
                            title: 'Explainer Video',
                            videoUrl: 'earthquake_science'
                        },
                        {
                            id: '1-1-p4',
                            type: 'checklist',
                            title: 'Quick Checklist',
                            items: [
                                { id: 1, text: 'Understand plate tectonics basics', completed: false },
                                { id: 2, text: 'Learn about fault lines in your area', completed: false },
                                { id: 3, text: 'Know the difference between magnitude and intensity', completed: false }
                            ]
                        },
                        {
                            id: '1-1-p5',
                            type: 'quiz',
                            title: 'Knowledge Check',
                            questions: [
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
                        },
                    ]
                }
            },
            {
                id: '1-2',
                title: 'Know Your Risk',
                duration: '8 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '1-2-p1',
                            type: 'text',
                            title: 'Know Your Risk',
                            body: `Understanding your local earthquake risk is crucial for proper preparation. Different regions face different levels of seismic activity based on their proximity to fault lines and geological conditions.\n\nCalifornia-Specific Risks:\n• San Andreas Fault System\n• Hayward Fault in Bay Area\n• Cascadia Subduction Zone potential\n• Local soil conditions affecting shaking intensity\n\nCheck your area's seismic hazard maps and know if you're in a liquefaction zone or landslide-prone area.`
                        },
                        {
                            id: '1-2-p2',
                            type: 'video',
                            title: 'Local Risks Video',
                            videoUrl: 'local_risks'
                        },
                        {
                            id: '1-2-p3',
                            type: 'checklist',
                            title: 'Risk Checklist',
                            items: [
                                { id: 1, text: 'Research local fault lines', completed: false },
                                { id: 2, text: 'Check if you are in a liquefaction zone', completed: false },
                                { id: 3, text: 'Identify local emergency resources', completed: false }
                            ]
                        },
                        {
                            id: '1-2-p4',
                            type: 'quiz',
                            title: 'Risk Quiz',
                            questions: [
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
                    ]
                }
            },
            {
                id: '1-3',
                title: 'Myths vs Facts',
                duration: '5 min',
                type: 'quiz',
                content: {
                    pages: [
                        {
                            id: '1-3-p1',
                            type: 'text',
                            title: 'Myths vs Facts',
                            body: `Test your knowledge about common earthquake misconceptions. Knowing the facts could save your life!`
                        },
                        {
                            id: '1-3-p2',
                            type: 'quiz',
                            title: 'Myths Quiz',
                            questions: [
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
        lessons: [
            {
                id: '2-1',
                title: 'Learn the Basics',
                duration: '10 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '2-1-p1',
                            type: 'text',
                            title: 'Learn the Basics',
                            body: `Every family needs an earthquake plan. This lesson covers the essential elements everyone should include in their emergency plan.`
                        },
                        {
                            id: '2-1-p2',
                            type: 'checklist',
                            title: 'Basics Checklist',
                            items: [
                                { id: 1, text: 'Identify safe spots in each room', completed: true },
                                { id: 2, text: 'Choose two meeting places', completed: true },
                                { id: 3, text: 'Learn emergency contact numbers', completed: true }
                            ]
                        }
                    ]
                }
            },
            {
                id: '2-2',
                title: 'Define Contacts',
                duration: '15 min',
                type: 'checklist',
                content: {
                    pages: [
                        {
                            id: '2-2-p1',
                            type: 'text',
                            title: 'Define Contacts',
                            body: `Set up your emergency communication plan. Text messages often work when phone calls don't during emergencies.`
                        },
                        {
                            id: '2-2-p2',
                            type: 'checklist',
                            title: 'Contacts Checklist',
                            items: [
                                { id: 1, text: 'Choose an out-of-state contact person', completed: true },
                                { id: 2, text: 'Save emergency numbers in your phone', completed: true },
                                { id: 3, text: 'Practice texting family members', completed: true },
                                { id: 4, text: 'Set up group chat for family updates', completed: true }
                            ]
                        }
                    ]
                }
            },
            {
                id: '2-3',
                title: 'Practice Your Plan',
                duration: '5 min',
                type: 'practice',
                content: {
                    pages: [
                        {
                            id: '2-3-p1',
                            type: 'text',
                            title: 'Practice Your Plan',
                            body: `Run through your earthquake drill with family members. Practice makes perfect!`
                        },
                        {
                            id: '2-3-p2',
                            type: 'checklist',
                            title: 'Practice Checklist',
                            items: [
                                { id: 1, text: 'Conduct a family earthquake drill', completed: true },
                                { id: 2, text: 'Time how long it takes to get to safe spots', completed: true },
                                { id: 3, text: 'Review and improve your plan', completed: true }
                            ]
                        }
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
        lessons: [
            {
                id: '3-1',
                title: 'Go-Bag Essentials',
                duration: '20 min',
                type: 'checklist',
                content: {
                    pages: [
                        {
                            id: '3-1-p1',
                            type: 'text',
                            title: 'Go-Bag Essentials',
                            body: `Your go-bag should contain supplies to survive for at least 72 hours. Keep it by your door or in your car.`
                        },
                        {
                            id: '3-1-p2',
                            type: 'checklist',
                            title: 'Go-Bag Checklist',
                            items: [
                                { id: 1, text: 'Water (1 gallon per person per day)', completed: true },
                                { id: 2, text: 'Non-perishable food', completed: true },
                                { id: 3, text: 'First aid kit', completed: false },
                                { id: 4, text: 'Flashlight and batteries', completed: false },
                                { id: 5, text: 'Portable radio', completed: false },
                                { id: 6, text: 'Important documents copies', completed: false }
                            ]
                        }
                    ]
                }
            },
            {
                id: '3-2',
                title: 'Home Kit',
                duration: '25 min',
                type: 'checklist',
                content: {
                    pages: [
                        {
                            id: '3-2-p1',
                            type: 'text',
                            title: 'Home Kit',
                            body: `Your home emergency kit should support your family for up to two weeks.`
                        },
                        {
                            id: '3-2-p2',
                            type: 'checklist',
                            title: 'Home Kit Checklist',
                            items: [
                                { id: 1, text: 'Two-week water supply', completed: false },
                                { id: 2, text: 'Canned and dry foods', completed: false },
                                { id: 3, text: 'Manual can opener', completed: false },
                                { id: 4, text: 'Cooking supplies', completed: false },
                                { id: 5, text: 'Sanitation supplies', completed: false }
                            ]
                        }
                    ]
                }
            },
            {
                id: '3-3',
                title: 'Car Kit',
                duration: '15 min',
                type: 'checklist',
                content: {
                    pages: [
                        {
                            id: '3-3-p1',
                            type: 'text',
                            title: 'Car Kit',
                            body: `Keep emergency supplies in your vehicle in case you're away from home during a quake.`
                        },
                        {
                            id: '3-3-p2',
                            type: 'checklist',
                            title: 'Car Kit Checklist',
                            items: [
                                { id: 1, text: 'Emergency blanket', completed: false },
                                { id: 2, text: 'Jumper cables', completed: false },
                                { id: 3, text: 'Road flares', completed: false },
                                { id: 4, text: 'Basic tools', completed: false },
                                { id: 5, text: 'Water and snacks', completed: false }
                            ]
                        }
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
        lessons: [
            {
                id: '4-1',
                title: 'Identify Hazards',
                duration: '15 min',
                type: 'checklist',
                content: {
                    pages: [
                        {
                            id: '4-1-p1',
                            type: 'text',
                            title: 'Identify Hazards',
                            body: `Walk through your home room by room to identify potential earthquake hazards.`
                        },
                        {
                            id: '4-1-p2',
                            type: 'checklist',
                            title: 'Hazards Checklist',
                            items: [
                                { id: 1, text: 'Secure tall furniture to walls', completed: false },
                                { id: 2, text: 'Move heavy objects to lower shelves', completed: false },
                                { id: 3, text: 'Check for unsecured water heater', completed: false },
                                { id: 4, text: 'Identify broken glass risks', completed: false },
                                { id: 5, text: 'Secure overhead light fixtures', completed: false }
                            ]
                        }
                    ]
                }
            },
            {
                id: '4-2',
                title: 'Shut Off Utilities',
                duration: '10 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '4-2-p1',
                            type: 'text',
                            title: 'Shut Off Utilities',
                            body: `Learn how and when to shut off your gas, water, and electricity after an earthquake.`
                        },
                        {
                            id: '4-2-p2',
                            type: 'video',
                            title: 'Utility Shutoff',
                            videoUrl: 'utility_shutoff'
                        },
                        {
                            id: '4-2-p3',
                            type: 'checklist',
                            title: 'Utility Checklist',
                            items: [
                                { id: 1, text: 'Locate gas shut-off valve', completed: false },
                                { id: 2, text: 'Find main water shut-off', completed: false },
                                { id: 3, text: 'Identify circuit breaker', completed: false },
                                { id: 4, text: 'Practice shutting off utilities', completed: false }
                            ]
                        },
                        {
                            id: '4-2-p4',
                            type: 'quiz',
                            title: 'Utility Quiz',
                            questions: [
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
        lessons: [
            {
                id: '5-1',
                title: 'Document Belongings',
                duration: '30 min',
                type: 'checklist',
                content: {
                    pages: [
                        {
                            id: '5-1-p1',
                            type: 'text',
                            title: 'Document Belongings',
                            body: `Create a home inventory for insurance purposes. Take photos or videos of your belongings.`
                        },
                        {
                            id: '5-1-p2',
                            type: 'checklist',
                            title: 'Inventory Checklist',
                            items: [
                                { id: 1, text: 'Photograph each room', completed: false },
                                { id: 2, text: 'Document valuable items', completed: false },
                                { id: 3, text: 'Keep receipts for major purchases', completed: false },
                                { id: 4, text: 'Store documentation in cloud storage', completed: false }
                            ]
                        }
                    ]
                }
            },
            {
                id: '5-2',
                title: 'Review Insurance',
                duration: '15 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '5-2-p1',
                            type: 'text',
                            title: 'Review Insurance',
                            body: `Understand your insurance coverage and consider earthquake insurance if you don't have it.`
                        },
                        {
                            id: '5-2-p2',
                            type: 'checklist',
                            title: 'Insurance Checklist',
                            items: [
                                { id: 1, text: 'Review homeowners/renters policy', completed: false },
                                { id: 2, text: 'Check earthquake insurance coverage', completed: false },
                                { id: 3, text: 'Understand your deductible', completed: false },
                                { id: 4, text: 'Know how to file a claim', completed: false }
                            ]
                        },
                        {
                            id: '5-2-p3',
                            type: 'quiz',
                            title: 'Insurance Quiz',
                            questions: [
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

// Normalize lesson pages: prefer content.pages, ensure each page has an id, and normalize field names
export const getLessonPages = (lesson) => {
    // If lesson or content missing, return empty
    if (!lesson || !lesson.content) return [];

    const pages = lesson.content.pages;
    if (!Array.isArray(pages) || pages.length === 0) return [];

    return pages.map((page, idx) => {
        const id = page.id || `${lesson.id}-p${idx + 1}`;
        const type = page.type || 'text';
        return {
            id,
            type,
            title: page.title || lesson.title || '',
            // unify content keys so the renderer can use consistent field names
            body: page.body || page.text || null,
            videoUrl: page.videoUrl || page.url || null,
            items: page.items || page.checklistItems || null,
            questions: page.questions || page.quizQuestions || null,
            // pass-through any explicitly provided completed flag
            completed: page.completed === true,
        };
    });
};

// Finds the first incomplete page index for a lesson's pages. Returns 0 if none found.
export const findFirstIncompletePageIndex = (lesson) => {
    const pages = getLessonPages(lesson);
    for (let i = 0; i < pages.length; i++) {
        const p = pages[i];
        if (p.completed) continue;

        // For checklist pages, consider completed if all items have completed === true
        if (p.type === 'checklist' && Array.isArray(p.items)) {
            const all = p.items.every(it => it.completed === true);
            if (!all) return i; else continue;
        }

        // For quiz pages, we can't determine completion without saved state; treat as incomplete unless flagged
        if (p.type === 'quiz') return i;

        // For video pages, treat as incomplete unless flagged completed
        if (p.type === 'video') return i;

        // For text pages, treat as incomplete unless flagged
        if (p.type === 'text') return i;

        // default: return first not explicitly completed
        if (!p.completed) return i;
    }
    return 0;
};

/**
 * Return PREPARE_MODULES augmented with completion info from async storage/firebase.
 */
export const getModulesWithCompletion = async () => {
    const state = await getCompletionState();
    if (!state) return PREPARE_MODULES;

    return PREPARE_MODULES.map((m) => {
        const moduleState = state.modules?.[m.id] || {};
        // compute per-lesson progress and module progress
        const lessons = m.lessons.map((l) => {
            const lState = moduleState.lessons?.[l.id] || {};
            const pageCount = (l.content && Array.isArray(l.content.pages)) ? l.content.pages.length : 0;
            const currentIndex = lState.currentPageIndex ?? 0;
            let lessonProgress = 0;
            if (lState.completed) lessonProgress = 1;
            else if (pageCount > 0) lessonProgress = Math.max(0, Math.min(1, currentIndex / pageCount));
            return {
                ...l,
                completed: !!lState.completed,
                currentPageIndex: currentIndex,
                pageCount,
                progress: lessonProgress,
            };
        });

        // module progress = average of lesson progress
        const moduleProgress = lessons.length > 0 ? (lessons.reduce((s, ln) => s + (ln.progress || 0), 0) / lessons.length) : 0;

        return {
            ...m,
            completed: !!moduleState.completed,
            lessons,
            progress: moduleProgress,
        };
    });
};

/**
 * Async helper to find lesson completion object (moduleId and lesson state)
 */
export const getLessonCompletion = async (lessonId) => {
    const state = await getCompletionState();
    if (!state || !state.modules) return null;
    for (const moduleId of Object.keys(state.modules)) {
        const lessons = state.modules[moduleId].lessons || {};
        if (lessons[lessonId]) {
            return { moduleId, ...lessons[lessonId] };
        }
    }
    return null;
};

/**
 * Async helper to get module completion state
 */
export const getModuleCompletion = async (moduleId) => {
    const state = await getCompletionState();
    if (!state || !state.modules) return null;
    return state.modules[moduleId] || null;
};

/**
 * Async helper to get the saved current page index for a lesson
 */
export const getLessonCurrentPageIndex = async (lessonId) => {
    const comp = await getLessonCompletion(lessonId);
    return comp?.currentPageIndex ?? 0;
};

/**
 * Async helper to return the modules merged with persistent completion state.
 * Use this in UI code instead of importing PREPARE_MODULES directly when you
 * want the latest completion flags from AsyncStorage/Firebase.
 */
export const getPrepareModules = async () => {
    return await getModulesWithCompletion();
};