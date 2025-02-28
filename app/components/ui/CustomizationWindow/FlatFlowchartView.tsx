import React, { useState, useMemo } from 'react';
import { Edit, Check, PenTool } from 'lucide-react';
import type { JsonResult, EnhancedStep, Section } from '@/app/types';

import { Badge } from './common/Badge';
import StepEditModal from './StepEditModal';

interface FlatFlowchartViewProps {
    data: JsonResult;
    updateData: (data: JsonResult) => void;
}

// Flowchart Step Component
const FlowchartStep: React.FC<{
    step: EnhancedStep;
    stepMap: Map<number, EnhancedStep>;
    sectionIndex: number;
    stepIndex: number;
    onEdit: (sectionIndex: number, stepIndex: number) => void;
    onConnect: (fromSectionIndex: number, fromStepIndex: number, toStepNumber: number) => void;
    isEditing: boolean;
    selectedStep: { sectionIndex: number; stepIndex: number } | null;
    setSelectedStep: (step: { sectionIndex: number; stepIndex: number } | null) => void;
}> = ({
    step,
    sectionIndex,
    stepIndex,
    onEdit,
    onConnect,
    isEditing,
    selectedStep,
    setSelectedStep
}) => {
        const isSelected = selectedStep?.sectionIndex === sectionIndex && selectedStep?.stepIndex === stepIndex;

        // Determine step type styling
        let stepTypeStyle = 'bg-white dark:bg-gray-800';
        let borderStyle = 'border-gray-300 dark:border-gray-600';

        if (step.step_type === 'assessment') {
            stepTypeStyle = 'bg-blue-50 dark:bg-blue-900/20';
            borderStyle = 'border-blue-300 dark:border-blue-700';
        } else if (step.step_type === 'intervention') {
            stepTypeStyle = 'bg-orange-50 dark:bg-orange-900/20';
            borderStyle = 'border-orange-300 dark:border-orange-700';
        } else if (step.step_type === 'treatment') {
            stepTypeStyle = 'bg-green-50 dark:bg-green-900/20';
            borderStyle = 'border-green-300 dark:border-green-700';
        }

        // Special styling for decision points
        if (step.is_decision_point) {
            stepTypeStyle = 'bg-purple-50 dark:bg-purple-900/20';
            borderStyle = 'border-purple-300 dark:border-purple-700';
        }

        const handleStepClick = () => {
            if (isEditing) {
                // If we're in edit mode and clicked a different step than the one being edited
                if (selectedStep && (selectedStep.sectionIndex !== sectionIndex || selectedStep.stepIndex !== stepIndex)) {
                    // Connect the previously selected step to this one
                    onConnect(
                        selectedStep.sectionIndex,
                        selectedStep.stepIndex,
                        step.step_number
                    );
                    setSelectedStep(null);
                } else {
                    // Select this step
                    setSelectedStep({ sectionIndex, stepIndex });
                }
            } else {
                // Open step editor
                onEdit(sectionIndex, stepIndex);
            }
        };

        return (
            <div
                className={`relative p-3 border-2 rounded-lg shadow-sm transition-all ${borderStyle} ${stepTypeStyle} ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-0' : ''
                    } ${isEditing ? 'cursor-pointer hover:shadow-md' : ''}`}
                onClick={handleStepClick}
            >
                <div className="absolute -top-2 -left-2 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-bold rounded-full border border-gray-300 dark:border-gray-600">
                    {step.step_number}
                </div>

                <div className="font-medium mb-1">{step.action}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{step.points}</div>

                {/* Badges for special properties */}
                {(step.is_decision_point ||
                    step.medications?.length ||
                    step.ui_element === 'text' && step.timer_duration) && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {step.is_decision_point && (
                                <Badge variant="decision">Decision</Badge>
                            )}
                            {step.medications?.length && (
                                <Badge variant="outline">Medications</Badge>
                            )}
                            {step.ui_element === 'text' && step.timer_duration && (
                                <Badge variant="outline">Timer</Badge>
                            )}
                        </div>
                    )}

                {/* Show next steps */}
                {((step.next_steps ?? []).length > 0 || step.is_decision_point) && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        {step.is_decision_point ? (
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                    {step.decision_text}
                                </div>
                                {step.decision_paths?.map((path, idx) => (
                                    <div key={idx} className="flex items-center text-xs">
                                        <span className="font-medium mr-1">{path.condition}:</span>
                                        <div className="flex items-center gap-1">
                                            {path.next_steps.map(nextStep => (
                                                <span
                                                    key={nextStep}
                                                    className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded"
                                                >
                                                    Step {nextStep}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <span>Next:</span>
                                {step.next_steps?.map(nextStep => (
                                    <span
                                        key={nextStep}
                                        className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded"
                                    >
                                        {nextStep}
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
                                    onEdit(sectionIndex, stepIndex);
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

// Flowchart Section Component
const FlowchartSection: React.FC<{
    section: Section;
    sectionIndex: number;
    stepMap: Map<number, EnhancedStep>;
    onEditStep: (sectionIndex: number, stepIndex: number) => void;
    onConnectSteps: (fromSectionIndex: number, fromStepIndex: number, toStepNumber: number) => void;
    isEditing: boolean;
    selectedStep: { sectionIndex: number; stepIndex: number } | null;
    setSelectedStep: (step: { sectionIndex: number; stepIndex: number } | null) => void;
}> = ({
    section,
    sectionIndex,
    stepMap,
    onEditStep,
    onConnectSteps,
    isEditing,
    selectedStep,
    setSelectedStep
}) => {
        return (
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                        {section.name}
                    </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {section.steps.map((step, stepIndex) => (
                        <FlowchartStep
                            key={step.step_number}
                            step={step as EnhancedStep}
                            stepMap={stepMap}
                            sectionIndex={sectionIndex}
                            stepIndex={stepIndex}
                            onEdit={onEditStep}
                            onConnect={onConnectSteps}
                            isEditing={isEditing}
                            selectedStep={selectedStep}
                            setSelectedStep={setSelectedStep}
                        />
                    ))}
                </div>
            </div>
        );
    };

const FlatFlowchartView: React.FC<FlatFlowchartViewProps> = ({ data, updateData }) => {
    const [isFlatFlowchartEdit, setIsFlatFlowchartEdit] = useState(false);
    const [selectedStep, setSelectedStep] = useState<{ sectionIndex: number; stepIndex: number } | null>(null);
    const [editModalStep, setEditModalStep] = useState<{
        step: EnhancedStep;
        sectionIndex: number;
        stepIndex: number
    } | null>(null);

    const procedure = data.document.procedures[0];

    // Create a map of step numbers to steps for easy lookup
    const stepMap = useMemo(() => {
        const map = new Map<number, EnhancedStep>();
        procedure.sections.forEach(section => {
            section.steps.forEach(step => {
                map.set(step.step_number, step as EnhancedStep);
            });
        });
        return map;
    }, [procedure]);

    const handleEditStep = (sectionIndex: number, stepIndex: number) => {
        const step = procedure.sections[sectionIndex].steps[stepIndex] as EnhancedStep;
        setEditModalStep({
            step: structuredClone(step),
            sectionIndex,
            stepIndex
        });
    };

    const handleSaveStepEdit = (sectionIndex: number, stepIndex: number, updatedStep: EnhancedStep) => {
        const newData = structuredClone(data);
        newData.document.procedures[0].sections[sectionIndex].steps[stepIndex] = updatedStep;
        updateData(newData);
        setEditModalStep(null);
    };

    const handleConnectSteps = (fromSectionIndex: number, fromStepIndex: number, toStepNumber: number) => {
        const newData = structuredClone(data);
        const fromStep = newData.document.procedures[0].sections[fromSectionIndex].steps[fromStepIndex] as EnhancedStep;

        // Handle normal next steps
        if (!fromStep.is_decision_point) {
            const currentNextSteps = [...(fromStep.next_steps || [])];
            if (!currentNextSteps.includes(toStepNumber)) {
                fromStep.next_steps = [...currentNextSteps, toStepNumber];
            }
        }
        // If we're adding to a decision path that would be handled in the decision path UI

        updateData(newData);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        {procedure.procedure_name} <span className="text-gray-500 dark:text-gray-400">{procedure.procedure_code}</span>
                    </h3>

                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setIsFlatFlowchartEdit(!isFlatFlowchartEdit)}
                            className={`flex items-center px-3 py-1.5 rounded text-sm ${isFlatFlowchartEdit
                                ? 'bg-blue-500 text-white'
                                : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                                }`}
                        >
                            {isFlatFlowchartEdit ? (
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

                {isFlatFlowchartEdit && (
                    <div className="p-3 mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
                        <p>
                            <span className="font-bold">Connection Mode:</span> Click on a step to select it, then click on another step to create a connection between them.
                            You can also click the edit button on each step to modify its properties.
                        </p>
                    </div>
                )}

                {procedure.sections.map((section, sectionIndex) => (
                    <FlowchartSection
                        key={sectionIndex}
                        section={section}
                        sectionIndex={sectionIndex}
                        stepMap={stepMap}
                        onEditStep={handleEditStep}
                        onConnectSteps={handleConnectSteps}
                        isEditing={isFlatFlowchartEdit}
                        selectedStep={selectedStep}
                        setSelectedStep={setSelectedStep}
                    />
                ))}
            </div>

            {/* Guidelines in flowchart view - simplified */}
            {procedure.guidelines && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-3">Guidelines</h3>
                    <div className="space-y-2">
                        {Object.entries(procedure.guidelines).map(([key, value], idx) => (
                            <div key={idx} className="space-y-1">
                                <h4 className="text-sm font-medium capitalize">{key.replace(/_/g, ' ')}</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {Array.isArray(value) ? value.map((item, itemIdx) => (
                                        <li key={itemIdx} className="text-sm">{item}</li>
                                    )) : (
                                        <li className="text-sm">{value as string}</li>
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Key points in flowchart view - simplified */}
            {procedure.key_points && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-3">Key Points</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        {procedure.key_points.map((point, idx) => (
                            <li key={idx} className="text-sm">{point}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Step editing modal */}
            {editModalStep && (
                <StepEditModal
                    step={editModalStep.step}
                    sectionIndex={editModalStep.sectionIndex}
                    stepIndex={editModalStep.stepIndex}
                    stepMap={stepMap}
                    onClose={() => setEditModalStep(null)}
                    onSave={handleSaveStepEdit}
                />
            )}
        </div>
    );
};

export default FlatFlowchartView;