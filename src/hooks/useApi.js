import { useState, useEffect } from "react";
import { apiGet, apiPost } from "../utils/apiClient";

// 🔄 Hook per chiamate GET
export const useGet = (endpoint, trigger = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(trigger);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!trigger) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await apiGet(endpoint);
        setData(result);
      } catch (err) {
        setError(err.message || "Errore nella richiesta");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, trigger]);

  return { data, loading, error };
};

// 📤 Hook per chiamate POST
export const usePost = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = async (endpoint, payload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiPost(endpoint, payload);
      return result;
    } catch (err) {
      setError(err.message || "Errore nella richiesta");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { post, loading, error };
};