import React from 'react';

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = ''
}) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        {children}
    </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        {children}
    </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {children}
    </h3>
);

export const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="p-4">
        {children}
    </div>
);

const CardComponents = { Card, CardHeader, CardTitle, CardContent };

export default CardComponents;