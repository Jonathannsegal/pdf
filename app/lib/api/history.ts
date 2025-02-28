import type { HistoryItem, ActiveFile } from "@/app/types";

const API_BASE = "http://localhost:3001/api";

export async function fetchHistory(): Promise<HistoryItem[]> {
  const response = await fetch(`${API_BASE}/history`);
  if (!response.ok) {
    throw new Error("Failed to fetch history");
  }
  const data = await response.json();
  return Array.isArray(data)
    ? data.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
    : [];
}

export async function fetchActiveFile(): Promise<ActiveFile | null> {
  const response = await fetch(`${API_BASE}/history/active`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error("Failed to fetch active file");
  }
  return response.json();
}

export async function setActiveFile(filename: string): Promise<void> {
  const response = await fetch(`${API_BASE}/history/active`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to set active file");
  }
}

export async function loadHistoryItem(filename: string) {
  const response = await fetch(`${API_BASE}/history/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load history item: ${response.statusText}`);
  }
  return response.json();
}
