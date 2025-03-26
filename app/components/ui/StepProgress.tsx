import React from 'react';
import type { HealthStatus } from '@/app/types';
import type { JsonResult } from '@/app/types';

interface StepProgressProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  onUpload: () => void;
  onProcess: () => void;
  onActivate: () => void;
  isProcessing: boolean;
  canActivate: boolean;
  isActive: boolean;
  healthStatus: HealthStatus | null;
  jsonFile: { data: JsonResult | null, file: File | null };
}

export const StepProgress: React.FC<StepProgressProps> = ({
  currentStep,
  setCurrentStep,
  onUpload,
  onProcess,
  onActivate,
  isProcessing,
  canActivate,
  isActive,
  healthStatus,
  jsonFile
}) => {
  const steps = [
    {
      id: 'U',
      label: 'Upload',
      color: 'blue',
      action: onUpload,
      isEnabled: true
    },
    // {
    //   id: 'P',
    //   label: 'Process',
    //   color: 'blue',
    //   action: onProcess,
    //   isEnabled: currentStep >= 1 && !jsonFile?.data && healthStatus?.status === 'ok'
    // },
    {
      id: 'C',
      label: 'Customize',
      color: 'blue',
      action: () => {
        if (jsonFile?.data) {
          setCurrentStep(2);
        }
      },
      isEnabled: !!jsonFile?.data
    },
    {
      id: 'V',
      label: 'View',
      color: 'blue',
      action: () => {
        if (jsonFile?.data && currentStep >= 2) {
          setCurrentStep(3);
        }
      },
      isEnabled: currentStep >= 2 && !!jsonFile?.data
    },
    // {
    //   id: 'A',
    //   label: 'Activate',
    //   color: isActive ? 'green' : 'blue',
    //   action: onActivate,
    //   isEnabled: currentStep >= 4 && canActivate && healthStatus?.status === 'ok'
    // }
  ];

  // Determine which step should be visually expanded
  const getExpandedStep = () => {
    if (currentStep === 1 && !steps[1].isEnabled && steps[2].isEnabled) {
      return 2; // Expand Customize instead of Process when Process is disabled
    }
    return currentStep;
  };

  const expandedStep = getExpandedStep();

  return (
    <div className="relative flex justify-between max-w-2xl mx-auto">
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          <div
            className={`
              flex items-center justify-center text-lg font-medium
              transition-all duration-300 transform
              rounded-full
              ${expandedStep === index ? 'scale-105' : ''}
              ${currentStep >= index && step.isEnabled
                ? `${step.color === 'blue' ? 'bg-blue-500 dark:bg-blue-400' : 'bg-green-500 dark:bg-green-400'} text-white`
                : 'bg-gray-700 dark:bg-gray-600 text-gray-300'
              }
              ${step.isEnabled ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-60'}
              ${expandedStep === index ? 'w-32 px-4' : 'w-12'} 
              h-12
            `}
            onClick={() => step.isEnabled && step.action()}
          >
            {expandedStep === index ? (
              <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                {isProcessing && index === 1 ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span className="text-sm">Processing...</span>
                  </>
                ) : (
                  <>
                    {/* {step.icon && <span className="mr-1">{step.icon}</span>} */}
                    <span className="text-sm">{step.label}</span>
                  </>
                )}
              </div>
            ) : (
              <span>{step.id}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StepProgress;