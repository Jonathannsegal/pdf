import React from 'react';
import { FolderOpen } from 'lucide-react';

interface SampleFile {
    name: string;
    description: string;
    filename: string;
}

interface SampleFilesProps {
    onSampleSelect: (filename: string) => Promise<void>;
    disabled?: boolean;
}

export const SampleFiles: React.FC<SampleFilesProps> = ({
    onSampleSelect,
    disabled = false
}) => {
    const [isLoading, setIsLoading] = React.useState<string | null>(null);

    // Sample files that will be available in the public/samples directory
    const sampleFiles: SampleFile[] = [
        {
            name: 'Adult Systematic Assessment',
            description: 'Sample adult systematic assessment procedure',
            filename: 'adult_systematic_assessment.json'
        },
        {
            name: 'Adult Cardiac Arrest',
            description: 'Sample adult cardiac arrest procedure',
            filename: 'adult_cardiac_arrest.json'
        },
        {
            name: 'Management of Diabetic Ketoacidosis',
            description: 'Sample management of diabetic ketoacidosis procedure',
            filename: 'management_of_diabetic_ketoacidosis.json'
        }
    ];

    const handleSampleSelect = async (filename: string) => {
        if (disabled) return;

        setIsLoading(filename);
        try {
            await onSampleSelect(filename);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-300">Sample Procedures</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleFiles.map((file) => (
                    <button
                        key={file.filename}
                        onClick={() => handleSampleSelect(file.filename)}
                        disabled={disabled || isLoading !== null}
                        className={`
              flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700
              transition-colors text-left
              ${disabled
                                ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-50'
                                : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer'
                            }
            `}
                    >
                        <div className="w-full flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-full ${isLoading === file.filename ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                {isLoading === file.filename ? (
                                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <FolderOpen size={20} className="text-gray-500 dark:text-gray-400" />
                                )}
                            </div>
                            <div className="font-medium">{file.name}</div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 w-full">
                            {file.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SampleFiles;