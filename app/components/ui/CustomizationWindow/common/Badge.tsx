import React from 'react';

// Badge variants
type BadgeVariant = 'default' | 'outline' | 'decision' | 'info' | 'success';

export const Badge: React.FC<{
    children: React.ReactNode;
    variant?: BadgeVariant;
    className?: string;
}> = ({ children, variant = 'default', className = '' }) => {
    const variantClasses: Record<BadgeVariant, string> = {
        default: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        outline: 'border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-300',
        decision: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
        info: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };

    return (
        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;