import { useState, useEffect, useCallback, useRef } from "react";
import { fetchHealthStatus } from "../api/health";
import type { HealthStatus } from "@/app/types";

export function useHealth() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [previousHealth, setPreviousHealth] = useState<HealthStatus | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const lastCheckTime = useRef<number>(0);

  const checkHealth = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
  }, [previousHealth]);

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  });

  return { healthStatus, isCheckingHealth, checkHealth };
}
