import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ZoomIn, ZoomOut, Maximize, Lock, Unlock, Edit } from 'lucide-react';
import type { JsonResult, EnhancedStep } from '@/app/types';

// Define types for the simplified format
interface NextStep {
    condition: string;
    next: number;
}

interface Step {
    step: number;
    action: string;
    points?: string;
    ui: string[];
    next: NextStep[];
}

// SimplifiedData matches the new JSON format
interface SimplifiedData {
    procedure: string;
    procedure_code?: string;
    steps: Step[];
}

// Enhanced step with additional properties for UI
interface EnhancedStep extends Step {
    is_decision_point?: boolean;
    step_type?: string;
    timer_duration?: number;
    timer_label?: string;
}

// Visual flowchart editor component props
interface FlowchartEditorProps {
    data: SimplifiedData;
    updateData: (data: SimplifiedData) => void;
}

// Position information for steps in the flowchart
interface StepPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface Connection {
    from: number;
    to: number;
    label?: string;
    fromPoint?: 'top' | 'right' | 'bottom' | 'left';
    toPoint?: 'top' | 'right' | 'bottom' | 'left';
    path?: string; // SVG path data
}

// Connection point component
const ConnectionPoint: React.FC<{
    position: 'top' | 'right' | 'bottom' | 'left';
    isActive: boolean;
    onClick: () => void;
}> = ({ position, isActive, onClick }) => {
    let positionStyles = '';

    switch (position) {
        case 'top':
            positionStyles = 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2';
            break;
        case 'right':
            positionStyles = 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2';
            break;
        case 'bottom':
            positionStyles = 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
            break;
        case 'left':
            positionStyles = 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2';
            break;
    }

    return (
        <div
            className={`absolute w-3 h-3 rounded-full cursor-pointer z-20 transition-all ${isActive ? 'bg-green-500 scale-125' : 'bg-blue-400 hover:bg-blue-500'
                } ${positionStyles}`}
            onClick={onClick}
        />
    );
};

// Flowchart Step Component
const FlowchartStep: React.FC<{
    step: EnhancedStep;
    position: StepPosition;
    onPositionChange: (stepId: number, position: { x: number, y: number }) => void;
    onEditStep: (stepId: number) => void;
    onStartConnection: (stepId: number, point: 'top' | 'right' | 'bottom' | 'left') => void;
    isSelected: boolean;
    onSelect: (stepId: number) => void;
    isLocked: boolean;
}> = ({
    step,
    position,
    onPositionChange,
    onEditStep,
    onStartConnection,
    onSelect,
    isLocked,
    isSelected
}) => {
        const stepRef = useRef<HTMLDivElement>(null);
        const [isDragging, setIsDragging] = useState(false);
        const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

        // Determine appropriate shape based on step type
        let shapeClass = '';
        let bgColor = '';
        let textColor = '';
        let borderColor = '';

        if (step.is_decision_point) {
            // Diamond shape for decision points
            shapeClass = 'rhombus';
            bgColor = 'bg-purple-50 dark:bg-purple-900/20';
            borderColor = 'border-purple-300 dark:border-purple-700';
            textColor = 'text-purple-900 dark:text-purple-100';
        } else if (step.step_type === 'assessment') {
            // Rectangle with curved top for assessment
            shapeClass = 'assessment';
            bgColor = 'bg-blue-50 dark:bg-blue-900/20';
            borderColor = 'border-blue-300 dark:border-blue-700';
            textColor = 'text-blue-900 dark:text-blue-100';
        } else if (step.step_type === 'treatment') {
            // Rectangle with rounded corners for treatment
            shapeClass = 'rounded-lg';
            bgColor = 'bg-green-50 dark:bg-green-900/20';
            borderColor = 'border-green-300 dark:border-green-700';
            textColor = 'text-green-900 dark:text-green-100';
        } else if (step.ui_element === 'text' && step.timer_duration) {
            // Hexagonal shape for timer steps
            shapeClass = 'timer';
            bgColor = 'bg-amber-50 dark:bg-amber-900/20';
            borderColor = 'border-amber-300 dark:border-amber-700';
            textColor = 'text-amber-900 dark:text-amber-100';
        } else {
            // Default rectangle
            shapeClass = 'rounded-lg';
            bgColor = 'bg-white dark:bg-gray-800';
            borderColor = 'border-gray-300 dark:border-gray-700';
            textColor = 'text-gray-900 dark:text-gray-100';
        }

        // Selection style
        if (isSelected) {
            borderColor = 'border-blue-500 dark:border-blue-500';
        }

        const handleMouseDown = (e: React.MouseEvent) => {
            if (isLocked) return;

            if (stepRef.current) {
                e.stopPropagation();

                // Calculate offset from the mouse position to the top-left corner of the element
                const rect = stepRef.current.getBoundingClientRect();
                setDragOffset({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                });

                setIsDragging(true);
                onSelect(step.step);
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && stepRef.current && !isLocked) {
                e.preventDefault();

                const container = stepRef.current.parentElement;
                if (!container) return;

                const containerRect = container.getBoundingClientRect();

                // Calculate new position with respect to the container
                let newX = e.clientX - containerRect.left - dragOffset.x;
                let newY = e.clientY - containerRect.top - dragOffset.y;

                // Snap to grid (20px)
                newX = Math.round(newX / 20) * 20;
                newY = Math.round(newY / 20) * 20;

                // Update position
                onPositionChange(step.step, { x: newX, y: newY });

            }
        };

        const handleMouseUp = () => {
            if (isDragging) {
                setIsDragging(false);
            }
        };

        useEffect(() => {
            if (isDragging) {
                window.addEventListener('mousemove', handleMouseMove);
                window.addEventListener('mouseup', handleMouseUp);
            }

            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }, [isDragging, dragOffset]);

        // Generate custom shape CSS for special shapes
        const generateShapeStyles = () => {
            if (shapeClass === 'rhombus') {
                return {
                    transform: 'rotate(45deg)',
                    width: `${position.width * 0.7}px`,
                    height: `${position.width * 0.7}px`
                };
            }

            if (shapeClass === 'timer') {
                // For timer, we use a regular div with the hexagon applied via clip-path
                return {
                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)'
                };
            }

            return {};
        };

        // Generate styles for content inside specially shaped containers
        const generateContentStyles = () => {
            if (shapeClass === 'rhombus') {
                return {
                    transform: 'rotate(-45deg)',
                    width: `${position.width}px`,
                    height: `${position.height}px`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                };
            }

            return {};
        };

        return (
            <div
                ref={stepRef}
                className={`absolute ${bgColor} border-2 ${borderColor} shadow-sm transition-shadow ${isLocked ? 'cursor-default' : 'cursor-move'} hover:shadow-md overflow-visible z-10 ${shapeClass === 'rhombus' ? '' : shapeClass}`}
                style={{
                    left: `${position.x}px`,
                    top: `${position.y}px`,
                    width: `${position.width}px`,
                    height: `${position.height}px`,
                    ...generateShapeStyles()
                }}
                onMouseDown={handleMouseDown}
            >
                {/* Connection points */}
                {!isLocked && (
                    <>
                        <ConnectionPoint
                            position="top"
                            isActive={false}
                            onClick={() => onStartConnection(step.step_number, 'top')}
                        />
                        <ConnectionPoint
                            position="right"
                            isActive={false}
                            onClick={() => onStartConnection(step.step_number, 'right')}
                        />
                        <ConnectionPoint
                            position="bottom"
                            isActive={false}
                            onClick={() => onStartConnection(step.step_number, 'bottom')}
                        />
                        <ConnectionPoint
                            position="left"
                            isActive={false}
                            onClick={() => onStartConnection(step.step_number, 'left')}
                        />
                    </>
                )}

                {/* Step number badge */}
                <div className="absolute -top-2 -left-2 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-bold rounded-full border border-gray-300 dark:border-gray-600 z-20">
                    {step.step_number}
                </div>

                {/* Content */}
                <div
                    className={`w-full h-full flex flex-col items-center justify-center p-2 ${textColor}`}
                    style={generateContentStyles()}
                >
                    <div className="font-medium text-center text-sm truncate max-w-full">
                        {step.action}
                    </div>
                    {step.points && (
                        <div className="text-xs text-center text-gray-500 dark:text-gray-400 truncate max-w-full mt-1">
                            {step.points}
                        </div>
                    )}

                    {/* Indicators */}
                    <div className="flex gap-1 mt-1">
                        {step.is_decision_point && (
                            <span className="inline-block w-2 h-2 bg-purple-500 rounded-full" title="Decision Point" />
                        )}
                        {(step.medications?.length ?? 0) > 0 && (
                            <span className="inline-block w-2 h-2 bg-red-500 rounded-full" title="Includes Medications" />
                        )}
                        {step.ui_element === 'text' && step.timer_duration && (
                            <span className="inline-block w-2 h-2 bg-amber-500 rounded-full" title="Timer" />
                        )}
                    </div>
                </div>

                {/* Edit button */}
                {!isLocked && (
                    <button
                        className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1 rounded-full z-20 hover:bg-blue-600 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditStep(step.step_number);
                        }}
                    >
                        <Edit size={12} />
                    </button>
                )}
            </div>
        );
    };

// Draw connections between steps
const ConnectionLines: React.FC<{
    connections: Connection[];
    stepPositions: Record<number, StepPosition>;
    tempConnection: {
        fromStep: number;
        fromPoint: 'top' | 'right' | 'bottom' | 'left';
        toPosition: { x: number, y: number } | null;
    } | null;
    onRemoveConnection: (from: number, to: number) => void;
    isLocked: boolean;
}> = ({ connections, stepPositions, tempConnection, onRemoveConnection, isLocked }) => {
    // Function to calculate connection points
    const calculateConnectionPoints = (
        fromStep: number,
        toStep: number,
        fromPoint?: 'top' | 'right' | 'bottom' | 'left',
        toPoint?: 'top' | 'right' | 'bottom' | 'left'
    ) => {
        const fromPos = stepPositions[fromStep];
        const toPos = stepPositions[toStep];

        if (!fromPos || !toPos) return null;

        // Determine best connection points if not specified
        if (!fromPoint || !toPoint) {
            // Calculate center points
            const fromCenterX = fromPos.x + fromPos.width / 2;
            const fromCenterY = fromPos.y + fromPos.height / 2;
            const toCenterX = toPos.x + toPos.width / 2;
            const toCenterY = toPos.y + toPos.height / 2;

            // Determine direction (which side of the shape to connect from/to)
            const angle = Math.atan2(toCenterY - fromCenterY, toCenterX - fromCenterX);

            // Convert angle to 4 possible directions
            const fromDirection = determineDirection(angle);
            const toDirection = determineDirection(angle + Math.PI); // Opposite direction

            fromPoint = fromDirection;
            toPoint = toDirection;
        }

        // Calculate actual connection points
        let startX, startY, endX, endY;

        switch (fromPoint) {
            case 'top':
                startX = fromPos.x + fromPos.width / 2;
                startY = fromPos.y;
                break;
            case 'right':
                startX = fromPos.x + fromPos.width;
                startY = fromPos.y + fromPos.height / 2;
                break;
            case 'bottom':
                startX = fromPos.x + fromPos.width / 2;
                startY = fromPos.y + fromPos.height;
                break;
            case 'left':
                startX = fromPos.x;
                startY = fromPos.y + fromPos.height / 2;
                break;
        }

        switch (toPoint) {
            case 'top':
                endX = toPos.x + toPos.width / 2;
                endY = toPos.y;
                break;
            case 'right':
                endX = toPos.x + toPos.width;
                endY = toPos.y + toPos.height / 2;
                break;
            case 'bottom':
                endX = toPos.x + toPos.width / 2;
                endY = toPos.y + toPos.height;
                break;
            case 'left':
                endX = toPos.x;
                endY = toPos.y + toPos.height / 2;
                break;
        }

        return { startX, startY, endX, endY, fromPoint, toPoint };
    };

    // Helper to determine which side of a shape to use based on angle
    const determineDirection = (angle: number): 'top' | 'right' | 'bottom' | 'left' => {
        // Convert to 0-360 degrees
        const degrees = ((angle * 180 / Math.PI) + 360) % 360;

        if (degrees >= 315 || degrees < 45) return 'right';
        if (degrees >= 45 && degrees < 135) return 'bottom';
        if (degrees >= 135 && degrees < 225) return 'left';
        return 'top';
    };

    // Create SVG path for connection
    const createPath = (startX: number, startY: number, endX: number, endY: number) => {
        // Create a bezier curve
        const dx = Math.abs(endX - startX);
        const dy = Math.abs(endY - startY);

        // Determine control point distances
        const controlDistance = Math.max(dx, dy) * 0.5;

        // Determine control points based on direction
        let controlX1, controlY1, controlX2, controlY2;

        // Determine if connection is primarily horizontal or vertical
        if (dx > dy) {
            // Horizontal connection
            controlX1 = startX + controlDistance;
            controlY1 = startY;
            controlX2 = endX - controlDistance;
            controlY2 = endY;
        } else {
            // Vertical connection
            controlX1 = startX;
            controlY1 = startY + controlDistance;
            controlX2 = endX;
            controlY2 = endY - controlDistance;
        }

        return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
    };

    return (
        <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 5 }}>
            <defs>
                <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
                </marker>
            </defs>

            {/* Render existing connections */}
            {connections.map((conn, index) => {
                const points = calculateConnectionPoints(conn.from, conn.to, conn.fromPoint, conn.toPoint);

                if (!points) return null;

                const { startX, startY, endX, endY } = points;
                const path = createPath(startX, startY, endX, endY);

                return (
                    <g key={`connection-${index}`}>
                        <path
                            d={path}
                            fill="none"
                            stroke="#4B5563"
                            strokeWidth="2"
                            markerEnd="url(#arrowhead)"
                        />

                        {/* Label - center of the path */}
                        {conn.label && (
                            <text
                                x={(startX + endX) / 2}
                                y={((startY + endY) / 2) - 10}
                                textAnchor="middle"
                                fill="#4B5563"
                                fontSize="12"
                                fontWeight="500"
                                className="pointer-events-auto cursor-pointer"
                            >
                                {conn.label}
                            </text>
                        )}

                        {/* Remove connection button */}
                        {!isLocked && (
                            <g
                                className="cursor-pointer"
                                onClick={() => onRemoveConnection(conn.from, conn.to)}
                            >
                                <circle
                                    cx={(startX + endX) / 2}
                                    cy={(startY + endY) / 2}
                                    r="8"
                                    fill="white"
                                    stroke="#EF4444"
                                    strokeWidth="1"
                                />
                                <text
                                    x={(startX + endX) / 2}
                                    y={(startY + endY) / 2 + 4}
                                    textAnchor="middle"
                                    fill="#EF4444"
                                    fontSize="12"
                                    fontWeight="bold"
                                >
                                    ×
                                </text>
                            </g>
                        )}
                    </g>
                );
            })}

            {/* Render temporary connection being created */}
            {tempConnection?.toPosition && (
                <g>
                    <path
                        d={(() => {
                            const fromPos = stepPositions[tempConnection.fromStep];
                            if (!fromPos) return '';

                            let startX, startY;

                            switch (tempConnection.fromPoint) {
                                case 'top':
                                    startX = fromPos.x + fromPos.width / 2;
                                    startY = fromPos.y;
                                    break;
                                case 'right':
                                    startX = fromPos.x + fromPos.width;
                                    startY = fromPos.y + fromPos.height / 2;
                                    break;
                                case 'bottom':
                                    startX = fromPos.x + fromPos.width / 2;
                                    startY = fromPos.y + fromPos.height;
                                    break;
                                case 'left':
                                    startX = fromPos.x;
                                    startY = fromPos.y + fromPos.height / 2;
                                    break;
                            }

                            return createPath(startX, startY, tempConnection.toPosition.x, tempConnection.toPosition.y);
                        })()}
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                </g>
            )}
        </svg>
    );
};

// Main FlowchartEditor component
const FlowchartEditor: React.FC<FlowchartEditorProps> = ({ data, updateData }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [stepPositions, setStepPositions] = useState<Record<number, StepPosition>>({});
    const [connections, setConnections] = useState<Connection[]>([]);
    const [selectedStep, setSelectedStep] = useState<number | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isLocked, setIsLocked] = useState(false);
    const [, setEditingStep] = useState<number | null>(null);

    // Track connection currently being created
    const [tempConnection, setTempConnection] = useState<{
        fromStep: number;
        fromPoint: 'top' | 'right' | 'bottom' | 'left';
        toPosition: { x: number, y: number } | null;
    } | null>(null);

    // Mouse position for tracking temp connection
    const [, setMousePosition] = useState<{ x: number, y: number } | null>(null);

    // Track if we're panning the canvas
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // Build step map for reference
    const stepsMap = useMemo(() => {
        const map = new Map<number, EnhancedStep>();
        data.steps.forEach(step => {
            // Convert from simplified format to enhanced step
            const enhancedStep: EnhancedStep = {
                ...step,
                // Determine if this is a decision point (has multiple next steps with conditions)
                is_decision_point: step.next && step.next.length > 1
            };
    
            // Check if step has a timer
            if (step.ui && step.ui.length > 2 && step.ui[0] === 'timer') {
                enhancedStep.timer_duration = parseInt(step.ui[2], 10);
                enhancedStep.timer_label = step.ui[1];
            }
    
            map.set(step.step, enhancedStep);
        });
        return map;
    }, [data.steps]);

    // Initialize step positions and connections on first render
    useEffect(() => {
        if (!isInitialized && containerRef.current) {
            initializePositions();
            initializeConnections();
            setIsInitialized(true);
        }
    }, [isInitialized, data]);

    // Initialize step positions in a layout
    const initializePositions = () => {
        if (!containerRef.current) return;

        // Collect all steps
        const allSteps: EnhancedStep[] = [];
        data.steps.forEach(step => {
            allSteps.push(step as EnhancedStep);
        });

        // Sort steps by number
        allSteps.sort((a, b) => a.step - b.step);

        // Set up initial positions based on a basic layout algorithm
        const positions: Record<number, StepPosition> = {};
        const stepWidth = 180;
        const stepHeight = 100;
        const margin = 40;

        // Use a force-directed layout algorithm (simplified)
        // Group steps into levels based on connectivity
        const levels: number[][] = [];
        const visited = new Set<number>();
        
        // Start with root nodes (those with no incoming connections)
        const incomingConnections = new Map<number, number[]>();
        allSteps.forEach(step => {
        step.next.forEach(nextStep => {
            if (!incomingConnections.has(nextStep.next)) {
            incomingConnections.set(nextStep.next, []);
            }
            incomingConnections.get(nextStep.next)?.push(step.step);
        });
        });

        // Find roots (steps with no incoming connections)
        const roots = allSteps
        .filter(step => !incomingConnections.has(step.step) || incomingConnections.get(step.step)?.length === 0)
        .map(step => step.step);
        
        if (roots.length === 0 && allSteps.length > 0) {
        // If no roots, just start with the lowest step number
        roots.push(allSteps[0].step);
        }

        // Perform a breadth-first traversal to assign levels
        const queue = [...roots];
        levels.push(roots);
        roots.forEach(root => visited.add(root));

        while (queue.length > 0) {
        const levelSize = queue.length;
        const nextLevel: number[] = [];

        for (let i = 0; i < levelSize; i++) {
            const currentStep = queue.shift()!;
            const step = stepsMap.get(currentStep);

            if (step) {
            // Add next steps to queue
            step.next.forEach(nextStep => {
                if (!visited.has(nextStep.next)) {
                visited.add(nextStep.next);
                queue.push(nextStep.next);
                nextLevel.push(nextStep.next);
                }
            });
            }
        }

        if (nextLevel.length > 0) {
            levels.push(nextLevel);
        }
        }

        // Handle any steps not visited (isolated nodes)
        const isolatedNodes = allSteps
        .filter(step => !visited.has(step.step))
        .map(step => step.step);
        
        if (isolatedNodes.length > 0) {
        levels.push(isolatedNodes);
        }

        // Assign positions based on levels
        const maxNodesInLevel = Math.max(...levels.map(level => level.length));
        const levelHeight = stepHeight + margin;
        const canvasWidth = (stepWidth + margin) * maxNodesInLevel;

        levels.forEach((level, levelIdx) => {
        // Center the nodes in this level
        const levelWidth = (stepWidth + margin) * level.length;
        const startX = (canvasWidth - levelWidth) / 2 + margin / 2;

        level.forEach((stepId, idx) => {
            positions[stepId] = {
            x: startX + idx * (stepWidth + margin),
            y: levelIdx * (levelHeight + margin) + 50,
            width: stepWidth,
            height: stepHeight
            };
        });
        });

        setStepPositions(positions);
    };

    // Initialize connections based on step data
    const initializeConnections = () => {
        const newConnections: Connection[] = [];

        // Process all steps
        data.steps.forEach(step => {
            if (step.next && step.next.length > 0) {
                step.next.forEach(nextStep => {
                    newConnections.push({
                        from: step.step,
                        to: nextStep.next,
                        label: nextStep.condition || undefined
                    });
                });
            }
        });

        setConnections(newConnections);
    };

    // Handle updating step position
    const handlePositionChange = (stepId: number, newPosition: { x: number, y: number }) => {
        setStepPositions(prev => ({
            ...prev,
            [stepId]: {
                ...prev[stepId],
                x: newPosition.x,
                y: newPosition.y
            }
        }));
    };

    // Handle starting a new connection
    const handleStartConnection = (stepId: number, point: 'top' | 'right' | 'bottom' | 'left') => {
        setTempConnection({
            fromStep: stepId,
            fromPoint: point,
            toPosition: null
        });
    };

    // Handle mouse movement for connection creation
    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left) / scale - panOffset.x;
            const y = (e.clientY - rect.top) / scale - panOffset.y;

            // Update mouse position for temp connection
            setMousePosition({ x, y });

            // Update temp connection if one is in progress
            if (tempConnection) {
                setTempConnection({
                    ...tempConnection,
                    toPosition: { x, y }
                });
            }

            // Handle panning
            if (isPanning) {
                const dx = e.clientX - panStart.x;
                const dy = e.clientY - panStart.y;

                setPanOffset(prev => ({
                    x: prev.x + dx / scale,
                    y: prev.y + dy / scale
                }));

                setPanStart({
                    x: e.clientX,
                    y: e.clientY
                });
            }
        }
    };

    // Handle mouse up event
    const handleMouseUp = () => {
        // End panning
        if (isPanning) {
            setIsPanning(false);
        }

        // Clear temp connection if not over a step
        if (tempConnection) {
            setTempConnection(null);
        }
    };

    // Handle mouse down on container (for panning)
    const handleMouseDown = (e: React.MouseEvent) => {
        // Only start panning if clicking on the background (not a step)
        if (e.target === containerRef.current) {
            setIsPanning(true);
            setPanStart({
                x: e.clientX,
                y: e.clientY
            });

            // Prevent default to avoid text selection
            e.preventDefault();
        }
    };

    // Handle wheel event for zooming
    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey) {
            e.preventDefault();

            // Calculate zoom
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const newScale = Math.max(0.5, Math.min(2, scale + delta));

            // Update scale
            setScale(newScale);
        }
    };

    // Handle removing a connection
    const handleRemoveConnection = (fromStepId: number, toStepId: number) => {
        // Remove from connections state
        setConnections(connections.filter(conn =>
            !(conn.from === fromStepId && conn.to === toStepId)
        ));

        // Remove from data model
        const fromStep = stepsMap.get(fromStepId);

        if (!fromStep) return;

        const newData = structuredClone(data);
        let updated = false;

        // Find the step in newData
        const stepIndex = newData.steps.findIndex(step => step.step === fromStepId);
        
        if (stepIndex !== -1) {
            const step = newData.steps[stepIndex];
            
            // Find the specific next step connection to remove
            const nextStepIndex = step.next.findIndex(next => next.next === toStepId);
            
            if (nextStepIndex !== -1) {
                // Remove this connection
                step.next.splice(nextStepIndex, 1);
                updated = true;
            }
        }

        // Update data if changed
        if (updated) {
            updateData(newData);
        }
    };

    // Handle step edit request
    const handleEditStep = (stepId: number) => {
        setEditingStep(stepId);
        setSelectedStep(stepId);
    };

    return (
        <div className="w-full h-full relative flex flex-col">
            {/* Toolbar */}
            <div className="bg-white dark:bg-gray-800 p-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                    <button
                        className="p-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => setScale(Math.min(scale + 0.1, 2))}
                        title="Zoom In"
                    >
                        <ZoomIn size={18} />
                    </button>
                    <button
                        className="p-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => setScale(Math.max(scale - 0.1, 0.5))}
                        title="Zoom Out"
                    >
                        <ZoomOut size={18} />
                    </button>
                    <button
                        className="p-1.5 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                        onClick={() => {
                            setScale(1);
                            setPanOffset({ x: 0, y: 0 });
                        }}
                        title="Reset View"
                    >
                        <Maximize size={18} />
                    </button>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        Zoom: {Math.round(scale * 100)}%
                    </span>
                </div>

                <div>
                    <button
                        className={`flex items-center text-sm px-3 py-1.5 rounded ${isLocked
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            }`}
                        onClick={() => setIsLocked(!isLocked)}
                    >
                        {isLocked ? (
                            <>
                                <Lock size={16} className="mr-1.5" />
                                <span>Locked</span>
                            </>
                        ) : (
                            <>
                                <Unlock size={16} className="mr-1.5" />
                                <span>Editing</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Canvas */}
            <div
                ref={containerRef}
                className="flex-grow relative overflow-hidden bg-gray-50 dark:bg-gray-900"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
            >
                {/* Help text when creating a connection */}
                {tempConnection && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-20">
                        Click on another step to complete the connection
                    </div>
                )}

                {/* Grid background */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(127, 127, 127, 0.1)" strokeWidth="0.5" />
                            </pattern>
                            <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                                <rect width="100" height="100" fill="url(#smallGrid)" />
                                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(127, 127, 127, 0.2)" strokeWidth="1" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                </div>

                {/* Flowchart content */}
                <div
                    className="absolute"
                    style={{
                        transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
                        transformOrigin: '0 0',
                        width: '100%',
                        height: '100%'
                    }}
                >
                    {/* Connections */}
                    <ConnectionLines
                        connections={connections}
                        stepPositions={stepPositions}
                        tempConnection={tempConnection}
                        onRemoveConnection={handleRemoveConnection}
                        isLocked={isLocked}
                    />

                    {/* Steps */}
                    {Array.from(stepsMap.entries()).map(([stepId, step]) => (
                        <FlowchartStep
                            key={stepId}
                            step={step}
                            position={stepPositions[stepId] || { x: 0, y: 0, width: 180, height: 100 }}
                            onPositionChange={handlePositionChange}
                            onEditStep={handleEditStep}
                            onStartConnection={handleStartConnection}
                            isSelected={selectedStep === stepId}
                            onSelect={setSelectedStep}
                            isLocked={isLocked}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FlowchartEditor;