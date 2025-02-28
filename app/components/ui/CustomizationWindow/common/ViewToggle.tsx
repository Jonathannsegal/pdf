import React from 'react';
import { ListChecks, Workflow, PenTool } from 'lucide-react';

// View Mode enum
export enum ViewMode {
    LIST = 'list',
    FLAT_FLOWCHART = 'flat-flowchart',
    VISUAL_FLOWCHART = 'visual-flowchart'
}

interface ViewToggleProps {
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, setViewMode }) => {
    return (
        <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
            <button
                onClick={() => setViewMode(ViewMode.LIST)}
                className={`px-3 py-1.5 flex items-center text-sm font-medium ${viewMode === ViewMode.LIST
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
            >
                <ListChecks size={16} className="mr-1.5" />
                List
            </button>
            <button
                onClick={() => setViewMode(ViewMode.FLAT_FLOWCHART)}
                className={`px-3 py-1.5 flex items-center text-sm font-medium ${viewMode === ViewMode.FLAT_FLOWCHART
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
            >
                <Workflow size={16} className="mr-1.5" />
                Flat Flowchart
            </button>
            <button
                onClick={() => setViewMode(ViewMode.VISUAL_FLOWCHART)}
                className={`px-3 py-1.5 flex items-center text-sm font-medium ${viewMode === ViewMode.VISUAL_FLOWCHART
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
            >
                <PenTool size={16} className="mr-1.5" />
                Visual Flowchart
            </button>
        </div>
    );
};

export default ViewToggle;