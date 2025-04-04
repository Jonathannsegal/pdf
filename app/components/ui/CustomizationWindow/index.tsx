import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Save, RotateCcw, X } from 'lucide-react';

// Import custom UI components
import { Alert, AlertDescription } from './common/Alert';
import { Badge } from './common/Badge';
import { ViewToggle, ViewMode } from './common/ViewToggle';

// Import view components
import ListView from './ListView';
import FlatFlowchartView from './FlatFlowchartView';
import FlowchartEditor from './FlowchartEditor';

interface CustomizationWindowProps {
  data: any; // Use 'any' to handle both formats
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const CustomizationWindow: React.FC<CustomizationWindowProps> = ({
  data,
  onClose,
  onSave
}) => {
  const [editedData, setEditedData] = useState(data);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);

  // Initialize data whenever it changes
  useEffect(() => {
    setEditedData(data);
    setHasUnsavedChanges(false);
  }, [data]);

  // Get procedure name - works with both formats
  const procedureName = useMemo(() => {
    if (!editedData) return '';
    
    // Check if it's the simplified format
    if (editedData.procedure) {
      return editedData.procedure;
    }
    
    // Check if it's the complex format
    if (editedData.document?.procedures?.[0]?.procedure_name) {
      return editedData.document.procedures[0].procedure_name;
    }
    
    return 'Untitled Procedure';
  }, [editedData]);

  // Callback to update data and mark changes
  const updateData = useCallback((newData: any) => {
    setEditedData(newData);
    setHasUnsavedChanges(true);
  }, []);

  const handleRevert = useCallback(() => {
    setEditedData(data);
    setHasUnsavedChanges(false);
    setError(null);
  }, [data]);

  const handleSave = async () => {
    if (!editedData) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(editedData);
      setHasUnsavedChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  // Render the active view based on selected mode
  const renderActiveView = () => {
    if (!editedData) return null;

    switch (viewMode) {
      case ViewMode.LIST:
        return (
          <ListView
            data={editedData}
            updateData={updateData}
          />
        );
      case ViewMode.FLAT_FLOWCHART:
        return (
          <FlatFlowchartView
            data={editedData}
            updateData={updateData}
          />
        );
      case ViewMode.VISUAL_FLOWCHART:
        return (
          <FlowchartEditor
            data={editedData}
            updateData={updateData}
          />
        );
      default:
        return null;
    }
  };

  if (!editedData) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden h-[80vh] w-full flex flex-col">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-700 dark:text-gray-200">
            Customize Procedure: {procedureName}
          </span>
          <Badge variant="info">Flowchart</Badge>
        </div>
        <div className="flex items-center space-x-2">
          {hasUnsavedChanges && (
            <button
              onClick={handleRevert}
              className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-1 rounded flex items-center space-x-2"
              title="Revert Changes"
            >
              <RotateCcw size={16} />
              <span>Revert</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white px-3 py-1 rounded flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-900 py-2 px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {viewMode === ViewMode.VISUAL_FLOWCHART
              ? 'Drag-and-drop flowchart editor - visually arrange and connect steps'
              : viewMode === ViewMode.FLAT_FLOWCHART
                ? 'Flat flowchart view - visualize and edit connections'
                : 'Form editor - detailed step configuration'}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {renderActiveView()}
      </div>
    </div>
  );
};

export default CustomizationWindow;