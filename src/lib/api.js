import { buildExportPayload } from "./storage/exportRepository";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  "https://aftershock-backend.vercel.app/api";

export class ApiError extends Error {
  constructor(message, { status, body, cause } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
    this.cause = cause;
  }
}

async function requestJson(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...options.headers },
      ...options,
    });
  } catch (cause) {
    throw new ApiError("Unable to reach the Aftershock service.", { cause });
  }

  if (!response.ok) {
    let body = null;
    try {
      body = await response.text();
    } catch (_error) {
      body = null;
    }
    throw new ApiError(`Server error: ${response.status}`, {
      status: response.status,
      body,
    });
  }

  try {
    return await response.json();
  } catch (cause) {
    throw new ApiError("The service returned an invalid response.", {
      status: response.status,
      cause,
    });
  }
}

function buildEpicenterAIPrompt(prompt) {
  return `
You are "Epicenter AI," the in-app virtual assistant for the Aftershock mobile app.
Aftershock helps users prepare for, respond to, and recover from earthquakes, including when offline.

Give accurate, calm, practical earthquake preparedness advice. Use clear, mobile-friendly formatting
and stay under 250 words unless the topic requires more detail, with a hard limit of 350 words.
Keep greetings brief and suggest earthquake-related help.

The app includes Dashboard, Prepare, Emergency, Epicenter AI, and Profile tabs. Reference relevant app
features when helpful, but provide requested instructions directly. Stay focused on earthquakes,
disaster preparedness, response, recovery, and Aftershock features. For local-risk questions, answer
the risk question directly.

User message:
"${prompt}"
`;
}

export async function aiResponse(prompt) {
  try {
    const data = await requestJson("/ai", {
      body: JSON.stringify({ question: buildEpicenterAIPrompt(prompt) }),
    });
    return data.answer;
  } catch (error) {
    console.error("AI request failed:", error);
    return undefined;
  }
}

export async function backendHash(message) {
  try {
    const data = await requestJson("/hash", {
      body: JSON.stringify({ text: message }),
    });
    return data.hash;
  } catch (error) {
    console.error("Password hashing request failed:", error);
    return undefined;
  }
}

export function fetchEarthquakeData(postalCode) {
  return requestJson("/earthquake", {
    body: JSON.stringify({ postal_code: postalCode }),
  });
}

export async function fetchNews() {
  const data = await requestJson("/news");
  return data?.data?.data;
}

export async function exportData() {
  const payload = await buildExportPayload();
  return requestJson("/export", { body: JSON.stringify(payload) });
}
