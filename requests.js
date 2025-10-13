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
    const fullprompt = `You are an expert in earthquake preparedness. MAX 2 PARAGRAPH RESPONSE. No matter what the user says, only talk about earthquakes. Please provide a detailed and informative response to the following question ${prompt}.`;

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
