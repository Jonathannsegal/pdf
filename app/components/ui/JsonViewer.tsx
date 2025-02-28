import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, X } from 'lucide-react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import { tomorrow, docco } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { useDarkMode } from '@/app/lib/hooks/useDarkMode';
import type { JsonResult } from '@/app/types';

SyntaxHighlighter.registerLanguage('json', json);

interface JsonViewerProps {
  data: JsonResult;
  isActive: boolean;
  onSetActive: () => void;
  onClose: () => void;  // Add new prop for close handler
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  isActive,
  onSetActive,
  onClose
}) => {
  const isDarkMode = useDarkMode();
  const jsonString = JSON.stringify(data, null, 2);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.procedure_name || 'procedure_analysis'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!mounted) {
    return (
      <div className="flex flex-col h-full">
        <div className="bg-gray-100 px-4 py-2 flex items-center justify-between sticky top-0 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">JSON Preview</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6 bg-white">
          <pre className="text-sm">{jsonString}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between sticky top-0 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700 dark:text-gray-200">JSON Preview</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onSetActive}
            disabled={isActive}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded transition-colors flex items-center space-x-2 text-gray-700 dark:text-gray-200 disabled:opacity-50"
            title={isActive ? 'Already Active' : 'Set as Active'}
          >
            <CheckCircle size={16} className={isActive ? 'text-green-500' : ''} />
            <span className="text-sm">{isActive ? 'Active' : 'Set Active'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded transition-colors flex items-center space-x-2 text-gray-700 dark:text-gray-200"
            title="Download JSON"
          >
            <Download size={16} />
            <span className="text-sm">Download</span>
          </button>
          <button
            onClick={onClose}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded transition-colors text-gray-700 dark:text-gray-200"
            title="Close JSON"
          >
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6 bg-white dark:bg-gray-900">
        <SyntaxHighlighter
          language="json"
          style={isDarkMode ? tomorrow : docco}
          customStyle={{
            background: 'none',
            fontSize: '0.875rem',
            margin: 0,
          }}
          wrapLines={true}
          lineProps={{ style: { wordBreak: 'break-all', whiteSpace: 'pre-wrap' } }}
        >
          {jsonString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};