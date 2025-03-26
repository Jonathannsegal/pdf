import React, { useState, ReactNode, useEffect } from 'react';
import { Smartphone, Glasses, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import backgroundImage from '../../public/background.png';

interface CardProps {
    children: ReactNode;
    className?: string;
}

interface BaseCardProps {
    children: ReactNode;
}

// Updated interfaces to match the new data format
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

const PreviewWindow: React.FC<PreviewWindowProps> = ({ data }) => {
    const [viewMode, setViewMode] = useState<'ar' | 'mobile'>('ar');
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [uiElementStates, setUiElementStates] = useState<{
        [key: string]: number;
    }>({});

    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [activeTimerStep, setActiveTimerStep] = useState<Step | null>(null);

    // Access steps directly from the simplified data structure
    const allSteps = data?.steps || [];
    const procedureName = data?.procedure || "Procedure";
    const totalSteps = allSteps.length;

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

    const handleNext = () => {
        if (currentStepIndex < totalSteps - 1) {
            const nextStep = allSteps[currentStepIndex + 1];
            
            // Handle UI elements based on the first element in the ui array
            if (nextStep.ui && nextStep.ui.length > 0) {
                const uiType = nextStep.ui[0];
                setUiElementStates(prev => ({
                    ...prev,
                    [uiType]: Math.max(
                        prev[uiType] || 0,
                        currentStepIndex + 1
                    )
                }));

                // Check if this is a timer step
                if (isTimer(nextStep) && !isRunning) {
                    const { duration, label } = getTimerData(nextStep);
                    setTimeLeft(duration);
                    setIsRunning(true);
                    setActiveTimerStep(nextStep);
                }
            }
            
            setCurrentStepIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setUiElementStates(prev => {
                const newStates = { ...prev };
                Object.entries(newStates).forEach(([element, stepIndex]) => {
                    if (stepIndex >= currentStepIndex - 1) {
                        delete newStates[element];
                        if (element === 'timer') {
                            setIsRunning(false);
                            setTimeLeft(null);
                            setActiveTimerStep(null);
                        }
                    }
                });
                return newStates;
            });
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    const handleReset = () => {
        setCurrentStepIndex(0);
        setUiElementStates({});
        setTimeLeft(null);
        setIsRunning(false);
        setActiveTimerStep(null);
    };

    const isUIElementVisible = (type: string) => {
        return type in uiElementStates;
    };

    const getVisibleSteps = () => {
        const steps = [];
        const prevIndex = currentStepIndex - 1;
        const nextIndex = currentStepIndex + 1;

        if (prevIndex >= 0) {
            steps.push({ step: allSteps[prevIndex], opacity: 'opacity-50' });
        }
        if (currentStepIndex < totalSteps) {
            steps.push({ step: allSteps[currentStepIndex], opacity: 'opacity-100' });
        }
        if (nextIndex < totalSteps) {
            steps.push({ step: allSteps[nextIndex], opacity: 'opacity-50' });
        }

        return steps;
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

    const ARView: React.FC = () => {
        const visibleSteps = getVisibleSteps();
        const showTimer = isUIElementVisible('timer') && timeLeft !== null;

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
                                label={activeTimerStep?.ui[1]} // Get label from ui array
                            />
                        </div>
                    </div>
                )}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-4">
                    {visibleSteps.map(({ step, opacity }, index) => (
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
        const showTimer = isUIElementVisible('timer') && timeLeft !== null;

        return (
            <div className="w-full h-[61vh] flex items-center justify-center overflow-hidden">
                <div className="relative w-80 h-full border-8 border-white rounded-[3rem] shadow-xl bg-gray-50 overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-white rounded-b-2xl"></div>

                    <div className="h-full flex flex-col items-center justify-center p-4">
                        <div className="w-full space-y-4">
                            {visibleSteps.map(({ step, opacity }, index) => (
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
                                    </div>
                                </div>
                            ))}
                        </div>
                        {showTimer && (
                            <div className="mt-6">
                                <div className="bg-white rounded-lg shadow-lg p-3">
                                    <Timer
                                        timeLeft={timeLeft || 0}
                                        label={activeTimerStep?.ui[1]} // Get label from ui array
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

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden w-full">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex space-x-4">
                        <button
                            onClick={handlePrev}
                            disabled={currentStepIndex === 0}
                            className={`p-2 rounded ${currentStepIndex === 0
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={currentStepIndex === totalSteps - 1}
                            className={`p-2 rounded ${currentStepIndex === totalSteps - 1
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