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
