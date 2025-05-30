import React, { useState } from 'react';
import { X } from 'lucide-react';
import { JsonViewer } from '../ui/JsonViewer';
import FileUpload from '../ui/FileUpload';
import SampleFiles from '../ui/SampleFiles';
import type { JsonResult } from '@/app/types';
import PreviewWindow from '../ui/PreviewWindow';
import CustomizationWindow from '../ui/CustomizationWindow';
import CustomizationPrompt from '../ui/CustomizationPrompt';
import { processPDFWithPrompt } from '@/app/lib/api/process';
import { handleApiError } from '@/app/lib/utils/error';

interface SimplifiedData {
  procedure: string;
  procedure_code?: string;
  steps: Array<{
    step: number;
    action: string;
    points?: string;
    ui: string[];
    next: Array<{
      condition: string;
      next: number;
    }>;
  }>;
}

interface MainContentProps {
  error: string | null;
  setError: (error: string | null) => void;
  pdfFile: { url: string | null, file: File | null };
  jsonFile: { data: JsonResult | null, file: File | null };
  selectedHistoryItem: string | null;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setJsonFile: (file: { data: JsonResult | null, file: File | null }) => void;
  activeFile: { filename: string } | null;
  onSetActive: () => void;
  onOpenHistory: () => void;
  onFileSelect: (file: File) => void;
  onClosePdf: () => void;
  onCloseJson: () => void;
  onSampleSelect: (filename: string) => Promise<void>;
  onProcessWithPrompt: (file: File, prompt: string) => Promise<void>;
}

export const MainContent: React.FC<MainContentProps> = ({
  error,
  setError,
  pdfFile,
  jsonFile,
  selectedHistoryItem,
  currentStep,
  setCurrentStep,
  setJsonFile,
  activeFile,
  onSetActive,
  onFileSelect,
  onClosePdf,
  onCloseJson,
  onSampleSelect
}) => {
  const hasPdf = !!pdfFile.url;
  const hasJson = !!jsonFile.data;
  const showBothFiles = hasPdf && hasJson;
  const [isProcessingWithPrompt, setIsProcessingWithPrompt] = useState(false);

  // Transform JsonResult to SimplifiedData
  const transformToSimplifiedData = (data: JsonResult): SimplifiedData => {
    // Check if the data is already in the new format
    if ('steps' in data) {
      return data as unknown as SimplifiedData;
    }

    // Otherwise convert from the old format
    const steps = data.document?.procedures[0]?.sections.flatMap(section => 
      section.steps.map(step => {
        // Map step_number to step
        const newStep = {
          step: step.step_number,
          action: step.action,
          points: step.points,
          // Convert ui_element to ui array
          ui: step.ui_element === 'text' && step.timer_duration 
            ? ['timer', step.timer_label || '', step.timer_duration.toString()]
            : [step.ui_element || 'checkbox'],
          // Convert next_steps and decision_paths to next array
          next: [] as { condition: string, next: number }[]
        };

        // Add regular next steps
        if (step.next_steps && step.next_steps.length > 0) {
          step.next_steps.forEach(nextStep => {
            newStep.next.push({
              condition: '',
              next: nextStep
            });
          });
        }

        // Add decision paths
        if (step.is_decision_point && step.decision_paths) {
          step.decision_paths.forEach(path => {
            path.next_steps.forEach(nextStep => {
              newStep.next.push({
                condition: path.condition,
                next: nextStep
              });
            });
          });
        }

        return newStep;
      })
    ) || [];

    return {
      procedure: data.document?.procedures[0]?.procedure_name || "Procedure",
      procedure_code: data.document?.procedures[0]?.procedure_code,
      steps
    };
  };

  const handleSaveCustomization = async (data: JsonResult) => {
    try {
      const updatedData: JsonResult = {
        document: data.document,
        filename: jsonFile.data?.filename,
        timestamp: jsonFile.data?.timestamp,
        is_active: jsonFile.data?.is_active
      };

      setJsonFile({ ...jsonFile, data: updatedData });
      setCurrentStep(3); // Go to preview step after saving customization
    } catch (error) {
      throw new Error(`Failed to save customization changes ${error}`);
    }
  };

  const handleProcessWithPrompt = async (file: File, prompt: string) => {
    setIsProcessingWithPrompt(true);
    setError(null);

    try {
      const result = await processPDFWithPrompt(file, prompt);
      setJsonFile({ data: result, file: null });
      setCurrentStep(2); // Move to customize step after processing
    } catch (err) {
      const apiError = handleApiError(err, 'processing PDF with custom prompt');
      setError(apiError.message);
    } finally {
      setIsProcessingWithPrompt(false);
    }
  };

  const renderContent = () => {
    if (currentStep === 2) {
      return (
        <CustomizationWindow
          data={jsonFile.data}
          onClose={() => {
            onClosePdf();
            onCloseJson();
          }}
          onSave={handleSaveCustomization}
        />
      );
    }

    if (currentStep === 3 && jsonFile.data) {
      // Convert JsonResult to SimplifiedData before passing to PreviewWindow
      const simplifiedData = transformToSimplifiedData(jsonFile.data);
      
      return (
        <PreviewWindow
          data={simplifiedData}
        />
      );
    }

    if (hasPdf || hasJson) {
      return (
        <>
          {hasPdf && pdfFile.file && (
            <CustomizationPrompt
              pdfFile={{ file: pdfFile.file }}
              onProcessWithPrompt={handleProcessWithPrompt}
              isProcessing={isProcessingWithPrompt}
              error={error}
            />
          )}
          <div className={`grid ${showBothFiles ? 'grid-cols-2' : 'grid-cols-1'} gap-6 w-full min-h-[70vh]`}>
            {hasPdf && (
              <div className={`flex flex-col w-full ${showBothFiles ? '' : 'col-span-1'}`}>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden w-full h-full flex flex-col min-h-[500px]">
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-700 dark:text-gray-200">PDF Preview</span>
                    </div>
                    <button
                      onClick={onClosePdf}
                      className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded transition-colors text-gray-700 dark:text-gray-200"
                      title="Close PDF"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 w-full">
                    <iframe
                      src={pdfFile.url!}
                      className="w-full h-full"
                      title="PDF Preview"
                      style={{ minHeight: '100%', minWidth: '100%' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {hasJson && (
              <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden h-[600px] font-mono w-full ${showBothFiles ? '' : 'col-span-1'}`}>
                <JsonViewer
                  data={jsonFile.data!}
                  isActive={selectedHistoryItem === activeFile?.filename}
                  onSetActive={onSetActive}
                  onClose={onCloseJson}
                />
              </div>
            )}
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <main className="flex flex-col gap-8 items-center w-full">
      <div className="w-full max-w-6xl flex flex-col gap-6 flex-1">
        {error && !hasPdf && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-200 p-4 rounded-lg text-sm flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-500 dark:text-red-200 hover:text-red-700 dark:hover:text-red-100 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <FileUpload
          onFileSelect={onFileSelect}
          className="w-full flex-1"
          disabled={!!(hasPdf || hasJson)}
        >
          {renderContent()}
        </FileUpload>

        {/* Show sample files only if we're at step 0 (initial state) */}
        {currentStep === 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <SampleFiles
              onSampleSelect={onSampleSelect}
              disabled={!!(hasPdf || hasJson)}
            />
          </div>
        )}
      </div>
    </main>
  );
};