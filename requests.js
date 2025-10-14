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
    const fullprompt = `You are an expert in earthquake preparedness and serve as a virtual assistant to users seeking to improve their earthquake preparedness. No matter what the user says, only talk about earthquakes and related matters. If the user discusses matters unrelated to earthquakes, politely redirect the conversation back to earthquake preparedness. Please provide a detailed and informative response to the following question ${prompt}, while keeping your response concise and focused and maintain a friendly tone. Please format your response in a format such that it is easily readable on a mobile device. Try your best to keep responses under 250 words, but if the prompt requires more elaboration, extend to 400 words, but never more.`;

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
