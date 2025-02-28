import React from 'react';
import { X, Clock } from 'lucide-react';
import type { HistoryItem } from '@/app/types';

interface HistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  isLoading: boolean;
  selectedItem: string | null;
  onSelectItem: (filename: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  isOpen,
  onClose,
  history,
  selectedItem,
  onSelectItem
}) => (
  <div className={`fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-lg transform transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
      <h2 className="text-lg font-semibold">History</h2>
      <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
        <X size={20} />
      </button>
    </div>
    <div className="overflow-auto p-4 space-y-2">
      {history.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No history available
        </div>
      ) : (
        history.map((item) => (
          <button
            key={item.filename}
            onClick={() => onSelectItem(item.filename)}
            className={`w-full text-left p-3 rounded transition-colors ${selectedItem === item.filename
                ? 'bg-gray-100 dark:bg-gray-800'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
          >
            <div className="flex items-center justify-between">
              <div className="font-medium truncate">{item.procedure_name}</div>
              {item.is_active && (
                <span className="text-green-500 text-xs font-medium px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded-full">
                  Active
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              <Clock size={14} />
              {new Date(item.timestamp).toLocaleString()}
            </div>
          </button>
        ))
      )}
    </div>
  </div>
);