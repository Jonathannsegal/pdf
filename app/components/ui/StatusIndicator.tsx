import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: string;
  message: string;
  icon: 'check' | 'alert';
  details: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  message,
  icon,
  details
}) => {
  const Icon = icon === 'check' ? CheckCircle : AlertCircle;

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 text-sm cursor-help">
        <div className={`${status === 'ok' ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
          <Icon size={16} />
        </div>
        <span className="text-gray-600 dark:text-gray-300 truncate">{message}</span>
      </div>
      <div className="absolute bottom-full left-0 mb-2 w-64 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className={`${status === 'ok'
          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
          : 'bg-gray-900 dark:bg-gray-800 text-white'
          } p-2 rounded-lg text-xs shadow-lg`}
        >
          {status === 'ok' ? 'No issues detected' : details}
        </div>
      </div>
    </div>
  );
};