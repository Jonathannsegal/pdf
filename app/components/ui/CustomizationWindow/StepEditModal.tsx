import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { EnhancedStep, UIElementType } from '@/app/types';

interface StepEditModalProps {
    step: EnhancedStep;
    sectionIndex: number;
    stepIndex: number;
    stepMap: Map<number, EnhancedStep>;
    onClose: () => void;
    onSave: (sectionIndex: number, stepIndex: number, step: EnhancedStep) => void;
}

const StepEditModal: React.FC<StepEditModalProps> = ({
    step,
    sectionIndex,
    stepIndex,
    onClose,
    onSave
}) => {
    const [editedStep, setEditedStep] = useState<EnhancedStep>(structuredClone(step));

    const handleBasicFieldChange = (field: keyof EnhancedStep, value: string | number | boolean) => {
        const updatedStep = { ...editedStep };

        // Handle different field types
        switch (field) {
            case 'action':
            case 'points':
            case 'decision_text':
            case 'step_type':
                (updatedStep as any)[field] = value as string;
                break;
            case 'ui_element':
                if (value === 'checkbox' || value === 'text' || value === 'number' || value === 'select') {
                    updatedStep.ui_element = value;
                    // Clear timer fields if switching away from timer
                    if (value !== 'text') {
                        delete updatedStep.timer_label;
                        delete updatedStep.timer_duration;
                    }
                }
                break;
            case 'timer_label':
                updatedStep.timer_label = value as string;
                break;
            case 'timer_duration':
                updatedStep.timer_duration = Number(value);
                break;
            case 'step_number':
                updatedStep.step_number = parseInt(value as string, 10);
                break;
            case 'is_decision_point':
                updatedStep.is_decision_point = value as boolean;
                if (value && !updatedStep.decision_paths) {
                    updatedStep.decision_paths = [];
                }
                if (!value) {
                    delete updatedStep.decision_text;
                    delete updatedStep.decision_paths;
                }
                break;
        }

        setEditedStep(updatedStep);
    };

    const handleSave = () => {
        onSave(sectionIndex, stepIndex, editedStep);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
                <div className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold">Edit Step {editedStep.step_number}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* Basic fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Points</label>
                            <input
                                type="text"
                                value={editedStep.points}
                                onChange={(e) => handleBasicFieldChange('points', e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Step Type</label>
                            <select
                                value={editedStep.step_type || 'standard'}
                                onChange={(e) => handleBasicFieldChange('step_type', e.target.value)}
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
                                value={editedStep.ui_element}
                                onChange={(e) => handleBasicFieldChange('ui_element', e.target.value as UIElementType)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            >
                                <option value="checkbox">Checkbox</option>
                                <option value="text">Timer</option>
                                <option value="number">Dosage Calculator</option>
                                <option value="select">Dropdown Selection</option>
                            </select>
                        </div>
                    </div>

                    {/* Decision point toggle */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!editedStep.is_decision_point}
                                onChange={(e) => handleBasicFieldChange('is_decision_point', e.target.checked)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium">This is a decision point</span>
                        </label>

                        {editedStep.is_decision_point && (
                            <div className="mt-2">
                                <label className="block text-sm font-medium mb-1">Decision Question</label>
                                <input
                                    type="text"
                                    value={editedStep.decision_text || ''}
                                    onChange={(e) => handleBasicFieldChange('decision_text', e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    placeholder="e.g., Patient responsive?"
                                />
                            </div>
                        )}
                    </div>

                    {/* Timer settings */}
                    {editedStep.ui_element === 'text' && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <h4 className="text-sm font-medium mb-2">Timer Settings</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Timer Label</label>
                                    <input
                                        type="text"
                                        value={editedStep.timer_label || ''}
                                        onChange={(e) => handleBasicFieldChange('timer_label', e.target.value)}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        placeholder="Enter timer label"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Duration (seconds)</label>
                                    <input
                                        type="number"
                                        value={editedStep.timer_duration || ''}
                                        onChange={(e) => handleBasicFieldChange('timer_duration', e.target.value)}
                                        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                        min="1"
                                        placeholder="Enter duration in seconds"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
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

export default StepEditModal;