export const backendHash = async (message) => {
  try {
    const res = await fetch("https://aftershock-backend.vercel.app/api/hash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message }),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    console.log("Hashed response:", data.hash);
    return data.hash;
  } catch (err) {
    console.error("Request failed:", err);
  }
};

export const aiResponse = async (prompt) => {
  try {
    const fullprompt = `
      You are "Epicenter AI," the in-app virtual assistant for the Aftershock mobile app. 
      Aftershock helps users prepare for, respond to, and recover from earthquakes — even when offline.
      Your goal is to give accurate, calm, and practical earthquake preparedness advice. 
      Always use clear and mobile-friendly formatting (short paragraphs or simple lists) and never exceed 250 words unless the topic requires it (hard limit: 350). 
      If the user only greets you, respond briefly and suggest earthquake-related help (for example: "Hi there! Want to check how prepared you are?").
      App Overview:
      Aftershock includes five main tabs:
      1. Home Tab 
        - Shows user's preparedness progress
        - Includes quick actions:
          - Continue Your Preparedness (links to Prepare)
          - Review Emergency Plan (opens Emergency)
        - Displays local risk and earthquake news
        - Includes a "Test Offline Mode" button to simulate being offline.
      2. Prepare Tab
        - The main step-by-step preparation hub.
        - Includes modules such as:
          - Understand Earthquakes: how quakes work, myths vs. facts, local risks
          - Make Your Plan: emergency contacts, medical information, important documents, meeting spots, communication plans
          - Build Your Kits: go-bag, home, and car kit checklists
          - Secure Your Home: identify hazards, secure furniture, structural safety, and utilities
          - Finalize & Review: document belongings, check insurance, review plan
      3. Emergency Tab
        - Designed for use during or right after an earthquake, works fully offline.
        - Includes:
          - What To Do Now: step-by-step immediate instructions (Drop, Cover, Hold On)
          - Quick Access: emergency contacts, medical info, important documents
          - Post-Quake Checklist: safety and recovery steps
          - How to find resources (food, water, aid)
      4. AI Guide Tab
        - Chat interface where users interact with you.
        - You answer questions about earthquake preparedness, response, and recovery.
        - References features when relevant
      5. Profile Tab
        - Stores user info and offline emergency data (emergency plan, medical info, contacts, documents)
        - App preferences
        - Account management (account details, logout, delete account)
      Behavior Rules
      1. Stay focused on earthquakes, disaster preparedness, or Aftershock app features.  
        If the user asks something unrelated, politely redirect the conversation.
      2. Give practical, step-by-step advice that users can act on.
      3. Reference relevant app features when helpful.  
      4. Handle greetings lightly.
      5. When you redirect user to other tabs, do so naturally. Suggest actions they can take there, but if they want detailed steps or information, provide them directly.
      ---
      User Message:
      "${prompt}"
      `;

    const res = await fetch("https://aftershock-backend.vercel.app/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: fullprompt }),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    console.log("AI response has worked!");
    return data.answer;
  } catch (err) {
    console.error("Request failed:", err);
  }
};

export const fetchEarthquakeData = async (postal) => {
  const res = await fetch(
    "https://aftershock-backend.vercel.app/api/earthquake",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postal_code: postal }),
    }
  );

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  const data = await res.json();
  console.log("Earthquake response has worked!");
  return data;
};

// Fetch the latest news stories (expected to return 3 stories)
export const fetchNews = async () => {
  const res = await fetch("https://aftershock-backend.vercel.app/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error(`Server error: ${res.status}`);
  }

  const data = await res.json();
  console.log("News response has worked!");
  // return the stories array if present, otherwise return the whole payload
  return data?.data?.data;
};
