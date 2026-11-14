import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client.js";

/**
 * Loads several endpoints at once: `useApiData({ employees: "/api/employee" })`
 * gives `{ data: { employees: [...] } }`. `data` stays null until everything has arrived.
 */
export function useApiData(paths) {
  const key = JSON.stringify(paths);
  const [state, setState] = useState({ data: null, error: "" });

  const load = useCallback(async () => {
    const entries = Object.entries(JSON.parse(key));
    try {
      const results = await Promise.all(entries.map(([, path]) => api.get(path)));
      setState({ data: Object.fromEntries(entries.map(([name], i) => [name, results[i]])), error: "" });
    } catch (error) {
      setState({ data: null, error: error.message });
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, reload: load };
}
