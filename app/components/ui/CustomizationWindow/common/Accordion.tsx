import React, { useState, createContext, useContext } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

// Create contexts
const AccordionContext = createContext<{
    expanded: string | null;
    setExpanded: (value: string | null) => void;
}>({ expanded: null, setExpanded: () => { } });

const AccordionItemContext = createContext<{ value: string }>({ value: '' });

// Main Accordion component
export const Accordion: React.FC<{
    children: React.ReactNode;
    type: 'single';
    collapsible: boolean;
}> = ({ children }) => {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <AccordionContext.Provider value={{ expanded, setExpanded }}>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {children}
            </div>
        </AccordionContext.Provider>
    );
};

// Accordion Item component
export const AccordionItem: React.FC<{
    children: React.ReactNode;
    value: string;
}> = ({ children, value }) => {
    return (
        <AccordionItemContext.Provider value={{ value }}>
            <div className="border-b border-gray-200 dark:border-gray-700">
                {children}
            </div>
        </AccordionItemContext.Provider>
    );
};

// Accordion Trigger component
export const AccordionTrigger: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => {
    const { expanded, setExpanded } = useContext(AccordionContext);
    const { value } = useContext(AccordionItemContext);
    const isExpanded = expanded === value;

    return (
        <button
            className={`w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${isExpanded ? 'bg-gray-50 dark:bg-gray-700/50' : ''} ${className}`}
            onClick={() => setExpanded(isExpanded ? null : value)}
        >
            {children}
            <span className="flex items-center justify-center h-6 w-6">
                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </span>
        </button>
    );
};

// Accordion Content component
export const AccordionContent: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => {
    const { expanded } = useContext(AccordionContext);
    const { value } = useContext(AccordionItemContext);
    const isExpanded = expanded === value;

    if (!isExpanded) return null;

    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
};

const AccordionComponents = { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
export default AccordionComponents;