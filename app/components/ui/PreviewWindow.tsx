import React, { useState, ReactNode, useEffect } from 'react';
import { Smartphone, Glasses, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import backgroundImage from '../../public/background.png';

// Updated interfaces to match the simplified data format
interface NextStep {
  condition: string;
  next: number;
}

interface Step {
  step: number;
  action: string;
  points?: string;
  ui: string[];
  next: NextStep[];
}

interface SimplifiedData {
  procedure: string;
  procedure_code?: string;
  steps: Step[];
}

interface PreviewWindowProps {
  data: SimplifiedData;
}

// Helper components
interface CardProps {
  children: ReactNode;
  className?: string;
}

interface BaseCardProps {
  children: ReactNode;
}

const CardHeader: React.FC<BaseCardProps> = ({ children }) => (
  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
    {children}
  </div>
);

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

const Timer = ({ timeLeft, label }: { timeLeft: number; label?: string }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="text-center space-y-1">
      {label && (
        <div className="text-sm font-medium text-gray-700">{label}</div>
      )}
      <div className="text-2xl font-bold text-gray-900">{displayTime}</div>
    </div>
  );
};

// Decision component for rendering decision paths
const DecisionPaths = ({ 
  paths, 
  onSelect,
  stepMap 
}: { 
  paths: NextStep[], 
  onSelect: (nextStep: number) => void,
  stepMap: Map<number, Step>
}) => {
  // Split paths into rows for side-by-side display
  const createRows = (items: NextStep[], itemsPerRow: number = 2) => {
    const rows = [];
    for (let i = 0; i < items.length; i += itemsPerRow) {
      rows.push(items.slice(i, i + itemsPerRow));
    }
    return rows;
  };

  const rows = createRows(paths);

  return (
    <div className="mt-4">
      {rows.map((row, rowIdx) => (
        <div key={rowIdx} className="flex space-x-2 mb-2">
          {row.map((path, idx) => {
            const targetStep = stepMap.get(path.next);
            return (
              <div key={idx} className="flex-1">
                <button
                  onClick={() => onSelect(path.next)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 rounded-md text-sm border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left"
                >
                  <span className="font-medium">{path.condition || `Option ${idx + 1}`}</span>
                  {/* <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(Step {path.next})</span> */}
                </button>
                {targetStep && (
                  <div className="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm opacity-50">
                    {targetStep.action}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const PreviewWindow: React.FC<PreviewWindowProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'ar' | 'mobile'>('ar');
  // Find the first step in the procedure
  const getFirstStepId = (steps: Step[]): number => {
    if (!steps || steps.length === 0) return 0;
    // Return the step with the lowest step number
    return steps.reduce((min, step) => Math.min(min, step.step), steps[0].step);
  };
  
  // Initialize with the first step's ID rather than assuming 0
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [stepHistory, setStepHistory] = useState<number[]>([]);
  const [uiElementStates, setUiElementStates] = useState<{
    [key: string]: number;
  }>({});

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTimerStep, setActiveTimerStep] = useState<Step | null>(null);
  const [showDecision, setShowDecision] = useState(false);

  // Create a map for quick step lookup
  const stepMap = React.useMemo(() => {
    const map = new Map<number, Step>();
    if (data?.steps) {
      data.steps.forEach(step => {
        map.set(step.step, step);
      });
    }
    return map;
  }, [data?.steps]);

  // Get all steps
  const allSteps = data?.steps || [];
  const procedureName = data?.procedure || "Procedure";
  const totalSteps = allSteps.length;
  
  // Initialize with the first step when data changes
  useEffect(() => {
    if (data && data.steps && data.steps.length > 0) {
      const firstStepId = getFirstStepId(data.steps);
      setStepHistory([firstStepId]);
    }
  }, [data]);

  // Find current step by number
  const getCurrentStep = (): Step | undefined => {
    const stepId = stepHistory[stepHistory.length - 1];
    return stepMap.get(stepId);
  };

  const currentStep = getCurrentStep();

  // Helper function to check if a step has a timer
  const isTimer = (step: Step) => {
    return step.ui && step.ui.length > 2 && step.ui[0] === 'timer';
  };

  // Helper function to get timer duration and label
  const getTimerData = (step: Step) => {
    if (isTimer(step)) {
      return {
        label: step.ui[1] || undefined,
        duration: parseInt(step.ui[2] || '60', 10)
      };
    }
    return { label: undefined, duration: 60 };
  };

  // Check if current step is a decision point
  const isDecisionPoint = (step?: Step): boolean => {
    return !!(step?.next && step.next.length > 1);
  };

  useEffect(() => {
    if (!isRunning || timeLeft === null) return;

    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === null || prevTime <= 0) {
          clearInterval(interval);
          setIsRunning(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Update decision state when current step changes
  useEffect(() => {
    if (currentStep) {
      setShowDecision(isDecisionPoint(currentStep));
      
      // Start timer if needed
      if (isTimer(currentStep) && !isRunning) {
        const { duration, label } = getTimerData(currentStep);
        setTimeLeft(duration);
        setIsRunning(true);
        setActiveTimerStep(currentStep);
      }
    }
  }, [currentStep, isRunning]);

  const handleNext = () => {
    if (!currentStep) return;
    
    if (isDecisionPoint(currentStep)) {
      // If it's a decision point, we should show the decision options
      // and not automatically advance
      setShowDecision(true);
      return;
    }
    
    // For non-decision steps, use the first next step if available
    if (currentStep.next && currentStep.next.length > 0) {
      handleSelectPath(currentStep.next[0].next);
    }
  };

  const handlePrev = () => {
    if (stepHistory.length > 1) {
      // Remove current step from history and go back
      const newHistory = [...stepHistory];
      newHistory.pop();
      setStepHistory(newHistory);
      
      // Reset decision state
      setShowDecision(false);
      
      // Stop timer if active
      if (isRunning) {
        setIsRunning(false);
        setTimeLeft(null);
        setActiveTimerStep(null);
      }
    }
  };

  const handleReset = () => {
    // Reset to first step in the procedure
    const firstStepId = getFirstStepId(allSteps);
    setStepHistory([firstStepId]);
    setShowDecision(false);
    setTimeLeft(null);
    setIsRunning(false);
    setActiveTimerStep(null);
    setUiElementStates({});
  };

  const handleSelectPath = (nextStepId: number) => {
    // Find the step by ID
    const nextStep = stepMap.get(nextStepId);
    
    if (nextStep) {
      // Add this step to history
      setStepHistory(prev => [...prev, nextStepId]);
      
      // Reset decision display
      setShowDecision(false);
      
      // Handle any UI element
      if (nextStep.ui && nextStep.ui.length > 0) {
        const uiType = nextStep.ui[0];
        setUiElementStates(prev => ({
          ...prev,
          [uiType]: Math.max(prev[uiType] || 0, nextStepId)
        }));
        
        // Check if this is a timer step
        if (isTimer(nextStep) && !isRunning) {
          const { duration, label } = getTimerData(nextStep);
          setTimeLeft(duration);
          setIsRunning(true);
          setActiveTimerStep(nextStep);
        }
      }
    }
  };

  const renderUIElement = (step: Step) => {
    if (!step.ui || step.ui.length === 0) return null;
    
    const uiType = step.ui[0];
    
    switch (uiType) {
      case 'timer':
        return null; // Timer is rendered separately
      case 'number':
        return (
          <input
            type="number"
            className="w-16 text-center p-1 border rounded text-gray-900"
            placeholder="0"
            disabled
          />
        );
      case 'select':
        return (
          <select className="w-24 p-1 text-sm text-gray-900" disabled>
            <option>Select</option>
          </select>
        );
      default:
        return null;
    }
  };

  // Get visible steps for display
  const getVisibleSteps = () => {
    if (!currentStep) return [];
    
    const steps = [];
    
    // Get previous step if available
    if (stepHistory.length > 1) {
      const prevStepId = stepHistory[stepHistory.length - 2];
      const prevStep = stepMap.get(prevStepId);
      if (prevStep) {
        steps.push({ step: prevStep, opacity: 'opacity-50', position: 'previous' });
      }
    }
    
    // Add current step
    steps.push({ step: currentStep, opacity: 'opacity-100', position: 'current' });
    
    // Add next step(s) if current step isn't a decision point
    if (!isDecisionPoint(currentStep) && currentStep.next && currentStep.next.length > 0) {
      const nextStepId = currentStep.next[0].next;
      const nextStep = stepMap.get(nextStepId);
      if (nextStep) {
        steps.push({ step: nextStep, opacity: 'opacity-50', position: 'next' });
      }
    }
    
    return steps;
  };

  const ARView: React.FC = () => {
    const visibleSteps = getVisibleSteps();
    const showTimer = isRunning && timeLeft !== null;

    return (
      <div className="relative w-full h-[61vh] bg-gray-100 rounded-lg overflow-hidden">
        <Image
          src={backgroundImage}
          alt="Background"
          layout="fill"
          objectFit="cover"
          priority
        />
        {showTimer && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2">
            <div className="bg-white/90 p-3 rounded-lg shadow-lg">
              <Timer
                timeLeft={timeLeft || 0}
                label={activeTimerStep?.ui[1]}
              />
            </div>
          </div>
        )}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-4">
          {visibleSteps.map(({ step, opacity, position }, index) => (
            <div
              key={index}
              className={`transition-all duration-300 ${opacity}`}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white/90 p-3 rounded shadow-lg w-64">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{step.action}</div>
                    {step.ui && step.ui.length > 0 && step.ui[0] !== 'timer' && (
                      <div>{renderUIElement(step)}</div>
                    )}
                  </div>
                  {step.points && (
                    <div className="text-sm text-gray-600 mt-1">{step.points}</div>
                  )}
                  
                  {/* Decision paths UI - only shown for current step */}
                  {showDecision && isDecisionPoint(step) && position === 'current' && (
                    <DecisionPaths 
                      paths={step.next} 
                      onSelect={handleSelectPath}
                      stepMap={stepMap}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MobileView: React.FC = () => {
    const visibleSteps = getVisibleSteps();
    const showTimer = isRunning && timeLeft !== null;

    return (
      <div className="w-full h-[61vh] flex items-center justify-center overflow-hidden">
        <div className="relative w-80 h-full border-8 border-white rounded-[3rem] shadow-xl bg-gray-50 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-white rounded-b-2xl"></div>

          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-full space-y-4">
              {visibleSteps.map(({ step, opacity, position }, index) => (
                <div
                  key={index}
                  className={`transition-all duration-300 ${opacity}`}
                >
                  <div className="bg-white rounded-lg shadow-lg p-3 w-64 mx-auto">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{step.action}</div>
                      {step.ui && step.ui.length > 0 && step.ui[0] !== 'timer' && (
                        <div>{renderUIElement(step)}</div>
                      )}
                    </div>
                    {step.points && (
                      <div className="text-sm text-gray-600 mt-1">{step.points}</div>
                    )}
                    
                    {/* Decision paths UI - only shown for current step */}
                    {showDecision && isDecisionPoint(step) && position === 'current' && (
                      <DecisionPaths 
                        paths={step.next} 
                        onSelect={handleSelectPath}
                        stepMap={stepMap}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            {showTimer && (
              <div className="mt-6">
                <div className="bg-white rounded-lg shadow-lg p-3">
                  <Timer
                    timeLeft={timeLeft || 0}
                    label={activeTimerStep?.ui[1]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!data || allSteps.length === 0) return null;

  // Get current step ID for display
  const currentStepId = currentStep?.step || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              onClick={handlePrev}
              disabled={stepHistory.length <= 1}
              className={`p-2 rounded ${stepHistory.length <= 1
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              disabled={!currentStep || (isDecisionPoint(currentStep) && showDecision) || 
                        (currentStep.next.length === 0)}
              className={`p-2 rounded ${!currentStep || (isDecisionPoint(currentStep) && showDecision) || 
                        (currentStep.next.length === 0)
                ? 'bg-gray-100 text-gray-400'
                : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700"
              title="Reset"
            >
              <RotateCcw size={20} />
            </button>
            
            {/* Current step indicator */}
            <div className="flex items-center">
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">
                Step {currentStepId} of {totalSteps}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('ar')}
              className={`p-2 rounded ${viewMode === 'ar'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              title="AR View"
            >
              <Glasses size={20} />
            </button>
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded ${viewMode === 'mobile'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              title="Mobile View"
            >
              <Smartphone size={20} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'ar' ? <ARView /> : <MobileView />}
      </CardContent>
    </div>
  );
};

export default PreviewWindow;