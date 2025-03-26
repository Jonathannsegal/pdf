import React from 'react';
import { Plus, Trash } from 'lucide-react';

// Import custom UI components
import { Card, CardHeader, CardTitle, CardContent } from './common/Card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './common/Accordion';
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

interface ListViewProps {
  data: SimplifiedData;
  updateData: (data: SimplifiedData) => void;
}

const ListView: React.FC<ListViewProps> = ({ data, updateData }) => {
  // Editing handlers
  const handleStepChange = (stepIndex: number, field: string, value: any) => {
    const newData = structuredClone(data);
    const step = newData.steps[stepIndex];

    // Handle field changes
    if (field === 'action' || field === 'points') {
      step[field] = value;
    } else if (field === 'ui') {
      step.ui = value;
    }

    updateData(newData);
  };

  const handleNextStepChange = (stepIndex: number, nextIndex: number, field: string, value: any) => {
    const newData = structuredClone(data);
    const step = newData.steps[stepIndex];

    if (!step.next) {
      step.next = [];
    }
    
    if (field === 'condition') {
      step.next[nextIndex].condition = value;
    } else if (field === 'next') {
      // Ensure it's a number
      const nextStep = parseInt(value, 10);
      if (!isNaN(nextStep)) {
        step.next[nextIndex].next = nextStep;
      }
    }

    updateData(newData);
  };

  const addNextStep = (stepIndex: number) => {
    const newData = structuredClone(data);
    const step = newData.steps[stepIndex];
    
    if (!step.next) {
      step.next = [];
    }
    
    step.next.push({
      condition: '',
      next: 0
    });
    
    updateData(newData);
  };

  const removeNextStep = (stepIndex: number, nextIndex: number) => {
    const newData = structuredClone(data);
    const step = newData.steps[stepIndex];
    
    if (step.next && step.next.length > nextIndex) {
      step.next.splice(nextIndex, 1);
    }
    
    updateData(newData);
  };

  const addStep = () => {
    const newData = structuredClone(data);
    
    // Find the highest step number
    let maxStep = 0;
    newData.steps.forEach(step => {
      if (step.step > maxStep) {
        maxStep = step.step;
      }
    });
    
    // Create a new step with the next number
    newData.steps.push({
      step: maxStep + 1,
      action: `New Step ${maxStep + 1}`,
      points: '',
      ui: ['checkbox'],
      next: []
    });
    
    updateData(newData);
  };

  const removeStep = (stepIndex: number) => {
    const newData = structuredClone(data);
    
    // Remove the step
    newData.steps.splice(stepIndex, 1);
    
    // Update all references to this step
    const removedStepNumber = data.steps[stepIndex].step;
    newData.steps.forEach(step => {
      if (step.next) {
        // Filter out references to the removed step
        step.next = step.next.filter(next => next.next !== removedStepNumber);
      }
    });
    
    updateData(newData);
  };

  if (!data || !data.steps) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Procedure Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Procedure Name</label>
              <input
                type="text"
                value={data.procedure || ''}
                onChange={(e) => {
                  const newData = structuredClone(data);
                  newData.procedure = e.target.value;
                  updateData(newData);
                }}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Procedure Code</label>
              <input
                type="text"
                value={data.procedure_code || ''}
                onChange={(e) => {
                  const newData = structuredClone(data);
                  newData.procedure_code = e.target.value;
                  updateData(newData);
                }}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Steps</CardTitle>
            <button
              onClick={addStep}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Step</span>
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {data.steps.map((step, stepIndex) => (
              <AccordionItem key={stepIndex} value={`step-${stepIndex}`}>
                <AccordionTrigger>
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">Step {step.step}</span>
                    <span className="text-gray-600 dark:text-gray-300">{step.action}</span>

                    {/* Display badges for special step types */}
                    <div className="flex space-x-1 ml-4">
                      {step.next && step.next.length > 1 && (
                        <Badge variant="decision">Decision</Badge>
                      )}
                      {step.ui && step.ui[0] === 'timer' && (
                        <Badge variant="outline">Timer</Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-2">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div className="flex-1 mr-2">
                        <label className="block text-sm font-medium mb-1">Step Number</label>
                        <input
                          type="number"
                          value={step.step}
                          onChange={(e) => {
                            const newStepNumber = parseInt(e.target.value, 10);
                            if (!isNaN(newStepNumber)) {
                              const newData = structuredClone(data);
                              
                              // Update references from other steps to this one
                              const oldStepNumber = newData.steps[stepIndex].step;
                              newData.steps.forEach(s => {
                                if (s.next) {
                                  s.next.forEach(next => {
                                    if (next.next === oldStepNumber) {
                                      next.next = newStepNumber;
                                    }
                                  });
                                }
                              });
                              
                              // Update the step number
                              newData.steps[stepIndex].step = newStepNumber;
                              updateData(newData);
                            }
                          }}
                          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <button
                        onClick={() => removeStep(stepIndex)}
                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-2 rounded self-end"
                        title="Remove Step"
                      >
                        <Trash size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Action</label>
                        <input
                          type="text"
                          value={step.action || ''}
                          onChange={(e) => handleStepChange(stepIndex, 'action', e.target.value)}
                          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Points</label>
                        <input
                          type="text"
                          value={step.points || ''}
                          onChange={(e) => handleStepChange(stepIndex, 'points', e.target.value)}
                          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">UI Element</label>
                      <select
                        value={step.ui && step.ui[0] ? step.ui[0] : 'checkbox'}
                        onChange={(e) => {
                          let newUi = [e.target.value];
                          
                          // Special handling for timer
                          if (e.target.value === 'timer') {
                            // Preserve existing timer settings if they exist
                            if (step.ui && step.ui[0] === 'timer' && step.ui.length >= 3) {
                              newUi = ['timer', step.ui[1] || '', step.ui[2] || '60'];
                            } else {
                              newUi = ['timer', '', '60'];
                            }
                          }
                          
                          handleStepChange(stepIndex, 'ui', newUi);
                        }}
                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                      >
                        <option value="checkbox">Checkbox</option>
                        <option value="timer">Timer</option>
                        <option value="number">Dosage Calculator</option>
                        <option value="select">Dropdown Selection</option>
                      </select>
                    </div>

                    {/* Timer settings */}
                    {step.ui && step.ui[0] === 'timer' && (
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-medium mb-2">Timer Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Timer Label</label>
                            <input
                              type="text"
                              value={step.ui[1] || ''}
                              onChange={(e) => {
                                const newUi = [...step.ui];
                                newUi[1] = e.target.value;
                                handleStepChange(stepIndex, 'ui', newUi);
                              }}
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                              placeholder="Enter timer label"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                            <input
                              type="number"
                              value={step.ui[2] || '60'}
                              onChange={(e) => {
                                const duration = parseInt(e.target.value, 10);
                                if (!isNaN(duration)) {
                                  const newUi = [...step.ui];
                                  newUi[2] = duration.toString();
                                  handleStepChange(stepIndex, 'ui', newUi);
                                }
                              }}
                              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                              min="1"
                              placeholder="Enter duration in seconds"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium">Next Steps</label>
                        <button
                          onClick={() => addNextStep(stepIndex)}
                          className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center space-x-1"
                        >
                          <Plus size={12} />
                          <span>Add Next Step</span>
                        </button>
                      </div>

                      {step.next && step.next.length > 0 ? (
                        <div className="space-y-3">
                          {step.next.map((nextStep, nextIndex) => (
                            <div key={nextIndex} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium">Path {nextIndex + 1}</label>
                                <button
                                  onClick={() => removeNextStep(stepIndex, nextIndex)}
                                  className="text-xs text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>

                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Condition</label>
                                  <input
                                    type="text"
                                    value={nextStep.condition || ''}
                                    onChange={(e) => handleNextStepChange(stepIndex, nextIndex, 'condition', e.target.value)}
                                    className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                    placeholder={step.next.length > 1 ? "e.g., Yes, No, etc." : "Leave blank for direct next step"}
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Next Step Number</label>
                                  <input
                                    type="number"
                                    value={nextStep.next}
                                    onChange={(e) => {
                                      const nextStepNumber = parseInt(e.target.value, 10);
                                      if (!isNaN(nextStepNumber)) {
                                        handleNextStepChange(stepIndex, nextIndex, 'next', nextStepNumber);
                                      }
                                    }}
                                    className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="e.g., 2"
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
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default ListView;