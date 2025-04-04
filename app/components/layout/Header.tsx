import React from 'react';
import { RefreshCw, History } from 'lucide-react';
import { StatusIndicator } from '../ui/StatusIndicator';
import { StepProgress } from '../ui/StepProgress';
import type { HealthStatus, JsonResult } from '@/app/types';

interface HeaderProps {
  healthStatus: HealthStatus | null;
  isCheckingHealth: boolean;
  onCheckHealth: () => void;
  onOpenHistory: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onUpload: () => void;
  onProcess: () => void;
  onActivate: () => void;
  isProcessing: boolean;
  canActivate: boolean;
  isActive: boolean;
  jsonFile: { data: JsonResult | null, file: File | null };
}

export const Header: React.FC<HeaderProps> = ({
  healthStatus,
  isCheckingHealth,
  onCheckHealth,
  onOpenHistory,
  currentStep,
  setCurrentStep,
  onUpload,
  onProcess,
  onActivate,
  isProcessing,
  canActivate,
  isActive,
  jsonFile
}) => {
  return (
    <header className="flex flex-col gap-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="bg-gray-900 dark:bg-gray-800 rounded-lg shadow p-4">


          <div className="flex items-center justify-between mb-6 px-14">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-medium text-white">System Status</h2>
              <button
                onClick={onOpenHistory}
                className="flex items-center gap-2 px-3 py-1 text-sm rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
              >
                <History size={14} />
                <span>History</span>
              </button>
              <button
                onClick={onCheckHealth}
                disabled={isCheckingHealth}
                className="text-gray-400 hover:text-gray-300 p-1 rounded-full"
              >
                <RefreshCw className={`${isCheckingHealth ? 'animate-spin' : ''}`} size={14} />
              </button>
            </div>

            <div className="flex items-center gap-5">
              <StatusIndicator
                status={healthStatus?.components?.poppler?.status || 'unknown'}
                message="Poppler"
                icon={healthStatus?.components?.poppler?.status === 'ok' ? 'check' : 'alert'}
                details={healthStatus?.components?.poppler?.message || 'Python backend not connected'}
              />
              <StatusIndicator
                status={healthStatus?.components?.ollama?.status || 'unknown'}
                message="Ollama"
                icon={healthStatus?.components?.ollama?.status === 'ok' ? 'check' : 'alert'}
                details={healthStatus?.components?.ollama?.message || 'Ollama not running'}
              />
              <StatusIndicator
                status={healthStatus?.components?.python_dependencies?.status || 'unknown'}
                message="Dependencies"
                icon={healthStatus?.components?.python_dependencies?.status === 'ok' ? 'check' : 'alert'}
                details={healthStatus?.components?.python_dependencies?.message || 'Python backend not connected'}
              />
              <StatusIndicator
                status={healthStatus?.components?.unity?.status || "error"}
                message="Unity"
                icon={healthStatus?.components?.unity?.status === "ok" ? 'check' : 'alert'}
                details={healthStatus?.components?.unity?.message || "Unity connection not configured"}
              />
            </div>
          </div>

          <StepProgress
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            onUpload={onUpload}
            onProcess={onProcess}
            onActivate={onActivate}
            isProcessing={isProcessing}
            canActivate={canActivate}
            isActive={isActive}
            healthStatus={healthStatus}
            jsonFile={jsonFile}
          />
        </div>
      </div>
    </header>
  );
};