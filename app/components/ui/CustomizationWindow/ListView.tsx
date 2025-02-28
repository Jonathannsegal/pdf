import React from 'react';
import { Plus, Trash } from 'lucide-react';
import type { JsonResult, Section, EnhancedStep, DecisionPath, Medication, UIElementType } from '@/app/types';

// Import custom UI components
import { Card, CardHeader, CardTitle, CardContent } from './common/Card';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './common/Accordion';
import { Badge } from './common/Badge';

interface ListViewProps {
  data: JsonResult;
  updateData: (data: JsonResult) => void;
}

const ListView: React.FC<ListViewProps> = ({ data, updateData }) => {
  const procedure = data.document.procedures[0];

  const handleBasicStepChange = (sectionIndex: number, stepIndex: number, field: keyof EnhancedStep, value: string | number | boolean) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    // Handle different field types
    switch (field) {
      case 'action':
      case 'points':
      case 'decision_text':
      case 'step_type':
        if (typeof value === 'string' && ["assessment", "intervention", "treatment", "standard"].includes(value)) {
          step.step_type = value as "assessment" | "intervention" | "treatment" | "standard";
        }
        break;
      case 'ui_element':
        if (value === 'checkbox' || value === 'text' || value === 'number' || value === 'select') {
          step.ui_element = value;
          // Clear timer fields if switching away from timer
          if (value !== 'text') {
            delete step.timer_label;
            delete step.timer_duration;
          }
        }
        break;
      case 'timer_label':
        step.timer_label = value as string;
        break;
      case 'timer_duration':
        step.timer_duration = Number(value);
        break;
      case 'step_number':
        step.step_number = parseInt(value as string, 10);
        break;
      case 'is_decision_point':
        step.is_decision_point = value as boolean;
        if (value && !step.decision_paths) {
          step.decision_paths = [];
        }
        if (!value) {
          delete step.decision_text;
          delete step.decision_paths;
        }
        break;
    }

    updateData(newData);
  };

  const handleNextStepsChange = (sectionIndex: number, stepIndex: number, nextSteps: number[]) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    step.next_steps = nextSteps.length > 0 ? nextSteps : undefined;

    updateData(newData);
  };

  const handleDecisionPathChange = (sectionIndex: number, stepIndex: number, pathIndex: number, field: keyof DecisionPath, value: any) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    if (!step.decision_paths) {
      step.decision_paths = [];
    }

    if (field === 'condition') {
      step.decision_paths[pathIndex].condition = value;
    } else if (field === 'next_steps') {
      step.decision_paths[pathIndex].next_steps = value;
    }

    updateData(newData);
  };

  const addDecisionPath = (sectionIndex: number, stepIndex: number) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    if (!step.decision_paths) {
      step.decision_paths = [];
    }

    step.decision_paths.push({
      condition: '',
      next_steps: []
    });

    updateData(newData);
  };

  const removeDecisionPath = (sectionIndex: number, stepIndex: number, pathIndex: number) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    if (step.decision_paths) {
      step.decision_paths.splice(pathIndex, 1);
      if (step.decision_paths.length === 0) {
        delete step.decision_paths;
      }
    }

    updateData(newData);
  };

  const handleAdditionalInfoChange = (sectionIndex: number, stepIndex: number, infoIndex: number, value: string) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    if (!step.additional_info) {
      step.additional_info = [];
    }

    step.additional_info[infoIndex] = value;

    updateData(newData);
  };

  const addAdditionalInfo = (sectionIndex: number, stepIndex: number) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    if (!step.additional_info) {
      step.additional_info = [];
    }

    step.additional_info.push('');

    updateData(newData);
  };

  const removeAdditionalInfo = (sectionIndex: number, stepIndex: number, infoIndex: number) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    if (step.additional_info) {
      step.additional_info.splice(infoIndex, 1);
      if (step.additional_info.length === 0) {
        delete step.additional_info;
      }
    }

    updateData(newData);
  };

  const handleMedicationChange = (sectionIndex: number, stepIndex: number, medIndex: number, field: keyof Medication, value: string) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    if (!step.medications) {
      step.medications = [];
    }

    if (!step.medications[medIndex]) {
      step.medications[medIndex] = { name: '' };
    }

    step.medications[medIndex][field] = value;

    updateData(newData);
  };

  const addMedication = (sectionIndex: number, stepIndex: number) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    if (!step.medications) {
      step.medications = [];
    }

    step.medications.push({ name: '' });

    updateData(newData);
  };

  const removeMedication = (sectionIndex: number, stepIndex: number, medIndex: number) => {
    const newData = structuredClone(data);
    const step = newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] as EnhancedStep;

    if (step.medications) {
      step.medications.splice(medIndex, 1);
      if (step.medications.length === 0) {
        delete step.medications;
      }
    }

    updateData(newData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Procedure Name</label>
              <input
                type="text"
                value={procedure.procedure_name}
                onChange={(e) => {
                  const newData = structuredClone(data);
                  newData.document.procedures[0].procedure_name = e.target.value;
                  updateData(newData);
                }}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Procedure Code</label>
              <input
                type="text"
                value={procedure.procedure_code}
                onChange={(e) => {
                  const newData = structuredClone(data);
                  newData.document.procedures[0].procedure_code = e.target.value;
                  updateData(newData);
                }}
                className="w-full mt-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Procedure Type</label>
              <div className="flex items-center mt-1">
                <Badge variant="info" className="mr-2">Flowchart</Badge>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  This procedure uses a flowchart structure with decision points and connected steps
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {procedure.sections.map((section: Section, sectionIndex: number) => (
        <Card key={sectionIndex}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                <input
                  type="text"
                  value={section.name}
                  onChange={(e) => {
                    const newData = structuredClone(data);
                    newData.document.procedures[0].sections[sectionIndex].name = e.target.value;
                    updateData(newData);
                  }}
                  className="bg-transparent border-b border-gray-300 dark:border-gray-600 px-1 py-0.5 w-full focus:outline-none focus:border-blue-500"
                />
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              {section.steps.map((step: EnhancedStep, stepIndex: number) => (
                <AccordionItem key={stepIndex} value={`${sectionIndex}-step-${stepIndex}`}>
                  <AccordionTrigger>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">Step {step.step_number}</span>
                      <span className="text-gray-600 dark:text-gray-300">{step.action}</span>

                      {/* Display badges for special step types */}
                      <div className="flex space-x-1 ml-4">
                        {step.is_decision_point && (
                          <Badge variant="decision">Decision</Badge>
                        )}
                        {step.step_type && (
                          <Badge>{step.step_type}</Badge>
                        )}
                        {step.ui_element === 'text' && step.timer_duration && (
                          <Badge variant="outline">Timer</Badge>
                        )}
                        {step.medications && step.medications.length > 0 && (
                          <Badge variant="outline">Medication</Badge>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 py-2">
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Action</label>
                          <input
                            type="text"
                            value={step.action}
                            onChange={(e) => handleBasicStepChange(sectionIndex, stepIndex, 'action', e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Points</label>
                          <input
                            type="text"
                            value={step.points}
                            onChange={(e) => handleBasicStepChange(sectionIndex, stepIndex, 'points', e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Step Type</label>
                          <select
                            value={step.step_type || 'standard'}
                            onChange={(e) => handleBasicStepChange(sectionIndex, stepIndex, 'step_type', e.target.value)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="standard">Standard</option>
                            <option value="assessment">Assessment</option>
                            <option value="intervention">Intervention</option>
                            <option value="treatment">Treatment</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">UI Element</label>
                          <select
                            value={step.ui_element}
                            onChange={(e) => handleBasicStepChange(sectionIndex, stepIndex, 'ui_element', e.target.value as UIElementType)}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="checkbox">Checkbox</option>
                            <option value="text">Timer</option>
                            <option value="number">Dosage Calculator</option>
                            <option value="select">Dropdown Selection</option>
                          </select>
                        </div>
                      </div>

                      {/* Decision Point UI */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={!!step.is_decision_point}
                            onChange={(e) => handleBasicStepChange(sectionIndex, stepIndex, 'is_decision_point', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm font-medium">This is a decision point</span>
                        </label>

                        {step.is_decision_point && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Decision Question</label>
                              <input
                                type="text"
                                value={step.decision_text || ''}
                                onChange={(e) => handleBasicStepChange(sectionIndex, stepIndex, 'decision_text', e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                placeholder="e.g., Patient responsive?"
                              />
                            </div>

                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium">Decision Paths</label>
                                <button
                                  onClick={() => addDecisionPath(sectionIndex, stepIndex)}
                                  className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center space-x-1"
                                >
                                  <Plus size={12} />
                                  <span>Add Path</span>
                                </button>
                              </div>

                              {step.decision_paths && step.decision_paths.length > 0 ? (
                                <div className="space-y-3">
                                  {step.decision_paths.map((path, pathIndex) => (
                                    <div key={pathIndex} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                                      <div className="flex justify-between items-center mb-2">
                                        <label className="text-sm font-medium">Path {pathIndex + 1}</label>
                                        <button
                                          onClick={() => removeDecisionPath(sectionIndex, stepIndex, pathIndex)}
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
                                            value={path.condition}
                                            onChange={(e) => handleDecisionPathChange(sectionIndex, stepIndex, pathIndex, 'condition', e.target.value)}
                                            className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="e.g., Yes, No, etc."
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Next Steps (comma separated)</label>
                                          <input
                                            type="text"
                                            value={path.next_steps.join(', ')}
                                            onChange={(e) => {
                                              const value = e.target.value;
                                              const nextSteps = value
                                                .split(',')
                                                .map(s => parseInt(s.trim(), 10))
                                                .filter(n => !isNaN(n));

                                              handleDecisionPathChange(sectionIndex, stepIndex, pathIndex, 'next_steps', nextSteps);
                                            }}
                                            className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                            placeholder="e.g., 2, 3, 4"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">No decision paths defined</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Next Steps (for non-decision points) */}
                      {!step.is_decision_point && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <label className="block text-sm font-medium mb-1">Next Steps (comma separated)</label>
                          <input
                            type="text"
                            value={(step.next_steps || []).join(', ')}
                            onChange={(e) => {
                              const value = e.target.value;
                              const nextSteps = value
                                .split(',')
                                .map(s => parseInt(s.trim(), 10))
                                .filter(n => !isNaN(n));

                              handleNextStepsChange(sectionIndex, stepIndex, nextSteps);
                            }}
                            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            placeholder="e.g., 2, 3, 4"
                          />
                        </div>
                      )}

                      {/* Timer settings */}
                      {step.ui_element === 'text' && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <h4 className="text-sm font-medium mb-2">Timer Settings</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">Timer Label</label>
                              <input
                                type="text"
                                value={step.timer_label || ''}
                                onChange={(e) => handleBasicStepChange(sectionIndex, stepIndex, 'timer_label', e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                placeholder="Enter timer label"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                              <input
                                type="number"
                                value={step.timer_duration || ''}
                                onChange={(e) => handleBasicStepChange(sectionIndex, stepIndex, 'timer_duration', e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                min="1"
                                placeholder="Enter duration in seconds"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Medications section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium">Medications</label>
                          <button
                            onClick={() => addMedication(sectionIndex, stepIndex)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center space-x-1"
                          >
                            <Plus size={12} />
                            <span>Add Medication</span>
                          </button>
                        </div>

                        {step.medications && step.medications.length > 0 ? (
                          <div className="space-y-3">
                            {step.medications.map((med, medIndex) => (
                              <div key={medIndex} className="p-3 border border-gray-200 dark:border-gray-700 rounded">
                                <div className="flex justify-between items-center mb-2">
                                  <label className="text-sm font-medium">Medication {medIndex + 1}</label>
                                  <button
                                    onClick={() => removeMedication(sectionIndex, stepIndex, medIndex)}
                                    className="text-xs text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                                  >
                                    <Trash size={14} />
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Name</label>
                                    <input
                                      type="text"
                                      value={med.name}
                                      onChange={(e) => handleMedicationChange(sectionIndex, stepIndex, medIndex, 'name', e.target.value)}
                                      className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Dose</label>
                                    <input
                                      type="text"
                                      value={med.dose || ''}
                                      onChange={(e) => handleMedicationChange(sectionIndex, stepIndex, medIndex, 'dose', e.target.value)}
                                      className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Route</label>
                                    <input
                                      type="text"
                                      value={med.route || ''}
                                      onChange={(e) => handleMedicationChange(sectionIndex, stepIndex, medIndex, 'route', e.target.value)}
                                      className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Frequency</label>
                                    <input
                                      type="text"
                                      value={med.frequency || ''}
                                      onChange={(e) => handleMedicationChange(sectionIndex, stepIndex, medIndex, 'frequency', e.target.value)}
                                      className="w-full p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No medications defined</p>
                        )}
                      </div>

                      {/* Additional Information section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium">Additional Information</label>
                          <button
                            onClick={() => addAdditionalInfo(sectionIndex, stepIndex)}
                            className="text-xs bg-blue-500 text-white px-2 py-1 rounded flex items-center space-x-1"
                          >
                            <Plus size={12} />
                            <span>Add Info</span>
                          </button>
                        </div>

                        {step.additional_info && step.additional_info.length > 0 ? (
                          <div className="space-y-2">
                            {step.additional_info.map((info, infoIndex) => (
                              <div key={infoIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={info}
                                  onChange={(e) => handleAdditionalInfoChange(sectionIndex, stepIndex, infoIndex, e.target.value)}
                                  className="flex-1 p-2 border rounded text-sm dark:bg-gray-700 dark:border-gray-600"
                                />
                                <button
                                  onClick={() => removeAdditionalInfo(sectionIndex, stepIndex, infoIndex)}
                                  className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                                >
                                  <Trash size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">No additional information defined</p>
                        )}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      ))}

      {/* Guidelines section */}
      {procedure.guidelines && (
        <Card>
          <CardHeader>
            <CardTitle>Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(procedure.guidelines).map(([key, value], idx) => (
                <div key={idx} className="space-y-2">
                  <h4 className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {Array.isArray(value) ? value.map((item, itemIdx) => (
                      <li key={itemIdx} className="text-sm">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newData = structuredClone(data);
                            (newData.document.procedures[0].guidelines as any)[key][itemIdx] = e.target.value;
                            updateData(newData);
                          }}
                          className="w-full p-1 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-blue-500"
                        />
                      </li>
                    )) : (
                      <li className="text-sm">
                        <input
                          type="text"
                          value={value as string}
                          onChange={(e) => {
                            const newData = structuredClone(data);
                            (newData.document.procedures[0].guidelines as any)[key] = e.target.value;
                            updateData(newData);
                          }}
                          className="w-full p-1 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-blue-500"
                        />
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key points section */}
      {procedure.key_points && (
        <Card>
          <CardHeader>
            <CardTitle>Key Points</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {procedure.key_points.map((point, idx) => (
                <li key={idx} className="text-sm">
                  <input
                    type="text"
                    value={point}
                    onChange={(e) => {
                      const newData = structuredClone(data);
                      if (newData.document.procedures[0].key_points) {
                        newData.document.procedures[0].key_points[idx] = e.target.value;
                      }
                      updateData(newData);
                    }}
                    className="w-full p-1 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-blue-500"
                  />
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Notes section */}
      {procedure.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={procedure.notes}
              onChange={(e) => {
                const newData = structuredClone(data);
                newData.document.procedures[0].notes = e.target.value;
                updateData(newData);
              }}
              className="w-full h-24 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ListView;