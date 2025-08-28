// 📡 apiClient.js – Gestione centralizzata delle chiamate API
const BASE_URL = "https://wisp2.datacontact.it/wisp2/rest";
const USE_PROXY = false; // ✅ Imposta true per bypassare CORS in sviluppo
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";

const buildUrl = (endpoint) => {
  return USE_PROXY ? `${PROXY_URL}${BASE_URL}/${endpoint}` : `${BASE_URL}/${endpoint}`;
};

export const apiPost = async (endpoint, payload) => {
  try {
    const response = await fetch(buildUrl(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Errore ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Errore API POST:", error.message);
    throw error;
  }
};

export const apiGet = async (endpoint) => {
  try {
    const response = await fetch(buildUrl(endpoint));

    if (!response.ok) {
      throw new Error(`Errore ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Errore API GET:", error.message);
    throw error;
  }
};