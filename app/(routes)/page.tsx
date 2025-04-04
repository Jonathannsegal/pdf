"use client";

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/app/components/layout/Header';
import { MainContent } from '@/app/components/layout/MainContent';
import { Footer } from '@/app/components/layout/Footer';
import { HistorySidebar } from '@/app/components/ui/HistorySidebar';
import { useHealth } from '@/app/lib/hooks/useHealth';
import { useHistory } from '@/app/lib/hooks/useHistory';
import { processPDF, processPDFWithPrompt } from '@/app/lib/api/process';
import { setActiveFile } from '@/app/lib/api/history';
import { loadSampleFile } from '@/app/lib/api/sample';
import { handleApiError } from '@/app/lib/utils/error'
import type { JsonResult } from '@/app/types';

export default function Page() {
  // State management
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonResult, setJsonResult] = useState<JsonResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [pdfFile, setPdfFile] = useState<{ url: string | null, file: File | null }>({
    url: null,
    file: null
  });
  const [jsonFile, setJsonFile] = useState<{ data: JsonResult | null, file: File | null }>({
    data: null,
    file: null
  });

  // Custom hooks
  const { healthStatus, isCheckingHealth, checkHealth } = useHealth();
  const {
    history,
    isHistoryLoading,
    selectedHistoryItem,
    activeFile,
    refreshHistory,
    loadItem,
    refreshActiveFile
  } = useHistory();

  // Initialize component
  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([
          refreshHistory(),
          refreshActiveFile(),
          checkHealth()
        ]);
      } catch (error) {
        const apiError = handleApiError(error, 'initializing application');
        setError(apiError.message);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // file handling
  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Clean up previous PDF URL if it exists
      if (pdfFile.url) {
        URL.revokeObjectURL(pdfFile.url);
      }

      setPdfFile({
        url: URL.createObjectURL(file),
        file: file
      });
      setSelectedFile(file);
      setError(null);
      setCurrentStep(1);
    } else if (file.type === 'application/json' || file.name.endsWith('.json')) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON.parse(content);
          setJsonFile({
            data: jsonData,
            file: file
          });
          setJsonResult(jsonData);
          setCurrentStep(1); // Set to step 1, but customize will be available
          setSelectedFile(null); // Clear selected file since we don't need processing
        } catch (error) {
          setError(`Invalid JSON file ${error}`);
        }
      };
      reader.readAsText(file);
      setError(null);
    } else {
      setError('Please select a valid PDF or JSON file');
    }
  };

  // Handle sample file selection
  const handleSampleSelect = async (filename: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const sampleData = await loadSampleFile(filename);
      setJsonFile({
        data: sampleData,
        file: null
      });
      setJsonResult(sampleData);
      setCurrentStep(1); // Set to step 1, but customize will be available
    } catch (err) {
      const apiError = handleApiError(err, 'loading sample file');
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up URLs on unmount
  useEffect(() => {
    return () => {
      if (pdfFile.url) {
        URL.revokeObjectURL(pdfFile.url);
      }
    };
  });

  const handleUploadClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) handleFileSelect(file);
    };
    input.click();
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await processPDF(selectedFile);
      setJsonResult(result);
      await refreshHistory();
      setCurrentStep(2);
    } catch (err) {
      const apiError = handleApiError(err, 'processing PDF');
      setError(apiError.message);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessWithPrompt = async (file: File, prompt: string) => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      const result = await processPDFWithPrompt(file, prompt);
      setJsonResult(result);
      await refreshHistory();
      setCurrentStep(2); // Go directly to customize step
    } catch (err) {
      const apiError = handleApiError(err, 'processing PDF with custom prompt');
      setError(apiError.message);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetActive = async () => {
    if (!jsonResult?.filename) {
      setError('No file selected to activate');
      return;
    }

    try {
      await setActiveFile(jsonResult.filename);
      setIsActive(true);
      await Promise.all([refreshHistory(), refreshActiveFile()]);
    } catch (err) {
      const apiError = handleApiError(err, 'setting active file');
      setError(apiError.message);
    }
  };

  const handleHistoryItemSelect = async (filename: string) => {
    try {
      const data = await loadItem(filename);
      setJsonResult(data);
      setCurrentStep(2);
      setIsActive(data.is_active || false);
    } catch (err) {
      const apiError = handleApiError(err, 'loading history item');
      setError(apiError.message);
    }
  };

  const handleClosePdf = useCallback(() => {
    if (pdfFile.url) {
      URL.revokeObjectURL(pdfFile.url);
    }
    setPdfFile({ url: null, file: null });
    if (!jsonFile.data) {
      setCurrentStep(0);
    }
  }, [pdfFile.url, jsonFile.data]);

  const handleCloseJson = useCallback(() => {
    setJsonFile({ data: null, file: null });
    setJsonResult(null);
    if (!pdfFile.url) {
      setCurrentStep(0);
    }
  }, [pdfFile.url]);

  // Loading state
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          <p className="text-gray-600 dark:text-gray-400">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen p-8 pb-20 gap-8 sm:py-10 sm:px-25">
      <Header
        healthStatus={healthStatus}
        isCheckingHealth={isCheckingHealth}
        onCheckHealth={checkHealth}
        onOpenHistory={() => setIsHistoryOpen(true)}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        onUpload={handleUploadClick}
        onProcess={handleUpload}
        onActivate={handleSetActive}
        isProcessing={isLoading}
        canActivate={!!jsonResult && !isActive}
        isActive={isActive}
        jsonFile={jsonFile}
      />

      <MainContent
        error={error}
        setError={setError}
        pdfFile={pdfFile}
        jsonFile={jsonFile}
        setJsonFile={setJsonFile}
        selectedHistoryItem={selectedHistoryItem}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        activeFile={activeFile}
        onSetActive={handleSetActive}
        onOpenHistory={() => setIsHistoryOpen(false)}
        onFileSelect={handleFileSelect}
        onClosePdf={handleClosePdf}
        onCloseJson={handleCloseJson}
        onSampleSelect={handleSampleSelect}
        onProcessWithPrompt={handleProcessWithPrompt}
      />

      <Footer />

      <HistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        isLoading={isHistoryLoading}
        selectedItem={selectedHistoryItem}
        onSelectItem={handleHistoryItemSelect}
      />
    </div>
  );
}