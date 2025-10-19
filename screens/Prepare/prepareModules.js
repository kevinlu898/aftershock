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
                            body: `<p>Earthquakes occur when stress builds up along fractures in the Earth's crust, called faults, and is suddenly released. The Earth's crust is divided into massive slabs called tectonic plates, which slowly move relative to one another. When these plates grind, collide, or slide past each other, they create stress along faults. When the stress exceeds the friction holding the rocks together, the rocks slip, sending seismic waves through the ground — shaking the surface.</p>

<h3>Key Concepts:</h3>
<ul>
<li><strong>Faults:</strong> Fractures in the Earth's crust where movement occurs.</li>
<li><strong>Epicenter:</strong> The point on the surface directly above the quake's origin.</li>
<li><strong>Hypocenter (Focus):</strong> The actual subsurface origin of the quake.</li>
<li><strong>Magnitude:</strong> Measures the energy released by the quake. A one-unit increase (e.g., 6.0 → 7.0) represents ~32 times more energy.</li>
<li><strong>Intensity:</strong> How strong the shaking feels in a particular location.</li>
</ul>`
                        },
                        {
                            id: '1-1-p2',
                            type: 'text',
                            title: 'Types of Earthquakes',
                            body: `<p>Not all earthquakes are the same. Shallow quakes (0–70 km deep) usually cause the most damage because energy reaches the surface with little dissipation. Deep quakes can be strong but often affect wider areas with less surface damage.</p>

<h3>Shaking varies depending on:</h3>
<ul>
<li><strong>Distance from epicenter</strong></li>
<li><strong>Local geology:</strong> Loose soils amplify shaking; bedrock reduces it.</li>
<li><strong>Building design:</strong> Older, unreinforced structures are most at risk.</li>
</ul>

<p>Even minor quakes can be dangerous, especially in areas with poorly secured furniture, gas lines, or tall glass windows.</p>`
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
                            body: `<p>The United States faces diverse earthquake risks across multiple regions, with over 50% of Americans living in areas prone to damaging quakes. Understanding your regional risk is the first step toward safety.</p>

<h3>High-Risk Regions & Statistics:</h3>
<ul>
<li><strong>California:</strong> 15,000+ known faults. The "Big One" on the San Andreas Fault could affect 25 million people and cause $200+ billion in damage</li>
<li><strong>Pacific Northwest:</strong> Cascadia Subduction Zone capable of magnitude 9+ quakes affecting 12 million people</li>
<li><strong>Alaska:</strong> 11% of world's earthquakes occur here, with 40,000+ quakes annually</li>
<li><strong>Central U.S.:</strong> New Madrid Seismic Zone caused major quakes in 1811-1812</li>
<li><strong>Utah:</strong> Wasatch Fault threatens 80% of Utah's population</li>
<li><strong>Northeast U.S.:</strong> Ancient faults affecting dense urban populations</li>
</ul>`
                        },
                        {
                            id: '1-2-p2',
                            type: 'text',
                            title: 'Earthquake Dangers & Hazards',
                            body: `<h3>Immediate Life-Threatening Dangers:</h3>
<ul>
<li><strong>Falling Hazards:</strong> Unsecured furniture and fixtures</li>
<li><strong>Structural Collapse:</strong> Older unreinforced buildings</li>
<li><strong>Flying Glass:</strong> Broken windows</li>
<li><strong>Gas Line Ruptures:</strong> Can lead to fires and poisoning</li>
</ul>

<h3>Secondary Hazards:</h3>
<ul>
<li>Urban Fires</li>
<li>Tsunamis</li>
<li>Landslides & Rockslides</li>
<li>Liquefaction</li>
<li>Infrastructure Failure</li>
</ul>

<h3>Long-Term Challenges:</h3>
<ul>
<li>Water Contamination</li>
<li>Medical Crisis</li>
<li>Communication Breakdown</li>
<li>Economic Devastation</li>
</ul>`
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
                            body: `<p>Misunderstanding earthquake safety can dramatically increase your risk. Many common myths persist that could put you in danger during and after an earthquake.</p>

<h3>Dangerous Myths Debunked:</h3>
<ul>
<li><strong>"Stand in a doorway — it's the safest place."</strong> → FACT: Drop, Cover, and Hold On under sturdy furniture is safe.</li>
<li><strong>"Earthquakes only happen along the coast."</strong> → FACT: Faults exist throughout the US.</li>
<li><strong>"Small earthquakes prevent big ones."</strong> → FACT: Minor quakes don't prevent larger ones.</li>
<li><strong>"We can predict earthquakes precisely."</strong> → FACT: Only probabilities can be forecasted.</li>
<li><strong>"California will fall into the ocean during the Big One."</strong> → FACT: Geologically impossible.</li>
<li><strong>"The ground opens up and swallows people during quakes."</strong> → FACT: Most damage comes from shaking, not chasms.</li>
</ul>`
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
                            body: `<p>Secure your space, create emergency plans, and build emergency kits.</p>

<h3>Key Steps:</h3>
<ul>
<li>Anchor furniture and appliances</li>
<li>Identify safe spots and meeting places</li>
<li>Practice "Drop, Cover, and Hold On"</li>
<li>Plan for pets</li>
<li>Build home, go-bag, and car kits</li>
</ul>`
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
                                    question: 'Where should heavy objects in your home?',
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
                            body: `<p>Every family needs an earthquake plan. This lesson covers the essential elements everyone should include in their emergency plan.</p>`
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
                            body: `<p>Set up your emergency communication plan. Text messages often work when phone calls don't during emergencies.</p>`
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
                            body: `<p>Run through your earthquake drill with family members. Practice makes perfect!</p>`
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
                duration: '15 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '3-1-p1',
                            type: 'text',
                            title: 'Your Grab-and-Go Survival Kit',
                            body: `<p>A Go-Bag is your immediate survival kit designed to sustain you for the first 72 hours after a disaster. Keep it lightweight, portable, and easily accessible near your primary exit.</p>

<h3>Key Principles:</h3>
<ul>
<li>Store in a durable, waterproof backpack</li>
<li>Keep it accessible (not buried in storage)</li>
<li>Weight under 25 pounds for easy carrying</li>
<li>Personalize for your family's specific needs</li>
<li>Check and refresh contents every 6 months</li>
</ul>`
                        },
                        {
                            id: '3-1-p2',
                            type: 'video',
                            title: 'How to Pack a Go-Bag',
                            videoUrl: 'https://www.youtube.com/watch?v=2lkFZ1sqa54',
                            description: 'City Prepping demonstrates how to pack and organize an effective Go-Bag for earthquakes.'
                        },
                        {
                            id: '3-1-p3',
                            type: 'text',
                            title: 'Essential Go-Bag Contents',
                            body: `<h3>Water & Food:</h3>
<ul>
<li>3 liters of water per person (or purification tablets)</li>
<li>3-day supply of non-perishable food</li>
<li>Manual can opener</li>
<li>High-energy snacks</li>
</ul>

<h3>Shelter & Warmth:</h3>
<ul>
<li>Emergency blanket or sleeping bag</li>
<li>Poncho or rain gear</li>
<li>Warm hat and gloves</li>
<li>Change of clothes</li>
</ul>

<h3>Light & Communication:</h3>
<ul>
<li>LED flashlight and extra batteries</li>
<li>Headlamp</li>
<li>Battery-powered or hand-crank radio</li>
<li>Whistle</li>
</ul>

<h3>First Aid & Health:</h3>
<ul>
<li>Comprehensive first aid kit</li>
<li>Personal medications (7-day supply)</li>
<li>Prescription copies</li>
<li>Hygiene items and N95 masks</li>
</ul>

<h3>Tools & Safety:</h3>
<ul>
<li>Multi-tool or pocket knife</li>
<li>Work gloves</li>
<li>Duct tape</li>
<li>Local maps</li>
<li>Emergency cash in small bills</li>
</ul>`
                        },
                        {
                            id: '3-1-p4',
                            type: 'text',
                            title: 'Personalize Your Go-Bag',
                            body: `<h3>Special Considerations:</h3>
<ul>
<li><strong>Infants:</strong> Formula, diapers, wipes, baby food</li>
<li><strong>Children:</strong> Comfort items, activities, favorite snacks</li>
<li><strong>Elderly:</strong> Medications, mobility aids</li>
<li><strong>Pets:</strong> Food, leash, carrier, vaccination records</li>
<li><strong>Medical needs:</strong> Insulin, epinephrine, oxygen</li>
</ul>

<h3>Important Documents:</h3>
<ul>
<li>Copies of ID, insurance, prescriptions</li>
<li>Emergency contact list</li>
<li>Photos of family members</li>
<li>Cash and coins</li>
</ul>`
                        },
                        {
                            id: '3-1-p5',
                            type: 'checklist',
                            title: 'Checklist: Go-Bag Essentials',
                            items: [
                                { id: 1, text: 'Water (3 liters per person)', completed: false },
                                { id: 2, text: '3-day food supply', completed: false },
                                { id: 3, text: 'First aid kit', completed: false },
                                { id: 4, text: 'Medications', completed: false },
                                { id: 5, text: 'Flashlight and batteries', completed: false },
                                { id: 6, text: 'Emergency radio', completed: false },
                                { id: 7, text: 'Warm clothing', completed: false },
                                { id: 8, text: 'Personal documents', completed: false },
                                { id: 9, text: 'Cash', completed: false },
                                { id: 10, text: 'Multi-tool', completed: false },
                                { id: 11, text: 'Personal hygiene items', completed: false },
                                { id: 12, text: 'Special needs items', completed: false }
                            ]
                        },
                        {
                            id: '3-1-p6',
                            type: 'quiz',
                            title: 'Go-Bag Knowledge',
                            questions: [
                                {
                                    id: 1,
                                    question: 'How long should your Go-Bag sustain you?',
                                    options: ['24 hours', '72 hours', '1 week', '2 weeks'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'Where should you store your Go-Bag?',
                                    options: ['Buried in storage', 'Near your primary exit', 'In the garage', 'At work only'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: "What's the maximum recommended weight for a Go-Bag?",
                                    options: ['15 pounds', '25 pounds', '40 pounds', '50 pounds'],
                                    correctAnswer: 1
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '3-2',
                title: 'Home Kit',
                duration: '20 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '3-2-p1',
                            type: 'text',
                            title: 'Comprehensive Home Preparedness',
                            body: `<p>Your home emergency kit should sustain your household for 7–14 days without outside assistance. This is your main supply for sheltering in place after a major earthquake.</p>

<h3>Storage Tips:</h3>
<ul>
<li>Use clear, stackable containers</li>
<li>Store in accessible, dry locations</li>
<li>Organize by category (food, medical, tools)</li>
<li>Rotate supplies every 6–12 months</li>
</ul>`
                        },
                        {
                            id: '3-2-p2',
                            type: 'video',
                            title: 'Building an Emergency Home Supply Kit',
                            videoUrl: 'https://www.youtube.com/watch?v=7lNFVpgRe-0',
                            description: 'A 4-minute guide on organizing and storing your long-term home emergency supplies.'
                        },
                        {
                            id: '3-2-p3',
                            type: 'text',
                            title: 'Home Kit Essentials',
                            body: `<h3>Water Supply:</h3>
<ul>
<li>1 gallon per person per day for 14 days</li>
<li>Purification tablets, filters, or bleach</li>
<li>Water storage containers</li>
</ul>

<h3>Food Supplies:</h3>
<ul>
<li>2-week supply of non-perishable food</li>
<li>Manual can opener</li>
<li>Camp stove with fuel</li>
<li>Eating utensils and plates</li>
<li>High-nutrition ready-to-eat meals</li>
</ul>

<h3>Medical & Sanitation:</h3>
<ul>
<li>Comprehensive first aid kit</li>
<li>30-day medication supply</li>
<li>Toilet paper, garbage bags, and hygiene items</li>
<li>Bleach for disinfection</li>
</ul>`
                        },
                        {
                            id: '3-2-p4',
                            type: 'text',
                            title: 'Comfort & Tools',
                            body: `<h3>Shelter & Comfort:</h3>
<ul>
<li>Sleeping bags or blankets</li>
<li>Extra clothes and sturdy shoes</li>
<li>Tent or tarp for outdoor shelter</li>
<li>Emergency heating source</li>
</ul>

<h3>Tools & Equipment:</h3>
<ul>
<li>Fire extinguisher, crowbar, shovel, rope</li>
<li>Work gloves and dust masks</li>
<li>Flashlights and batteries</li>
<li>Solar charger or power bank</li>
<li>Battery-powered radio</li>
</ul>`
                        },
                        {
                            id: '3-2-p5',
                            type: 'checklist',
                            title: 'Checklist: Home Kit Inventory',
                            items: [
                                { id: 1, text: '14-day water supply', completed: false },
                                { id: 2, text: '14-day food supply', completed: false },
                                { id: 3, text: 'Comprehensive first aid kit', completed: false },
                                { id: 4, text: '30-day medication supply', completed: false },
                                { id: 5, text: 'Sanitation supplies', completed: false },
                                { id: 6, text: 'Cooking equipment', completed: false },
                                { id: 7, text: 'Lighting sources', completed: false },
                                { id: 8, text: 'Communication devices', completed: false },
                                { id: 9, text: 'Tools and safety equipment', completed: false },
                                { id: 10, text: 'Warmth and shelter items', completed: false }
                            ]
                        },
                        {
                            id: '3-2-p6',
                            type: 'quiz',
                            title: 'Home Kit Preparedness',
                            questions: [
                                {
                                    id: 1,
                                    question: 'How long should your home kit sustain your family?',
                                    options: ['3 days', '7–14 days', '1 month', '2 months'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'What is the daily water requirement per person?',
                                    options: ['1 quart', '1 gallon', '2 gallons', '3 gallons'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: 'Why rotate supplies every 6–12 months?',
                                    options: ['To change brands', 'To prevent expiration', 'To save money', 'For better organization'],
                                    correctAnswer: 1
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '3-3',
                title: 'Car Kit',
                duration: '10 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '3-3-p1',
                            type: 'text',
                            title: 'Vehicle Emergency Preparedness',
                            body: `<p>A car kit ensures safety during earthquakes while traveling or evacuating. Keep it compact but complete.</p>

<h3>Storage Strategy:</h3>
<ul>
<li>Use a container that fits in your trunk</li>
<li>Secure items to prevent shifting</li>
<li>Adjust contents for the season</li>
<li>Keep your fuel tank at least half full</li>
</ul>`
                        },
                        {
                            id: '3-3-p2',
                            type: 'video',
                            title: 'Essential Car Emergency Kit Setup',
                            videoUrl: 'https://www.youtube.com/watch?v=RI17Eb7_rqg',
                            description: 'An 8-minute demonstration of organizing a complete car emergency kit.'
                        },
                        {
                            id: '3-3-p3',
                            type: 'text',
                            title: 'Car Kit Essentials',
                            body: `<h3>Basic Survival:</h3>
<ul>
<li>Bottled water and snacks</li>
<li>Warm blanket or sleeping bag</li>
<li>Extra warm clothing and sturdy shoes</li>
</ul>

<h3>Safety & Tools:</h3>
<ul>
<li>Jumper cables</li>
<li>Tire repair kit and air compressor</li>
<li>Basic tool kit</li>
<li>Flashlight with batteries</li>
<li>Reflective triangles or flares</li>
</ul>

<h3>Emergency Items:</h3>
<ul>
<li>First aid kit</li>
<li>Whistle</li>
<li>Local maps</li>
<li>Cash and coins</li>
<li>Phone charger and power bank</li>
</ul>`
                        },
                        {
                            id: '3-3-p4',
                            type: 'text',
                            title: 'Seasonal Considerations',
                            body: `<h3>Winter Additions:</h3>
<ul>
<li>Ice scraper and snow brush</li>
<li>Cat litter or sand for traction</li>
<li>Warm gloves and hat</li>
<li>Windshield washer fluid</li>
</ul>

<h3>Summer Additions:</h3>
<ul>
<li>Extra water</li>
<li>Sun protection and cooling towels</li>
<li>Battery-operated fan</li>
</ul>

<h3>Universal Additions:</h3>
<ul>
<li>Work gloves, multi-tool, duct tape</li>
<li>Emergency contact list</li>
</ul>`
                        },
                        {
                            id: '3-3-p5',
                            type: 'checklist',
                            title: 'Checklist: Car Kit Essentials',
                            items: [
                                { id: 1, text: 'Water and snacks', completed: false },
                                { id: 2, text: 'Warm blanket', completed: false },
                                { id: 3, text: 'First aid kit', completed: false },
                                { id: 4, text: 'Jumper cables', completed: false },
                                { id: 5, text: 'Basic tools', completed: false },
                                { id: 6, text: 'Flashlight', completed: false },
                                { id: 7, text: 'Reflective signals', completed: false },
                                { id: 8, text: 'Seasonal items', completed: false },
                                { id: 9, text: 'Emergency contacts', completed: false },
                                { id: 10, text: 'Cash', completed: false }
                            ]
                        },
                        {
                            id: '3-3-p6',
                            type: 'quiz',
                            title: 'Car Kit Safety',
                            questions: [
                                {
                                    id: 1,
                                    question: 'When should you keep your fuel tank filled?',
                                    options: ['Only before long trips', 'Always at least half full', 'When the light comes on', 'Once a month'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'What’s the most important reason for having a car kit?',
                                    options: ['Earthquakes while traveling', 'Routine maintenance', 'Impressing friends', 'Saving money'],
                                    correctAnswer: 0
                                },
                                {
                                    id: 3,
                                    question: 'Why include seasonal items in your car kit?',
                                    options: ['Changing weather conditions', 'More storage space', 'Legal requirements', 'Better organization'],
                                    correctAnswer: 0
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        id: '4',
        title: 'Secure Your Home',
        icon: 'home',
        description: 'Prevent hazards and damages',
        lessons: [
            {
                id: '4-1',
                title: 'Home Hazard Assessment',
                duration: '15 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '4-1-p1',
                            type: 'text',
                            title: 'Room-by-Room Safety Inspection',
                            body: `<p>Conducting a thorough home hazard assessment is your first step toward earthquake safety. This process helps identify potential dangers before an earthquake strikes.</p>

<h3>Assessment Principles:</h3>
<ul>
<li>Involve all household members in the inspection</li>
<li>Look at each room from an earthquake perspective</li>
<li>Consider both structural and non-structural hazards</li>
<li>Document findings with photos or notes</li>
<li>Prioritize fixes based on risk level</li>
</ul>`
                        },
                        {
                            id: '4-1-p2',
                            type: 'video',
                            title: 'Protect Your Home Against Earthquake',
                            videoUrl: 'https://www.youtube.com/watch?v=jWwCoWS3rVo',
                            description: 'A 3-minute video showing how to inspect each room of your home for earthquake hazards and prioritize fixes.'
                        },
                        {
                            id: '4-1-p3',
                            type: 'text',
                            title: 'Common Hazard Identification',
                            body: `<h3>Living Areas:</h3>
<ul>
<li>Unsecured bookshelves and cabinets</li>
<li>Heavy wall hangings and mirrors</li>
<li>Tall furniture that could tip over</li>
<li>Glass tables and overhead light fixtures</li>
</ul>

<h3>Kitchen & Bathroom:</h3>
<ul>
<li>Unsecured refrigerator and appliances</li>
<li>Overhead cabinet contents</li>
<li>Glass shower doors and mirrors</li>
<li>Water heater and gas connections</li>
</ul>

<h3>Bedrooms:</h3>
<ul>
<li>Heavy objects above beds</li>
<li>Unsecured dressers and wardrobes</li>
<li>Mirrors and wall decor near beds</li>
<li>Electronics on unstable surfaces</li>
</ul>`
                        },
                        {
                            id: '4-1-p4',
                            type: 'text',
                            title: 'Creating Your Home Safety Map',
                            body: `<h3>Mapping Process:</h3>
<ul>
<li>Draw a simple floor plan of your home</li>
<li>Mark hazardous items with red stickers</li>
<li>Identify safe zones in each room</li>
<li>Note emergency exits and alternatives</li>
<li>Locate utility shut-off points</li>
</ul>

<h3>Priority Categories:</h3>
<ul>
<li><strong>Immediate Hazards:</strong> Items that could cause injury or block exits</li>
<li><strong>Secondary Hazards:</strong> Items that could cause property damage</li>
<li><strong>Long-term Improvements:</strong> Structural upgrades needed</li>
</ul>`
                        },
                        {
                            id: '4-1-p5',
                            type: 'checklist',
                            title: 'Checklist: Home Hazard Assessment',
                            items: [
                                { id: 1, text: 'Living room hazards identified', completed: false },
                                { id: 2, text: 'Kitchen hazards identified', completed: false },
                                { id: 3, text: 'Bedroom hazards identified', completed: false },
                                { id: 4, text: 'Bathroom hazards identified', completed: false },
                                { id: 5, text: 'Utility areas hazards marked', completed: false },
                                { id: 6, text: 'Emergency exits mapped', completed: false },
                                { id: 7, text: 'Safe zones identified', completed: false },
                                { id: 8, text: 'Utility shut-off points noted', completed: false }
                            ]
                        },
                        {
                            id: '4-1-p6',
                            type: 'quiz',
                            title: 'Hazard Assessment Knowledge',
                            questions: [
                                {
                                    id: 1,
                                    question: 'What should you use to mark hazardous items during inspection?',
                                    options: ['Green stickers', 'Red stickers', 'Blue tape', 'Yellow flags'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'Which room typically has the most earthquake hazards?',
                                    options: ['Bedroom', 'Kitchen', 'Bathroom', 'Living room'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: 'Why involve all household members in the inspection?',
                                    options: [
                                        'Different perspectives spot different hazards',
                                        'To assign blame for clutter',
                                        'To speed up the process',
                                        'For entertainment value'
                                    ],
                                    correctAnswer: 0
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '4-2',
                title: 'Furniture & Appliance Securing',
                duration: '20 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '4-2-p1',
                            type: 'text',
                            title: 'Anchoring Tall Furniture',
                            body: `<p>Properly securing furniture prevents tip-overs that cause most earthquake injuries. Focus on items that could fall, block exits, or cause harm.</p>

<h3>Basic Securing Principles:</h3>
<ul>
<li>Anchor to wall studs, not just drywall</li>
<li>Use appropriate brackets for furniture type</li>
<li>Consider both earthquakes and child safety</li>
<li>Test stability after installation</li>
<li>Follow manufacturer recommendations</li>
</ul>`
                        },
                        {
                            id: '4-2-p2',
                            type: 'video',
                            title: 'How to Secure Furniture and Appliances',
                            videoUrl: 'https://www.youtube.com/watch?v=efl6-V7OjDc',
                            description: 'A demonstration on how to properly anchor furniture and heavy appliances.'
                        },
                        {
                            id: '4-2-p3',
                            type: 'text',
                            title: 'Furniture Securing Techniques',
                            body: `<h3>Bookshelves & Cabinets:</h3>
<ul>
<li>Use L-brackets or straps for top anchoring</li>
<li>Secure glass doors with safety film</li>
<li>Use museum putty for small items</li>
<li>Install lip guards on open shelves</li>
</ul>

<h3>Electronics & Appliances:</h3>
<ul>
<li>Secure televisions with anti-tip straps</li>
<li>Use Velcro or mounts for computers</li>
<li>Install latches on cabinet doors</li>
<li>Anchor refrigerators and heavy equipment</li>
</ul>`
                        },
                        {
                            id: '4-2-p4',
                            type: 'text',
                            title: 'Advanced Securing Methods',
                            body: `<h3>Heavy Furniture:</h3>
<ul>
<li>Piano and china cabinet bracing</li>
<li>File cabinet interlocks</li>
<li>Art and mirror safety hanging systems</li>
</ul>

<h3>Special Considerations:</h3>
<ul>
<li>Historic homes and rental properties</li>
<li>Temporary securing options</li>
<li>Child-proofing combined with quake safety</li>
<li>Furniture placement to avoid exit blockage</li>
</ul>`
                        },
                        {
                            id: '4-2-p5',
                            type: 'checklist',
                            title: 'Checklist: Furniture Securing',
                            items: [
                                { id: 1, text: 'Tall bookshelves secured to walls', completed: false },
                                { id: 2, text: 'Televisions and electronics anchored', completed: false },
                                { id: 3, text: 'Refrigerator and appliances secured', completed: false },
                                { id: 4, text: 'Cabinet doors latched', completed: false },
                                { id: 5, text: 'Heavy art and mirrors secured', completed: false },
                                { id: 6, text: 'Furniture not blocking exits', completed: false },
                                { id: 7, text: 'Shelf items secured with putty', completed: false },
                                { id: 8, text: 'All hardware inspected', completed: false }
                            ]
                        },
                        {
                            id: '4-2-p6',
                            type: 'quiz',
                            title: 'Furniture Safety',
                            questions: [
                                {
                                    id: 1,
                                    question: 'What should you anchor furniture to in walls?',
                                    options: ['Drywall only', 'Wall studs', 'Electrical wires', 'Pipes'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'Why use flexible straps for appliances?',
                                    options: ['They allow some movement', 'They’re cheaper', 'They’re invisible', 'They’re lighter'],
                                    correctAnswer: 0
                                },
                                {
                                    id: 3,
                                    question: 'What’s the main benefit of securing furniture?',
                                    options: [
                                        'Prevents most earthquake injuries',
                                        'Makes cleaning easier',
                                        'Improves home appearance',
                                        'Increases resale value'
                                    ],
                                    correctAnswer: 0
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '4-3',
                title: 'Structural Safety & Utilities',
                duration: '15 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '4-3-p1',
                            type: 'text',
                            title: 'Water Heater Securing',
                            body: `<p>Water heaters are particularly dangerous during earthquakes. If they fall or rupture, they can cause fires, gas leaks, and flooding.</p>

<h3>Critical Safety Steps:</h3>
<ul>
<li>Use two metal straps around the tank</li>
<li>Anchor to wall studs, not drywall</li>
<li>Install flexible gas and water connections</li>
<li>Maintain clearance from walls</li>
<li>Know how to shut off gas and water</li>
</ul>`
                        },
                        {
                            id: '4-3-p3',
                            type: 'text',
                            title: 'Utility Safety Measures',
                            body: `<h3>Gas Line Safety:</h3>
<ul>
<li>Install automatic gas shut-off valves</li>
<li>Use flexible gas connectors</li>
<li>Know where to turn off the gas manually</li>
</ul>

<h3>Electrical Safety:</h3>
<ul>
<li>Secure panels and large appliances</li>
<li>Know circuit breaker location</li>
<li>Consider surge protection</li>
</ul>

<h3>Water Safety:</h3>
<ul>
<li>Know main shut-off location</li>
<li>Secure water filtration and pumps</li>
<li>Anchor plumbing in crawl spaces</li>
</ul>`
                        },
                        {
                            id: '4-3-p4',
                            type: 'text',
                            title: 'Window and Glass Safety',
                            body: `<h3>Glass Hazard Reduction:</h3>
<ul>
<li>Apply safety film or use tempered glass</li>
<li>Secure mirrors and glass tables</li>
<li>Keep sleeping areas away from windows</li>
</ul>

<h3>Structural Reinforcement:</h3>
<ul>
<li>Brace cripple walls</li>
<li>Secure chimneys and masonry</li>
<li>Anchor house to foundation</li>
<li>Consult a professional for major work</li>
</ul>`
                        },
                        {
                            id: '4-3-p5',
                            type: 'checklist',
                            title: 'Checklist: Utility Safety',
                            items: [
                                { id: 1, text: 'Water heater strapped', completed: false },
                                { id: 2, text: 'Flexible gas connectors installed', completed: false },
                                { id: 3, text: 'Know gas shut-off valve location', completed: false },
                                { id: 4, text: 'Know main water shut-off', completed: false },
                                { id: 5, text: 'Know electrical panel location', completed: false },
                                { id: 6, text: 'Windows have safety film', completed: false },
                                { id: 7, text: 'Chimney or masonry reinforced', completed: false },
                                { id: 8, text: 'Emergency tools nearby', completed: false }
                            ]
                        },
                        {
                            id: '4-3-p6',
                            type: 'quiz',
                            title: 'Utility Safety',
                            questions: [
                                {
                                    id: 1,
                                    question: 'Why are water heaters dangerous in earthquakes?',
                                    options: ['They can cause fires and gas leaks', 'They’re heavy', 'They block exits', 'They’re made of glass'],
                                    correctAnswer: 0
                                },
                                {
                                    id: 2,
                                    question: 'What type of gas connectors should appliances have?',
                                    options: ['Rigid pipes', 'Flexible connectors', 'Plastic tubing', 'Rubber hoses'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: 'What’s the purpose of window safety film?',
                                    options: ['To contain broken glass', 'To darken rooms', 'To insulate windows', 'To reduce glare'],
                                    correctAnswer: 0
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '4-4',
                title: 'Outdoor & Property Safety',
                duration: '15 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '4-4-p1',
                            type: 'text',
                            title: 'Securing Exterior Hazards',
                            body: `<p>Outdoor areas contain significant earthquake hazards that can block exits or injure people. A quick inspection can greatly reduce these risks.</p>

<h3>Exterior Hazard Assessment:</h3>
<ul>
<li>Walk around your property systematically</li>
<li>Look for potential falling hazards</li>
<li>Identify exit path obstructions</li>
<li>Involve neighbors for community safety</li>
</ul>`
                        },
                        {
                            id: '4-4-p3',
                            type: 'text',
                            title: 'Garage and Storage Safety',
                            body: `<h3>Garage Hazards:</h3>
<ul>
<li>Anchor shelving and storage units</li>
<li>Secure hazardous materials and fuel</li>
<li>Ensure manual garage door release</li>
<li>Keep vehicles ready for evacuation</li>
</ul>

<h3>Storage Tips:</h3>
<ul>
<li>Organize supplies</li>
<li>Label hazardous materials</li>
<li>Maintain clear access to emergency gear</li>
</ul>`
                        },
                        {
                            id: '4-4-p4',
                            type: 'text',
                            title: 'Landscape and Tree Safety',
                            body: `<h3>Tree and Plant Management:</h3>
<ul>
<li>Trim overhanging branches</li>
<li>Anchor outdoor furniture and structures</li>
<li>Maintain clear evacuation paths</li>
<li>Avoid planting trees too close to foundations</li>
</ul>`
                        },
                        {
                            id: '4-4-p5',
                            type: 'checklist',
                            title: 'Checklist: Outdoor Safety',
                            items: [
                                { id: 1, text: 'Garage hazards secured', completed: false },
                                { id: 2, text: 'Storage areas anchored', completed: false },
                                { id: 3, text: 'Hazardous materials stored safely', completed: false },
                                { id: 4, text: 'Trees trimmed', completed: false },
                                { id: 5, text: 'Outdoor furniture secured', completed: false },
                                { id: 6, text: 'Evacuation paths clear', completed: false },
                                { id: 7, text: 'Emergency supplies accessible', completed: false },
                                { id: 8, text: 'Vehicle readiness checked', completed: false }
                            ]
                        },
                        {
                            id: '4-4-p6',
                            type: 'quiz',
                            title: 'Outdoor Safety',
                            questions: [
                                {
                                    id: 1,
                                    question: 'Why trim overhanging branches?',
                                    options: ['To prevent blocking exits', 'To improve appearance', 'To reduce shade', 'To encourage growth'],
                                    correctAnswer: 0
                                },
                                {
                                    id: 2,
                                    question: 'How should propane tanks be stored?',
                                    options: ['Upright and outside', 'Lying down in garage', 'Buried underground', 'Inside house'],
                                    correctAnswer: 0
                                },
                                {
                                    id: 3,
                                    question: 'Why maintain clear evacuation paths?',
                                    options: ['For safe exit during emergencies', 'For landscaping', 'For gardening', 'For convenience'],
                                    correctAnswer: 0
                                }
                            ]
                        }
                    ]
                }
            }
        ]
    },
    {
        id: '5',
        title: 'Finalize and Review',
        icon: 'check-circle',
        description: 'Review, strengthen, and finalize your preparedness plan',
        lessons: [
            {
                id: '5-1',
                title: 'Review Plans',
                duration: '10 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '5-1-p1',
                            type: 'text',
                            title: 'Why Review Your Plan',
                            body: `<p>Even with a completed plan, reviewing it ensures it stays relevant, practical, and actionable. Practicing and revisiting your plan strengthens confidence and preparedness.</p>

<h3>Key Points:</h3>
<ul>
<li>Review safe spots, meeting points, and contact info</li>
<li>Reassess special needs for household members, pets, and medical conditions</li>
<li>Update after major life changes (moving, adding new family members)</li>
<li>Identify gaps or risks not considered previously</li>
</ul>`
                        },
                        {
                            id: '5-1-p2',
                            type: 'checklist',
                            title: 'Checklist: Plan Review',
                            items: [
                                { id: 1, text: 'Reviewed safe spots in each room', completed: false },
                                { id: 2, text: 'Checked all meeting places', completed: false },
                                { id: 3, text: 'Confirmed emergency contacts', completed: false },
                                { id: 4, text: 'Updated Go-Bag contents', completed: false },
                                { id: 5, text: 'Reviewed plan after recent changes', completed: false }
                            ]
                        },
                        {
                            id: '5-1-p3',
                            type: 'quiz',
                            title: 'Plan Review Quiz',
                            questions: [
                                {
                                    id: 1,
                                    question: 'How often should you review your earthquake plan?',
                                    options: ['Only after earthquakes', 'Yearly or after life changes', 'Every month', 'Never'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'What is a key reason to review your plan?',
                                    options: ['To impress neighbors', 'To ensure it remains practical and updated', 'To spend time with family', 'To test your internet'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: 'Who should participate in reviewing the plan?',
                                    options: ['Adults only', 'All household members', 'Pets only', 'Neighbors'],
                                    correctAnswer: 1
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '5-2',
                title: 'Document Belongings',
                duration: '15 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '5-2-p1',
                            type: 'text',
                            title: 'Why Document Your Belongings',
                            body: `<p>Documenting your belongings ensures you can recover quickly and accurately after an earthquake. Insurance claims, replacement of lost items, and proof of ownership all become easier when you have organized records.</p>

<h3>Key Points:</h3>
<ul>
<li>Create a detailed inventory of all valuable items: electronics, appliances, jewelry, furniture, artwork, sentimental items</li>
<li>Include purchase dates, prices, serial numbers, and photos/videos</li>
<li>Store digital records securely on your device, cloud, or encrypted USB drive</li>
<li>Update regularly</li>
</ul>`
                        },
                        {
                            id: '5-2-p2',
                            type: 'video',
                            title: 'Documenting Your Belongings',
                            videoUrl: 'https://www.youtube.com/watch?v=wc9SG6FD8S0',
                            description: 'A disaster recovery specialist teaches you tips on documenting your property.'
                        },
                        {
                            id: '5-2-p3',
                            type: 'text',
                            title: 'Using Your Inventory for Recovery',
                            body: `<p>Inventory is only helpful if you can use it effectively.</p>

<h3>Steps for Recovery:</h3>
<ul>
<li><strong>Insurance Claims:</strong> Submit inventory with photos, receipts, and serial numbers</li>
<li><strong>Replacement Planning:</strong> Prioritize essential items first</li>
<li><strong>Sharing with Contacts:</strong> Give a copy to an out-of-area contact</li>
<li><strong>Regular Review:</strong> Update at least annually or after major changes</li>
</ul>`
                        },
                        {
                            id: '5-2-p4',
                            type: 'checklist',
                            title: 'Checklist: Inventory Readiness',
                            items: [
                                { id: 1, text: 'Take photos/videos of all rooms and belongings', completed: false },
                                { id: 2, text: 'Record item names, values, and serial numbers', completed: false },
                                { id: 3, text: 'Upload to secure storage (cloud/encrypted device)', completed: false },
                                { id: 4, text: 'Share with a trusted contact', completed: false },
                                { id: 5, text: 'Update inventory annually or after major purchases', completed: false }
                            ]
                        },
                        {
                            id: '5-2-p5',
                            type: 'quiz',
                            title: 'Inventory Quiz',
                            questions: [
                                {
                                    id: 1,
                                    question: 'Why document your belongings?',
                                    options: ['Impress neighbors', 'Simplify insurance claims', 'Sell items', 'Avoid taxes'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'Where should digital copies be stored?',
                                    options: ['Only phone', 'Cloud, local encrypted device, and trusted contact', 'Only wallet', 'Publicly online'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: 'How often should the inventory be updated?',
                                    options: ['Only when moving', 'Annually or after major purchases', 'Never', 'Only after earthquakes'],
                                    correctAnswer: 1
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '5-3',
                title: 'Financial Preparedness and Insurance',
                duration: '20 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '5-3-p1',
                            type: 'text',
                            title: 'Financial Preparedness',
                            body: `<p>Financial readiness gives you flexibility to respond to emergencies.</p>

<h3>Key Points:</h3>
<ul>
<li>Keep an emergency cash reserve (small bills in waterproof container)</li>
<li>Maintain accessible bank accounts with online access</li>
<li>Track important accounts, investments, and credit card info</li>
<li>Pre-arrange access to emergency funds for household members</li>
</ul>`
                        },
                        {
                            id: '5-3-p2',
                            type: 'checklist',
                            title: 'Checklist: Financial Preparedness',
                            items: [
                                { id: 1, text: 'Emergency cash stored securely', completed: false },
                                { id: 2, text: 'Bank accounts updated and accessible', completed: false },
                                { id: 3, text: 'List of critical financial information maintained', completed: false },
                                { id: 4, text: 'Plan for immediate expenses after earthquake', completed: false }
                            ]
                        },
                        {
                            id: '5-3-p3',
                            type: 'quiz',
                            title: 'Financial Preparedness Quiz',
                            questions: [
                                {
                                    id: 1,
                                    question: 'Why have an emergency cash reserve?',
                                    options: ['To pay bills normally', 'For essential purchases when electronic systems fail', 'To buy gifts', 'To invest in stocks'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'How should financial information be stored?',
                                    options: ['On sticky notes', 'Digitally and/or physically, securely', 'Only in your wallet', 'On social media'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: 'Who should have access to emergency funds?',
                                    options: ['Only adults', 'Trusted household members', 'Neighbors', 'No one'],
                                    correctAnswer: 1
                                }
                            ]
                        },
                        {
                            id: '5-3-p4',
                            type: 'text',
                            title: 'Insurance Recommendations',
                            body: `<p>Insurance helps you recover financially after damage.</p>

<h3>Key Points:</h3>
<ul>
<li><strong>Homeowner/Renter Insurance:</strong> Covers building damage and personal property</li>
<li><strong>Earthquake Insurance:</strong> Consider separate coverage if earthquakes are common in your area</li>
<li><strong>Auto Insurance:</strong> Covers damage to vehicles during quakes</li>
<li><strong>Health Insurance:</strong> Ensures access to medical care after disasters</li>
<li>Maintain copies of all policies, digitally and physically</li>
<li>Update policies annually or after major purchases</li>
</ul>`
                        },
                        {
                            id: '5-3-p5',
                            type: 'checklist',
                            title: 'Checklist: Insurance Readiness',
                            items: [
                                { id: 1, text: 'Home/renter insurance verified and updated', completed: false },
                                { id: 2, text: 'Earthquake coverage evaluated', completed: false },
                                { id: 3, text: 'Auto insurance reviewed', completed: false },
                                { id: 4, text: 'Health insurance cards and details accessible', completed: false },
                                { id: 5, text: 'Copies of all policies stored securely', completed: false }
                            ]
                        },
                        {
                            id: '5-3-p6',
                            type: 'quiz',
                            title: 'Insurance Quiz',
                            questions: [
                                {
                                    id: 1,
                                    question: 'What type of insurance specifically covers earthquake damage?',
                                    options: ['Health', 'Auto', 'Earthquake', 'Travel'],
                                    correctAnswer: 2
                                },
                                {
                                    id: 2,
                                    question: 'How often should insurance policies be reviewed?',
                                    options: ['Only after disaster', 'Annually or after major purchases', 'Never', 'Only when moving'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: 'Where should copies of insurance policies be stored?',
                                    options: ['Only in the cloud', 'Digital and physical, securely', 'Only at work', 'Memorized'],
                                    correctAnswer: 1
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '5-4',
                title: 'Mental Readiness',
                duration: '15 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '5-4-p1',
                            type: 'text',
                            title: 'Coping with Stress',
                            body: `<p>Being prepared reduces fear and panic. Practicing your plan builds confidence.</p>

<h3>Key Points:</h3>
<ul>
<li>Understand that fear is normal, but knowledge reduces anxiety</li>
<li>Breathing exercises help during shaking</li>
<li>Encourage household members to talk openly about feelings</li>
<li>Focus on what you can control: safe spots, Go-Bag, communication</li>
</ul>`
                        },
                        {
                            id: '5-4-p3',
                            type: 'text',
                            title: 'Mental Strength Practices',
                            body: `<h3>Exercises:</h3>
<ul>
<li>Simulate drills calmly; notice how you react</li>
<li>Visualize completing each step successfully</li>
<li>Practice positive reinforcement with household members</li>
<li>Encourage community participation — mental resilience spreads</li>
</ul>`
                        },
                        {
                            id: '5-4-p4',
                            type: 'checklist',
                            title: 'Checklist: Mental Readiness',
                            items: [
                                { id: 1, text: 'Household has practiced drills calmly', completed: false },
                                { id: 2, text: 'Members know calming techniques', completed: false },
                                { id: 3, text: 'Regular discussions about emergency feelings', completed: false },
                                { id: 4, text: 'Positive reinforcement after each practice', completed: false }
                            ]
                        },
                        {
                            id: '5-4-p5',
                            type: 'quiz',
                            title: 'Mental Readiness Quiz',
                            questions: [
                                {
                                    id: 1,
                                    question: 'Why is mental preparation important?',
                                    options: ['To memorize exits', 'To reduce panic and improve response', 'To predict earthquakes', 'To control neighbors'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'How can you calm yourself during shaking?',
                                    options: ['Run immediately', 'Breathing exercises and focusing on safe spots', 'Watch TV', 'Ignore the shaking'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 3,
                                    question: 'Should you fear earthquakes excessively?',
                                    options: ['Yes, always', 'No, knowledge and preparation reduce fear', 'Only if alone', 'Only during nighttime'],
                                    correctAnswer: 1
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '5-5',
                title: 'Community Strength',
                duration: '10 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '5-5-p1',
                            type: 'text',
                            title: 'Neighborhood Support',
                            body: `<p>A strong community helps everyone respond more effectively.</p>

<h3>Key Points:</h3>
<ul>
<li>Know your neighbors and their special needs</li>
<li>Share resources and skills (first aid, tools, evacuation info)</li>
<li>Establish local support networks for aftershocks</li>
<li>Volunteer with community preparedness programs</li>
</ul>`
                        },
                        {
                            id: '5-5-p2',
                            type: 'checklist',
                            title: 'Checklist: Community Engagement',
                            items: [
                                { id: 1, text: 'Met neighbors and exchanged contact info', completed: false },
                                { id: 2, text: 'Identified community meeting points', completed: false },
                                { id: 3, text: 'Shared skills/resources with neighbors', completed: false },
                                { id: 4, text: 'Joined local preparedness groups', completed: false }
                            ]
                        },
                        {
                            id: '5-5-p3',
                            type: 'quiz',
                            title: 'Community Strength Quiz',
                            questions: [
                                {
                                    id: 1,
                                    question: 'Why is community strength important after earthquakes?',
                                    options: ['To compete', 'To help everyone respond effectively', 'To reduce insurance costs', 'To socialize'],
                                    correctAnswer: 1
                                },
                                {
                                    id: 2,
                                    question: 'What can neighbors share for preparedness?',
                                    options: ['Food, tools, and skills', 'Pets only', 'Furniture', 'Furniture only'],
                                    correctAnswer: 0
                                },
                                {
                                    id: 3,
                                    question: 'How can you engage with your community?',
                                    options: ['Join local preparedness programs', 'Wait for government alerts', 'Avoid talking', 'Only during disasters'],
                                    correctAnswer: 0
                                }
                            ]
                        }
                    ]
                }
            },
            {
                id: '5-6',
                title: 'Stay Updated, Celebrate and Reflect',
                duration: '5 min',
                type: 'lesson',
                content: {
                    pages: [
                        {
                            id: '5-6-p1',
                            type: 'text',
                            title: 'Using Aftershock for Continuous Improvement',
                            body: `<p>The Aftershock app helps you keep your emergency preparedness up to date and connected with your household and community. Preparedness is ongoing, and Aftershock makes it easier to review, update, and share plans.</p>

<h3>Key Points:</h3>
<ul>
<li>Use Aftershock to store, access, and update your emergency plan anytime</li>
<li>Invite friends, family, and neighbors to join Aftershock and create their plans</li>
<li>Check Aftershock regularly for updates, safety tips, and new guidelines</li>
<li>Revisit and refine your plans based on drills, new hazards, or community feedback</li>
<li>Celebrate milestones and improvements in your preparedness through the app's tracking features</li>
</ul>`
                        }
                    ]
                }
            }
        ]
    }
];

// Helper function to convert plain text to HTML
const convertTextToHTML = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    // Replace bullet points with HTML lists
    let html = text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
        .trim();

    // Process sections with headings and bullet points
    const lines = html.split('\n');
    let inList = false;
    let processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            continue;
        }
        
        // Detect headings (lines ending with colon)
        if (line.endsWith(':')) {
            if (inList) {
                processedLines.push('</ul>');
                inList = false;
            }
            const headingText = line.slice(0, -1).trim();
            processedLines.push(`<h3>${headingText}</h3>`);
            continue;
        }
        
        // Detect bullet points
        if (/^[•\-\*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
            if (!inList) {
                processedLines.push('<ul>');
                inList = true;
            }
            const listItem = line.replace(/^[•\-\*]\s+/, '').replace(/^\d+\.\s+/, '').trim();
            processedLines.push(`<li>${listItem}</li>`);
            continue;
        }
        
        // Regular paragraph
        if (inList) {
            processedLines.push('</ul>');
            inList = false;
        }
        
        // Check if this is a bolded section (text with asterisks)
        if (/^\*\*.+\*\*$/.test(line)) {
            const boldText = line.replace(/\*\*/g, '').trim();
            processedLines.push(`<p><strong>${boldText}</strong></p>`);
        } else {
            processedLines.push(`<p>${line}</p>`);
        }
    }
    
    // Close any open list
    if (inList) {
        processedLines.push('</ul>');
    }
    
    return processedLines.join('\n');
};

// Prepare HTML fields for text pages (do not mutate original body)
// This ensures a separate html property is available for rendering
PREPARE_MODULES.forEach(module => {
    module.lessons.forEach(lesson => {
        if (lesson.content && Array.isArray(lesson.content.pages)) {
            lesson.content.pages.forEach(page => {
                if (page.type === 'text' && page.body) {
                    page.html = page.body.includes('<') ? page.body : convertTextToHTML(page.body);
                    // Replace the original body with the HTML version so data consumers can use page.body directly
                    page.body = page.html;
                }
            });
        }
    });
});

// Final pass: convert any plain-text page bodies into HTML (if not already HTML)
PREPARE_MODULES.forEach(module => {
    module.lessons.forEach(lesson => {
        if (!lesson.content || !Array.isArray(lesson.content.pages)) return;
        lesson.content.pages.forEach(page => {
            if (page.type !== 'text' || !page.body) return;
            const hasHtml = /<[^>]+>/i.test(page.body);
            if (!hasHtml) {
                page.html = convertTextToHTML(page.body);
                page.body = page.html;
            }
        });
    });
});

export const getModulesWithCompletion = async () => {
    const state = await getCompletionState();
    const modules = PREPARE_MODULES.map(m => {
        const mState = state?.modules?.[m.id] ?? {};
        const lessons = m.lessons.map(l => {
            const lState = mState.lessons?.[l.id] ?? {};
            return {
                ...l,
                progress: typeof lState.progress === 'number' ? lState.progress : (lState.completed ? 1 : 0),
                completed: !!lState.completed
            };
        });
        const progress = typeof mState.progress === 'number' ? mState.progress : (lessons.length ? lessons.reduce((s, ll) => s + (ll.progress ?? 0), 0) / lessons.length : 0);
        return {
            ...m,
            lessons,
            progress,
            completed: !!mState.completed
        };
    });
    return modules;
};

export const getLessonCompletion = async (lessonId) => {
    const state = await getCompletionState();
    if (!state || !state.modules) return null;
    for (const modId of Object.keys(state.modules)) {
        const mod = state.modules[modId];
        if (mod && mod.lessons && mod.lessons[lessonId]) return mod.lessons[lessonId];
    }
    return null;
};

export const getPrepareModules = async () => {
    return await getModulesWithCompletion();
};

export const getModuleProgress = async (moduleId) => {
    const modules = await getModulesWithCompletion();
    const m = modules.find(mm => mm.id === moduleId);
    return m ? (m.progress ?? 0) : 0;
};

export const getLessonProgress = async (lessonId) => {
    const modules = await getModulesWithCompletion();
    for (const m of modules) {
        const l = m.lessons.find(ll => ll.id === lessonId);
        if (l) return l.progress ?? 0;
    }
    return 0;
};

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

export const getModuleById = (moduleId) => {
    const m = PREPARE_MODULES.find(module => module.id === moduleId) || null;
    if (m) console.log('prepareModules: getModuleById -> found', moduleId);
    else console.warn('prepareModules: getModuleById -> not found', moduleId);
    return m;
};

export const getCatalogModules = () => PREPARE_MODULES;

export default PREPARE_MODULES;

export const getLessonPages = (lesson) => {
    if (!lesson || !lesson.content) return [];
    const pages = lesson.content.pages;
    if (!Array.isArray(pages) || pages.length === 0) return [];
    
    return pages.map(page => ({
        ...page,
        // For text pages expose 'body' as precomputed html field
        body: page.type === 'text' ? (page.html || page.body || '') : page.body
    }));
};

export const getModuleCompletion = async (moduleId) => {
    const state = await getCompletionState();
    if (!state || !state.modules) return null;
    return state.modules[moduleId] || null;
};

export const getLessonCurrentPageIndex = async (lessonId) => {
    const comp = await getLessonCompletion(lessonId);
    return comp?.currentPageIndex ?? 0;
};