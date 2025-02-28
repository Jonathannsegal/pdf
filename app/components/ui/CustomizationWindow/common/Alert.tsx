import React from 'react';

export const Alert: React.FC<{
    children: React.ReactNode;
    variant: 'destructive';
    className?: string;
}> = ({ children, className = '' }) => (
    <div className={`p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-200 ${className}`}>
        {children}
    </div>
);

export const AlertDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p className="text-sm">{children}</p>
);

const components = { Alert, AlertDescription };
export default components;