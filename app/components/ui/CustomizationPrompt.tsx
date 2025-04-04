import React, { useState } from 'react';
import { Send, AlertTriangle, Loader2, ChevronDown, ChevronRight } from 'lucide-react';

interface CustomizationPromptProps {
  pdfFile: { file: File } | null;
  onProcessWithPrompt: (file: File, prompt: string) => void;
  isProcessing: boolean;
  error?: string | null;
}

const CustomizationPrompt = ({ 
  pdfFile, 
  onProcessWithPrompt,
  isProcessing,
  error 
}: CustomizationPromptProps) => {
  const [prompt, setPrompt] = useState('');
  const [expanded, setExpanded] = useState(true);

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (prompt.trim() && pdfFile && pdfFile.file) {
      onProcessWithPrompt(pdfFile.file, prompt);
    }
  };

  // Collapsed state is just the header button
  if (!expanded) {
    return (
      <div className="w-full mb-4">
        <div 
          className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
          onClick={() => setExpanded(true)}
        >
          <span className="text-sm text-gray-700 dark:text-gray-200">Customization Instructions</span>
          <ChevronRight size={16} className="text-gray-500 dark:text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden w-full border border-gray-200 dark:border-gray-700 mb-4">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => setExpanded(false)}
      >
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700 dark:text-gray-200">Customization Instructions</span>
        </div>
        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
      </div>
      
      <div className="p-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded mb-4 text-sm text-red-600 dark:text-red-300 flex items-start gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}
        
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Provide customization instructions for the analysis. Be specific about what UI elements to include and on which step.
        </p>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: When on CPR step start 2 minute timer."
            className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 mb-4"
            disabled={isProcessing}
          />
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!prompt.trim() || isProcessing || !pdfFile?.file}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg 
                ${!prompt.trim() || isProcessing || !pdfFile?.file 
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>Process with Instructions</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomizationPrompt;