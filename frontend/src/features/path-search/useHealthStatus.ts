import { useCallback, useEffect, useState } from "react";
import { health } from "../../api/client";

export type HealthState = "checking" | "healthy" | "unavailable";

export function useHealthStatus() {
  const [status, setStatus] = useState<HealthState>("checking");

  const refresh = useCallback(async () => {
    try {
      const response = await health();
      setStatus(response.status === "ok" ? "healthy" : "unavailable");
    } catch {
      setStatus("unavailable");
    }
  }, []);

  const markUnavailable = useCallback(() => {
    setStatus("unavailable");
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    status,
    refresh,
    markUnavailable
  };
}
