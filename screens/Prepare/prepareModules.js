import { getCompletionState } from './prepareModulesCompletion';

/* Lessons and Modules for prepare page*/
export const PREPARE_MODULES = [
    {
        id: '1',
        title: 'Understand Earthquakes',
        icon: 'brain',
        description: 'Know your risk and the science',
        lessons: [
            {
                id: '1-1',
                title: 'How Earthquakes Work',
                duration: '10 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '1-1-p1',
                            type: 'text',
                            title: 'What Causes Earthquakes',
                            body: `Earthquakes occur when stress builds up along fractures in the Earth's crust, called faults, and is suddenly released. The Earth's crust is divided into massive slabs called tectonic plates, which slowly move relative to one another. When these plates grind, collide, or slide past each other, they create stress along faults. When the stress exceeds the friction holding the rocks together, the rocks slip, sending seismic waves through the ground — shaking the surface.

Key Concepts:
• Faults: Fractures in the Earth's crust where movement occurs.
• Epicenter: The point on the surface directly above the quake's origin.
• Hypocenter (Focus): The actual subsurface origin of the quake.
• Magnitude: Measures the energy released by the quake. A one-unit increase (e.g., 6.0 → 7.0) represents ~32 times more energy.
• Intensity: How strong the shaking feels in a particular location.`
                        },
                        {
                            id: '1-1-p2',
                            type: 'text',
                            title: 'Types of Earthquakes',
                            body: `Not all earthquakes are the same. Shallow quakes (0–70 km deep) usually cause the most damage because energy reaches the surface with little dissipation. Deep quakes can be strong but often affect wider areas with less surface damage.

Shaking varies depending on:
• Distance from epicenter
• Local geology: Loose soils amplify shaking; bedrock reduces it.
• Building design: Older, unreinforced structures are most at risk.

Even minor quakes can be dangerous, especially in areas with poorly secured furniture, gas lines, or tall glass windows.`
                        },
                        {
                            id: '1-1-p3',
                            type: 'video',
                            title: 'Earthquake Video',
                            videoUrl: 'https://www.youtube.com/watch?v=cavq2HFBa-U',
                            description: 'Discover how tectonic plates and molten mantle create earthquakes and why some are stronger than others.'
                        },
                        {
                            id: '1-1-p4',
                            type: 'quiz',
                            title: 'Knowledge Check',
                            questions: [
                                {
                                    id: 1,
                                    question: 'What causes earthquakes?',
                                    options: [
                                        'Weather changes and temperature shifts',
                                        'Movement of tectonic plates along faults',
                                        'Volcanic eruptions only',
                                        'Ocean currents and tides'
                                    ],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'What is the epicenter of an earthquake?',
                                    options: [
                                        'The origin underground',
                                        'The point directly above the origin on the surface',
                                        'The strongest shaking zone',
                                        'The location of the nearest city'
                                    ],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: 'Which factor can amplify earthquake shaking locally?',
                                    options: [
                                        'Bedrock',
                                        'Loose soil',
                                        'Cold weather',
                                        'Wind speed'
                                    ],
                                    correctAnswer: 1
                                },
                                {
                                    id: 4,
                                    question: 'How much more energy is released when a magnitude 7.0 quake occurs compared to a 6.0?',
                                    options: ['10x', '32x', '100x', '2x'],
                                    correctAnswer: 1
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '1-2',
                title: 'Know Your Risk',
                duration: '15 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '1-2-p1',
                            type: 'text',
                            title: 'Regional Earthquake Risks',
                            body: `The United States faces diverse earthquake risks across multiple regions, with over 50% of Americans living in areas prone to damaging quakes. Understanding your regional risk is the first step toward safety.

High-Risk Regions & Statistics:
• California: 15,000+ known faults. The "Big One" on the San Andreas Fault could affect 25 million people and cause $200+ billion in damage
• Pacific Northwest: Cascadia Subduction Zone capable of magnitude 9+ quakes affecting 12 million people
• Alaska: 11% of world's earthquakes occur here, with 40,000+ quakes annually
• Central U.S.: New Madrid Seismic Zone caused major quakes in 1811-1812
• Utah: Wasatch Fault threatens 80% of Utah's population
• Northeast U.S.: Ancient faults affecting dense urban populations`
                        },
                        {
                            id: '1-2-p2',
                            type: 'text',
                            title: 'Earthquake Dangers & Hazards',
                            body: `Immediate Life-Threatening Dangers:
• Falling Hazards: Unsecured furniture and fixtures
• Structural Collapse: Older unreinforced buildings
• Flying Glass: Broken windows
• Gas Line Ruptures: Can lead to fires and poisoning

Secondary Hazards:
• Urban Fires
• Tsunamis
• Landslides & Rockslides
• Liquefaction
• Infrastructure Failure

Long-Term Challenges:
• Water Contamination
• Medical Crisis
• Communication Breakdown
• Economic Devastation`
                        },
                        {
                            id: '1-2-p3',
                            type: 'video',
                            title: 'Earthquake Risk Video',
                            videoUrl: 'https://www.youtube.com/watch?v=3sWLGL6gsbM',
                            description: 'Learn about San Francisco Bay Area’s growing earthquake risk.'
                        },
                        {
                            id: '1-2-p4',
                            type: 'quiz',
                            title: 'Risk Quiz',
                            questions: [
                                {
                                    id: 1,
                                    question: 'Which U.S. state has the highest earthquake risk with over 15,000 known faults?',
                                    options: ['Alaska', 'California', 'Utah', 'Washington'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'What percentage of Americans live in earthquake-prone areas?',
                                    options: ['25%', 'Over 50%', '75%', '10%'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: 'Which of these is considered an immediate life-threatening danger during earthquakes?',
                                    options: ['Economic devastation', 'Falling hazards', 'Communication breakdown', 'Job loss'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 4,
                                    question: 'What earthquake hazard occurs when solid ground turns to quicksand-like material?',
                                    options: ['Tsunamis', 'Landslides', 'Liquefaction', 'Urban fires'],
                                    correctAnswer: 2
                                },
                                {
                                    id: 5,
                                    question: 'The "Big One" on California\'s San Andreas Fault could affect how many people?',
                                    options: ['5 million', '12 million', '25 million', '40 million'],
                                    correctAnswer: 2
                                },
                                {
                                    id: 6,
                                    question: 'Which secondary hazard can be triggered by coastal earthquakes and travel inland at highway speeds?',
                                    options: ['Landslides', 'Tsunamis', 'Liquefaction', 'Urban fires'],
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
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '1-3-p1',
                            type: 'text',
                            title: 'Common Misconceptions',
                            body: `Misunderstanding earthquake safety can dramatically increase your risk. Many common myths persist that could put you in danger during and after an earthquake.

Dangerous Myths Debunked:
• "Stand in a doorway — it's the safest place." → FACT: Drop, Cover, and Hold On under sturdy furniture is safe.
• "Earthquakes only happen along the coast." → FACT: Faults exist throughout the US.
• "Small earthquakes prevent big ones." → FACT: Minor quakes don't prevent larger ones.
• "We can predict earthquakes precisely." → FACT: Only probabilities can be forecasted.
• "California will fall into the ocean during the Big One." → FACT: Geologically impossible.
• "The ground opens up and swallows people during quakes." → FACT: Most damage comes from shaking, not chasms.`
                        }
                    ]
                }
            },
            {
                id: '1-4',
                title: 'Staying Safe',
                duration: '15 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '1-4-p1',
                            type: 'text',
                            title: 'Before an Earthquake – Preparation',
                            body: `Secure your space, create emergency plans, and build emergency kits.

Key Steps:
• Anchor furniture and appliances
• Identify safe spots and meeting places
• Practice "Drop, Cover, and Hold On"
• Plan for pets
• Build home, go-bag, and car kits`
                        },
                        {
                            id: '1-4-p2',
                            type: 'video',
                            title: 'FEMA Safety Video',
                            videoUrl: 'https://www.youtube.com/watch?v=MKILThtPxQs',
                            description: 'Watch a short video on the damage earthquakes can cause.'
                        },
                        {
                            id: '1-4-p3',
                            type: 'quiz',
                            title: 'Preparation Quiz',
                            questions: [
                                {
                                    id: 1,
                                    question: 'What is the recommended water supply for your home emergency kit?',
                                    options: ['3-day supply', '1-week supply', '2-week supply', '1-month supply'],
                                    correctAnswer: 2
                                },
                                {
                                    id: 2,
                                    question: 'How often should you practice "Drop, Cover, and Hold On" drills?',
                                    options: ['Every month', 'Every year', 'Every six months', 'Only once'],
                                    correctAnswer: 2
                                },
                                {
                                    id: 3,
                                    question: 'Where should you place heavy objects in your home?',
                                    options: ['High shelves', 'Middle shelves', 'Lower shelves', 'On the floor'],
                                    correctAnswer: 2
                                },
                                {
                                    id: 4,
                                    question: 'What should you include in your emergency plan for pets?',
                                    options: [
                                        'Leave them behind',
                                        'Include them in evacuation plans',
                                        'Prepare a pet emergency kit',
                                        'Arrange care with neighbors'
                                    ],
                                    correctAnswer: 1
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        id: '2',
        title: 'Make Your Plan',
        icon: 'clipboard-list',
        description: 'Create your emergency plan',
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

// Ensure default progress fields for backward compatibility (synchronous UIs)
PREPARE_MODULES.forEach(m => {
    if (typeof m.progress !== 'number') m.progress = 0;
    if (!Array.isArray(m.lessons)) return;
    m.lessons.forEach(l => {
        if (typeof l.progress !== 'number') l.progress = 0;
    });
});

/**
 * Return PREPARE_MODULES augmented with completion info and computed progress.
 * - lesson.progress = pagesCompleted / pageCount
 * - module.progress = totalCompletedPages / totalPages (weighted by pages)
 */
 export const getModulesWithCompletion = async () => {
     const state = await getCompletionState();

    // Helper to compute page completions from a lesson when no state is available
    const computeCompletedPagesFromCatalog = (lesson) => {
        const pages = (lesson.content && Array.isArray(lesson.content.pages)) ? lesson.content.pages : [];
        let completed = 0;
        for (const p of pages) {
            if (p.completed === true) {
                completed += 1;
                continue;
            }
            if (p.type === 'checklist' && Array.isArray(p.items)) {
                const all = p.items.every(it => it.completed === true);
                if (all) completed += 1;
            }
            // quiz/video/text require explicit completed flag to count as complete in static catalog
        }
        return { completed, total: pages.length };
    };

    return PREPARE_MODULES.map((m) => {
        const moduleState = state?.modules?.[m.id] || null;

        let totalPages = 0;
        let totalCompletedPages = 0;

        const lessons = Array.isArray(m.lessons) ? m.lessons.map((l) => {
            let pageCount = (l.content && Array.isArray(l.content.pages)) ? l.content.pages.length : 0;
            pageCount = Number(pageCount) || 0;
            totalPages += pageCount;

            let pagesCompleted = 0;
            let completedFlag = false;
            let currentPageIndex = 0;

            if (moduleState) {
                const lState = moduleState.lessons?.[l.id] || {};
                completedFlag = !!lState.completed;
                currentPageIndex = Number(lState.currentPageIndex ?? 0) || 0;
                pagesCompleted = completedFlag ? pageCount : Math.max(0, Math.min(currentPageIndex, pageCount));
            } else {
                // no persisted state: infer from static catalog where possible
                const inferred = computeCompletedPagesFromCatalog(l);
                pagesCompleted = Number(inferred.completed) || 0;
                const inferredTotal = Number(inferred.total) || 0;
                completedFlag = inferredTotal > 0 && (Number(inferred.completed) >= inferredTotal);
                currentPageIndex = pagesCompleted; // best-effort
            }

            totalCompletedPages += Number(pagesCompleted) || 0;

            const lessonProgressRaw = pageCount > 0 ? (pagesCompleted / pageCount) : (completedFlag ? 1 : 0);
            const lessonProgress = (Number(lessonProgressRaw) && isFinite(lessonProgressRaw)) ? Number(lessonProgressRaw) : (lessonProgressRaw === 0 ? 0 : Number(0));

            return {
                ...l,
                pageCount,
                currentPageIndex,
                completed: completedFlag,
                progress: lessonProgress || 0,
            };
        }) : [];

        let moduleProgress = 0;
        if (Number(totalPages) > 0) {
            moduleProgress = Number(totalCompletedPages) / Number(totalPages);
        } else if (lessons.length > 0) {
            moduleProgress = lessons.filter(ln => ln.completed).length / lessons.length;
        }
        if (!isFinite(moduleProgress) || Number.isNaN(moduleProgress)) {
            console.warn('prepareModules: computed NaN moduleProgress for module', m.id, { totalPages, totalCompletedPages, lessonsCount: lessons.length });
            moduleProgress = 0;
        }

        // final coercion
        moduleProgress = Number(moduleProgress) || 0;

        return {
            ...m,
            lessons,
            completed: moduleState ? !!moduleState.completed : m.completed || false,
            progress: moduleProgress || 0,
        };
    });
};

export const getPrepareModules = async () => {
    return await getModulesWithCompletion();
};

/**
 * Return computed progress for a module (0..1)
 */
export const getModuleProgress = async (moduleId) => {
    const modules = await getModulesWithCompletion();
    const m = modules.find(mm => mm.id === moduleId);
    return m ? (m.progress ?? 0) : 0;
};

/**
 * Return computed progress for a lesson (0..1)
 */
export const getLessonProgress = async (lessonId) => {
    const modules = await getModulesWithCompletion();
    for (const m of modules) {
        const l = m.lessons.find(ll => ll.id === lessonId);
        if (l) return l.progress ?? 0;
    }
    return 0;
};

/**
 * Get lesson by ID
 * - ensures synchronous consumers can find lessons/modules by ID
 */
 export const getLessonById = (lessonId) => {
    for (const module of PREPARE_MODULES) {
        const lesson = module.lessons.find(l => l.id === lessonId);
        if (lesson) {
            console.log('prepareModules: getLessonById -> found', lessonId);
            return lesson;
        }
    }
    console.warn('prepareModules: getLessonById -> not found', lessonId);
    return null;
 };
 
 // Helper function to get module data by ID
 export const getModuleById = (moduleId) => {
    const m = PREPARE_MODULES.find(module => module.id === moduleId) || null;
    if (m) console.log('prepareModules: getModuleById -> found', moduleId);
    else console.warn('prepareModules: getModuleById -> not found', moduleId);
    return m;
 };
 
 // synchronous access to the static catalog for components that import PREPARE_MODULES synchronously
 export const getCatalogModules = () => PREPARE_MODULES;
 
 // default export for backward compatibility
 export default PREPARE_MODULES;

// Normalize lesson pages: prefer content.pages, ensure each page has an id, and normalize field names
export const getLessonPages = (lesson) => {
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
            body: page.body || page.text || null,
            videoUrl: page.videoUrl || page.url || null,
            items: page.items || page.checklistItems || null,
            questions: page.questions || page.quizQuestions || null,
            description: page.description || page.caption || '',
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

        // For quiz, video, and text pages treat as incomplete unless flagged
        if (p.type === 'quiz' || p.type === 'video' || p.type === 'text') return i;

        if (!p.completed) return i;
    }
    return 0;
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