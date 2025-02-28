import { useState, useEffect } from "react";
import { fetchHistory, fetchActiveFile, loadHistoryItem } from "../api/history";
import type { HistoryItem, ActiveFile } from "@/app/types";

export function useHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(
    null
  );
  const [activeFile, setActiveFile] = useState<ActiveFile | null>(null);

  const refreshHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const data = await fetchHistory();
      setHistory(data);

      if (data.length > 0) {
        const activeItem = data.find((item) => item.is_active);
        if (activeItem) {
          await loadHistoryItem(activeItem.filename);
        }
      }
    } catch (error) {
      console.log("Error fetching history:", error);
      setHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const loadItem = async (filename: string) => {
    try {
      const data = await loadHistoryItem(filename);
      setSelectedHistoryItem(filename);
      return data;
    } catch (error) {
      console.error("Error loading history item:", error);
      throw error;
    }
  };

  const refreshActiveFile = async () => {
    try {
      const data = await fetchActiveFile();
      setActiveFile(data);
      setSelectedHistoryItem(data?.filename || null);
    } catch (error) {
      console.log("Error fetching active file:", error);
      setActiveFile(null);
      setSelectedHistoryItem(null);
    }
  };

  useEffect(() => {
    refreshHistory();
    refreshActiveFile();
  }, []);

  return {
    history,
    isHistoryLoading,
    selectedHistoryItem,
    activeFile,
    refreshHistory,
    loadItem,
    refreshActiveFile,
  };
}
