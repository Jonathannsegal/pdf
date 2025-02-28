import type { HealthStatus } from "@/app/types";

const API_BASE = "http://localhost:3001/api";

export async function fetchHealthStatus(): Promise<HealthStatus> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error("Failed to fetch health status");
  }
  const health = await response.json();

  // Add Unity status
  health.components.unity = {
    status: "disabled",
    message: "Unity integration is currently disabled",
    api_connected: false,
    web_connected: false,
  };

  return health;
}
