import React, { useState, useMemo } from 'react';
import { Edit, Check, PenTool, Plus } from 'lucide-react';

import { Badge } from './common/Badge';

// Define types for the simplified format
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

interface FlatFlowchartViewProps {
  data: SimplifiedData;
  updateData: (data: SimplifiedData) => void;
}

// Step Edit Modal component
const StepEditModal: React.FC<{
  step: Step;
  onClose: () => void;
  onSave: (updatedStep: Step) => void;
}> = ({ step, onClose, onSave }) => {
  const [editedStep, setEditedStep] = useState<Step>(structuredClone(step));

  const handleChange = (field: string, value: any) => {
    setEditedStep(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextChange = (index: number, field: string, value: any) => {
    const updatedNext = [...editedStep.next];
    updatedNext[index] = {
      ...updatedNext[index],
      [field]: field === 'next' ? parseInt(value, 10) : value
    };
    setEditedStep(prev => ({
      ...prev,
      next: updatedNext
    }));
  };

  const addNextStep = () => {
    setEditedStep(prev => ({
      ...prev,
      next: [...prev.next, { condition: '', next: 0 }]
    }));
  };

  const removeNextStep = (index: number) => {
    setEditedStep(prev => ({
      ...prev,
      next: prev.next.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Edit Step {editedStep.step}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Edit size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Step Number</label>
              <input
                type="number"
                value={editedStep.step}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value)) {
                    handleChange('step', value);
                  }
                }}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Action</label>
              <input
                type="text"
                value={editedStep.action}
                onChange={(e) => handleChange('action', e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Points</label>
              <input
                type="text"
                value={editedStep.points || ''}
                onChange={(e) => handleChange('points', e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">UI Element</label>
              <select
                value={editedStep.ui[0] || 'checkbox'}
                onChange={(e) => {
                  if (e.target.value === 'timer') {
                    handleChange('ui', ['timer', '', '60']);
                  } else {
                    handleChange('ui', [e.target.value]);
                  }
                }}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="checkbox">Checkbox</option>
                <option value="timer">Timer</option>
                <option value="select">Dropdown</option>
                <option value="number">Dosage Calculator</option>
              </select>
            </div>
          </div>

          {/* Show timer settings if UI is timer */}
          {editedStep.ui[0] === 'timer' && (
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600 space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Timer Label</label>
                <input
                  type="text"
                  value={editedStep.ui[1] || ''}
                  onChange={(e) => {
                    const newUi = [...editedStep.ui];
                    newUi[1] = e.target.value;
                    handleChange('ui', newUi);
                  }}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Timer Duration (seconds)</label>
                <input
                  type="number"
                  value={editedStep.ui[2] || '60'}
                  onChange={(e) => {
                    const newUi = [...editedStep.ui];
                    newUi[2] = e.target.value;
                    handleChange('ui', newUi);
                  }}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  min="1"
                />
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Next Steps</h4>
              <button
                onClick={addNextStep}
                className="bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1"
              >
                <Plus size={12} />
                <span>Add Next Step</span>
              </button>
            </div>

            {editedStep.next.length > 0 ? (
              <div className="space-y-3">
                {editedStep.next.map((next, index) => (
                  <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Path {index + 1}</span>
                      <button
                        onClick={() => removeNextStep(index)}
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                      >
                        <Edit size={16} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Condition</label>
                        <input
                          type="text"
                          value={next.condition || ''}
                          onChange={(e) => handleNextChange(index, 'condition', e.target.value)}
                          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                          placeholder={editedStep.next.length > 1 ? "e.g., Yes, No, etc." : "Leave blank for direct next step"}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Next Step Number</label>
                        <input
                          type="number"
                          value={next.next}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value)) {
                              handleNextChange(index, 'next', value);
                            }
                          }}
                          className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">No next steps defined</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(editedStep)}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Flowchart Step Component
const FlowchartStep: React.FC<{
  step: Step;
  onEdit: (stepId: number) => void;
  onConnect: (fromStepId: number, toStepId: number) => void;
  isEditing: boolean;
  selectedStep: number | null;
  setSelectedStep: (step: number | null) => void;
}> = ({
  step,
  onEdit,
  onConnect,
  isEditing,
  selectedStep,
  setSelectedStep
}) => {
  const isSelected = selectedStep === step.step;

  // Determine step type styling based on step properties
  let stepTypeStyle = 'bg-white dark:bg-gray-800';
  let borderStyle = 'border-gray-300 dark:border-gray-600';

  // Check for UI elements to determine step type
  const hasTimer = step.ui && step.ui[0] === 'timer';
  const isDecisionPoint = step.next && step.next.length > 1;

  if (isDecisionPoint) {
    stepTypeStyle = 'bg-purple-50 dark:bg-purple-900/20';
    borderStyle = 'border-purple-300 dark:border-purple-700';
  } else if (hasTimer) {
    stepTypeStyle = 'bg-amber-50 dark:bg-amber-900/20';
    borderStyle = 'border-amber-300 dark:border-amber-700';
  }

  const handleStepClick = () => {
    if (isEditing) {
      // If we're in edit mode and clicked a different step than the one being edited
      if (selectedStep && selectedStep !== step.step) {
        // Connect the previously selected step to this one
        onConnect(selectedStep, step.step);
        setSelectedStep(null);
      } else {
        // Select this step
        setSelectedStep(step.step);
      }
    } else {
      // Open step editor
      onEdit(step.step);
    }
  };

  return (
    <div
      className={`relative p-3 border-2 rounded-lg shadow-sm transition-all ${borderStyle} ${stepTypeStyle} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-0' : ''
        } ${isEditing ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={handleStepClick}
    >
      <div className="absolute -top-2 -left-2 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-bold rounded-full border border-gray-300 dark:border-gray-600">
        {step.step}
      </div>

      <div className="font-medium mb-1">{step.action}</div>
      {step.points && (
        <div className="text-sm text-gray-500 dark:text-gray-400">{step.points}</div>
      )}

      {/* Badges for special properties */}
      {(isDecisionPoint || hasTimer) && (
        <div className="flex flex-wrap gap-1 mt-2">
          {isDecisionPoint && (
            <Badge variant="decision">Decision</Badge>
          )}
          {hasTimer && (
            <Badge variant="outline">Timer</Badge>
          )}
        </div>
      )}

      {/* Show next steps */}
      {step.next && step.next.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {isDecisionPoint ? (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Decision paths:
              </div>
              {step.next.map((path, idx) => (
                <div key={idx} className="flex items-center text-xs">
                  <span className="font-medium mr-1">{path.condition || `Option ${idx + 1}`}:</span>
                  <div className="flex items-center gap-1">
                    <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                      Step {path.next}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <span>Next:</span>
              {step.next.map((nextStep, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded"
                >
                  {nextStep.next}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {isEditing && (
        <div className="absolute -bottom-2 -right-2 flex">
          {!isSelected ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(step.step);
              }}
              className="bg-blue-500 text-white p-1 rounded-full shadow-sm"
              title="Edit Step"
            >
              <Edit size={14} />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedStep(null);
              }}
              className="bg-green-500 text-white p-1 rounded-full shadow-sm"
              title="Confirm Selection"
            >
              <Check size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const FlatFlowchartView: React.FC<FlatFlowchartViewProps> = ({ data, updateData }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [editingStep, setEditingStep] = useState<Step | null>(null);

  // Create a map of step numbers to steps for easy lookup
  const stepMap = useMemo(() => {
    const map = new Map<number, Step>();
    if (data && data.steps) {
      data.steps.forEach(step => {
        map.set(step.step, step);
      });
    }
    return map;
  }, [data.steps]);

  // Initialize steps for display
  const steps = useMemo(() => {
    return data?.steps || [];
  }, [data.steps]);

  // Group steps into sections (currently just a single section)
  const groupedSteps = useMemo(() => {
    // Group steps by "section" based on step number ranges
    // For now, just return all steps in a single group
    return steps;
  }, [steps]);

  const handleEditStep = (stepId: number) => {
    const step = stepMap.get(stepId);
    if (step) {
      setEditingStep(structuredClone(step));
    }
  };

  const handleSaveStepEdit = (updatedStep: Step) => {
    const newData = structuredClone(data);
    
    // Find the step by ID and update it
    const stepIndex = newData.steps.findIndex(step => step.step === updatedStep.step);
    
    if (stepIndex !== -1) {
      newData.steps[stepIndex] = updatedStep;
      updateData(newData);
    }
    
    setEditingStep(null);
  };

  const handleConnectSteps = (fromStepId: number, toStepId: number) => {
    const newData = structuredClone(data);
    
    // Find the step by ID
    const stepIndex = newData.steps.findIndex(step => step.step === fromStepId);
    
    if (stepIndex !== -1) {
      const step = newData.steps[stepIndex];
      
      // Check if step has next steps
      if (!step.next) {
        step.next = [];
      }
      
      // Check if connection already exists
      const existingConnection = step.next.find(next => next.next === toStepId);
      
      if (!existingConnection) {
        // Add new connection
        step.next.push({
          condition: '',
          next: toStepId
        });
        
        updateData(newData);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {data.procedure} {data.procedure_code && <span className="text-gray-500 dark:text-gray-400">{data.procedure_code}</span>}
          </h3>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`flex items-center px-3 py-1.5 rounded text-sm ${isEditMode
                ? 'bg-blue-500 text-white'
                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                }`}
            >
              {isEditMode ? (
                <>
                  <Check size={16} className="mr-1.5" />
                  Done Editing
                </>
              ) : (
                <>
                  <PenTool size={16} className="mr-1.5" />
                  Edit Connections
                </>
              )}
            </button>
          </div>
        </div>

        {isEditMode && (
          <div className="p-3 mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
            <p>
              <span className="font-bold">Connection Mode:</span> Click on a step to select it, then click on another step to create a connection between them.
              You can also click the edit button on each step to modify its properties.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedSteps.map((step) => (
            <FlowchartStep
              key={step.step}
              step={step}
              onEdit={handleEditStep}
              onConnect={handleConnectSteps}
              isEditing={isEditMode}
              selectedStep={selectedStep}
              setSelectedStep={setSelectedStep}
            />
          ))}
        </div>
      </div>

      {/* Step editing modal */}
      {editingStep && (
        <StepEditModal
          step={editingStep}
          onClose={() => setEditingStep(null)}
          onSave={handleSaveStepEdit}
        />
      )}
    </div>
  );
};

export default FlatFlowchartView;