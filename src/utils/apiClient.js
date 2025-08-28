// 📡 apiClient.js – Gestione centralizzata delle chiamate API
const BASE_URL = "https://wisp2.datacontact.it/wisp2/rest";
const USE_PROXY = false;
const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
const TIMEOUT_MS = 15000; // ⏱️ Timeout massimo per le richieste

const buildUrl = (endpoint) => {
  return USE_PROXY ? `${PROXY_URL}${BASE_URL}/${endpoint}` : `${BASE_URL}/${endpoint}`;
};

const defaultHeaders = (token = null) => ({
  "Content-Type": "application/json",
  ...(token && { Authorization: `Bearer ${token}` })
});

const withTimeout = (promise, ms = TIMEOUT_MS) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("⏱️ Timeout richiesta")), ms)
    )
  ]);
};

export const apiRequest = async (method, endpoint, payload = null, token = null) => {
  try {
    const options = {
      method,
      headers: defaultHeaders(token),
      ...(payload && { body: JSON.stringify(payload) })
    };

    const response = await withTimeout(fetch(buildUrl(endpoint), options));

    if (!response.ok) {
      throw new Error(`Errore ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${method} ${endpoint}`, data);
    return data;
  } catch (error) {
    console.error(`❌ Errore API ${method}:`, error.message);
    throw error;
  }
};

export const apiGet = (endpoint, token = null) => apiRequest("GET", endpoint, null, token);
export const apiPost = (endpoint, payload, token = null) => apiRequest("POST", endpoint, payload, token);