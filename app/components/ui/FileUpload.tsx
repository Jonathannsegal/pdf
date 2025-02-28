import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFileSelect,
    className = '',
    children,
    disabled = false
}) => {
    const [dragActive, setDragActive] = useState(false);
    const [, setError] = useState('');

    const validateFile = (file: File): boolean => {
        const validTypes = ['application/pdf', 'application/json'];
        if (!validTypes.includes(file.type)) {
            if (file.name.endsWith('.json') || file.name.endsWith('.pdf')) {
                return true;
            }
            setError('Please upload a PDF or JSON file');
            return false;
        }
        return true;
    };

    const handleFile = (file: File) => {
        if (validateFile(file)) {
            setError('');
            onFileSelect(file);
        }
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;

        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;

        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.json';
        input.onchange = handleChange as unknown as GlobalEventHandlers['onchange'];
        input.click();
    };

    return (
        <div className={className}>
            <div
                className={`
                    relative flex flex-col items-center justify-center
                    transition-colors min-h-full
                    ${dragActive ? 'bg-blue-50/50 dark:bg-blue-950/50' : ''}
                    ${disabled ? 'cursor-default' : 'cursor-pointer'}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleClick}
                role="button"
                tabIndex={0}
            >
                {children || (
                    <div className="flex flex-col items-center">
                        <Upload
                            className={`w-12 h-12 mb-4 ${dragActive ? 'text-blue-500' :
                                disabled ? 'text-gray-400 opacity-50' :
                                    'text-gray-400'
                                }`}
                        />
                        <p className={`mb-2 text-sm ${disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            <span className="font-semibold">
                                {disabled ? 'Close current files to upload new ones' : 'Click to upload'}
                            </span>
                            {!disabled && ' or drag and drop'}
                        </p>
                        <p className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                            PDF or JSON files
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUpload;