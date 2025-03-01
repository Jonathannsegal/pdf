import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  MarkerType,
  Handle,
  Position,
  ReactFlowInstance,
  Connection as ReactFlowConnection,
  BackgroundVariant,
  Node,
  Edge,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Maximize, Lock, Unlock, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import type { JsonResult, EnhancedStep } from '@/app/types';

// Define node types with handles
const DecisionNode: React.FC<{ data: EnhancedStep }> = ({ data }) => {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} id="target" style={{ background: '#555' }} />
      <div className="w-40 h-40 transform rotate-45 bg-purple-100 border-2 border-purple-300 shadow-md flex items-center justify-center">
        <div className="transform -rotate-45 w-40 h-40 flex flex-col items-center justify-center p-3 text-center">
          <div className="font-semibold text-purple-900 mb-1">
            {data.action}
          </div>
          {data.points && (
            <div className="text-xs text-gray-700">
              {data.points}
            </div>
          )}
          {data.decision_text && (
            <div className="mt-1 p-1 rounded text-xs font-medium text-purple-900">
              {data.decision_text}
            </div>
          )}
          <div className="absolute -top-6 -left-2 bg-gray-100 px-2 py-0.5 text-xs font-bold rounded-full border border-gray-300 transform -rotate-45">
            {data.step_number}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="source" style={{ background: '#555' }} />
      <Handle type="source" position={Position.Left} id="source-left" style={{ background: '#555' }} />
      <Handle type="source" position={Position.Right} id="source-right" style={{ background: '#555' }} />
    </div>
  );
};

const ActionNode: React.FC<{ data: EnhancedStep }> = ({ data }) => {
  return (
    <div className="relative w-56 bg-white border-2 border-gray-200 p-3 rounded-lg shadow-sm">
      <Handle type="target" position={Position.Top} id="target" style={{ background: '#555' }} />
      <div className="font-semibold text-gray-900 mb-1">
        {data.action}
      </div>
      
      {data.points && (
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {data.points}
        </div>
      )}

      <div className="absolute -top-2 -left-2 bg-gray-100 px-2 py-0.5 text-xs font-bold rounded-full border border-gray-300">
        {data.step_number}
      </div>
      <Handle type="source" position={Position.Bottom} id="source" style={{ background: '#555' }} />
    </div>
  );
};

const AssessmentNode: React.FC<{ data: EnhancedStep }> = ({ data }) => {
  return (
    <div className="relative w-56 bg-blue-50 border border-blue-200 p-3 rounded-lg shadow-sm">
      <Handle type="target" position={Position.Top} id="target" style={{ background: '#555' }} />
      <div className="font-semibold text-blue-800 mb-1">
        {data.action}
      </div>

      {data.points && (
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {data.points}
        </div>
      )}

      <div className="absolute -top-2 -left-2 bg-gray-100 px-2 py-0.5 text-xs font-bold rounded-full border border-gray-300">
        {data.step_number}
      </div>
      <Handle type="source" position={Position.Bottom} id="source" style={{ background: '#555' }} />
    </div>
  );
};

const TreatmentNode: React.FC<{ data: EnhancedStep }> = ({ data }) => {
  return (
    <div className="relative w-56 bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm">
      <Handle type="target" position={Position.Top} id="target" style={{ background: '#555' }} />
      <div className="font-semibold text-green-800 mb-1">
        {data.action}
      </div>

      {data.points && (
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {data.points}
        </div>
      )}

      {data.medications && data.medications.length > 0 && (
        <div className="mt-2 p-1.5 bg-white rounded text-xs border border-gray-200">
          <div className="font-medium text-gray-700 mb-0.5">Medications:</div>
          <ul className="list-disc pl-4 space-y-0.5">
            {data.medications.map((med, i) => (
              <li key={i} className="text-gray-700">
                {med.name} {med.dose && med.route ? `${med.dose} ${med.route}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="absolute -top-2 -left-2 bg-gray-100 px-2 py-0.5 text-xs font-bold rounded-full border border-gray-300">
        {data.step_number}
      </div>
      <Handle type="source" position={Position.Bottom} id="source" style={{ background: '#555' }} />
    </div>
  );
};

// Define custom interface for connections in our layout system
interface FlowConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  labelStyle?: React.CSSProperties;
  labelBgStyle?: React.CSSProperties;
  labelBgPadding?: [number, number];
  labelBgBorderRadius?: number;
}

// Define node types
const nodeTypes: NodeTypes = {
  decision: DecisionNode,
  action: ActionNode,
  assessment: AssessmentNode,
  treatment: TreatmentNode,
};

interface FlowchartEditorProps {
  data: JsonResult;
  updateData: (data: JsonResult) => void;
}

// The main component
const FlowchartEditor: React.FC<FlowchartEditorProps> = ({ data, updateData }) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLayouting, setIsLayouting] = useState(false);

  // Custom automatic layout function
  interface Step {
    step_number: number;
    action: string;
    points?: string;
    decision_text?: string;
    is_decision_point?: boolean;
    step_type?: string;
    medications?: { name: string; dose?: string; route?: string }[];
    next_steps?: number[];
    decision_paths?: { condition: string; next_steps: number[] }[];
  }

  interface Position {
    x: number;
    y: number;
  }

  const calculateLayout = useCallback((steps: Step[], connections: FlowConnection[]) => {
    // Create a map of nodes by step number
    const nodeMap = new Map<string, Step>();
    steps.forEach(step => {
      nodeMap.set(step.step_number.toString(), step);
    });

    // Identify root nodes (nodes that are not targets of any connection)
    const targetNodes = new Set<string>();
    connections.forEach(conn => {
      targetNodes.add(conn.target);
    });

    const rootNodes = steps.filter(step => !targetNodes.has(step.step_number.toString()));

    // Create a map of children for each node
    const childrenMap = new Map<string, string[]>();
    steps.forEach(step => {
      childrenMap.set(step.step_number.toString(), []);
    });

    connections.forEach(conn => {
      const parentId = conn.source;
      const childId = conn.target;
      const children = childrenMap.get(parentId) || [];
      if (!children.includes(childId)) {
        children.push(childId);
      }
      childrenMap.set(parentId, children);
    });

    // Assign levels to nodes using BFS
    const levelMap = new Map<string, number>();
    const queue = [...rootNodes.map(node => ({ id: node.step_number.toString(), level: 0 }))];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;

      if (visited.has(id)) {
        // If we've seen this node before, use the maximum level
        levelMap.set(id, Math.max(levelMap.get(id)!, level));
        continue;
      }

      levelMap.set(id, level);
      visited.add(id);

      const children = childrenMap.get(id) || [];
      children.forEach(childId => {
        queue.push({ id: childId, level: level + 1 });
      });
    }

    // In case there are nodes not visited (disconnected components)
    steps.forEach(step => {
      const id = step.step_number.toString();
      if (!levelMap.has(id)) {
        levelMap.set(id, 0);
      }
    });

    // Organize nodes by level
    const nodesByLevel = new Map<number, string[]>();
    levelMap.forEach((level, id) => {
      if (!nodesByLevel.has(level)) {
        nodesByLevel.set(level, []);
      }
      nodesByLevel.get(level)!.push(id);
    });

    // Position nodes
    const horizontalSpacing = 300;
    const verticalSpacing = 200;
    const positions = new Map<string, Position>();

    nodesByLevel.forEach((nodeIds, level) => {
      const levelWidth = nodeIds.length * horizontalSpacing;
      const startX = -levelWidth / 2 + horizontalSpacing / 2;

      // Sort nodes to get a more consistent layout
      nodeIds.sort((a, b) => {
        // Sort first by decision/normal type for better organization
        const isDecisionA = nodeMap.get(a)?.is_decision_point || false;
        const isDecisionB = nodeMap.get(b)?.is_decision_point || false;
        if (isDecisionA !== isDecisionB) {
          return isDecisionA ? 1 : -1; // Keep decisions to the right
        }
        return parseInt(a) - parseInt(b); // Then by node number for consistency
      });

      // Assign positions with special handling for decision points
      nodeIds.forEach((id, index) => {
        const node = nodeMap.get(id);
        
        // Position calculation
        let x = startX + index * horizontalSpacing;

        // Adjust x position based on connections
        const parents: string[] = [];

        connections.forEach(conn => {
          if (conn.target === id) parents.push(conn.source);
        });

        // If this node has one parent, try to align with it
        if (parents.length === 1) {
          const parentId = parents[0];
          if (positions.has(parentId)) {
            const parentPos = positions.get(parentId)!;
            // Only influence slightly, don't completely override
            x = (x + parentPos.x) / 2;
          }
        }

        // Decision points might need more space
        const y = level * verticalSpacing;

        positions.set(id, { x, y });
      });
    });

    // Create React Flow nodes
    const flowNodes = steps.map(step => {
      const id = step.step_number.toString();
      let type = 'action';

      if (step.is_decision_point) {
        type = 'decision';
      } else if (step.step_type === 'assessment') {
        type = 'assessment';
      } else if (step.step_type === 'treatment') {
        type = 'treatment';
      }

      const pos = positions.get(id) || { x: 0, y: 0 };

      return {
        id,
        type,
        position: pos,
        data: step,
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
        draggable: !isLocked,
      } as Node;
    });

    // Create React Flow edges with improved connection paths
    const flowEdges = connections.map(conn => {
      const sourceId = conn.source;
      const targetId = conn.target;

      // Determine edge style based on connection type
      const isDecisionConnection = nodeMap.get(sourceId)?.is_decision_point || false;

      // Get source and target positions
      const sourcePos = positions.get(sourceId);
      const targetPos = positions.get(targetId);

      // Calculate curve factor based on horizontal distance
      let curvature = 0.5;
      if (sourcePos && targetPos) {
        const dx = Math.abs(sourcePos.x - targetPos.x);
        if (dx > horizontalSpacing) {
          curvature = 0.2 + (dx / 1000); // Increase curvature for distant nodes
        }
      }

      return {
        id: conn.id,
        source: sourceId,
        target: targetId,
        sourceHandle: conn.sourceHandle || 'source',
        targetHandle: 'target',
        type: 'smoothstep',
        animated: false,
        label: conn.label,
        labelStyle: conn.labelStyle,
        labelBgStyle: conn.labelBgStyle,
        labelBgPadding: conn.labelBgPadding,
        labelBgBorderRadius: conn.labelBgBorderRadius,
        style: { stroke: '#333', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#333',
        },
        // Add variable curvature factor to reduce edge overlaps
        curvature: isDecisionConnection ? curvature + 0.2 : curvature,
      } as Edge;
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [isLocked]);

  // Create nodes and edges from data
  useEffect(() => {
    if (!data?.document?.procedures?.[0]) return;
    
    const procedure = data.document.procedures[0];
    const allSteps: EnhancedStep[] = [];
    const flowEdges: FlowConnection[] = [];
    
    // Extract all steps from sections
    procedure.sections.forEach(section => {
      section.steps.forEach(step => {
        allSteps.push(step as EnhancedStep);
      });
    });
    
    // Create edges
    allSteps.forEach(step => {
      const fromId = step.step_number.toString();
      
      // Regular next steps
      if (step.next_steps && step.next_steps.length > 0) {
        step.next_steps.forEach(nextStep => {
          const toId = nextStep.toString();
          
          // Create edge
          const edge: FlowConnection = {
            id: `e${step.step_number}-${nextStep}`,
            source: fromId,
            target: toId,
            sourceHandle: 'source',
            targetHandle: 'target',
          };
          
          flowEdges.push(edge);
        });
      }
      
      // Decision paths
      if (step.is_decision_point && step.decision_paths) {
        step.decision_paths.forEach((path, index) => {
          path.next_steps.forEach(nextStep => {
            const toId = nextStep.toString();
            
            // Use different source handles for decision paths
            const sourceHandle = index === 0 ? 'source' : 
                               index === 1 ? 'source-right' : 'source-left';
            
            // Create edge with label
            const edge: FlowConnection = {
              id: `e${step.step_number}-${nextStep}-${index}`,
              source: fromId,
              target: toId,
              sourceHandle: sourceHandle,
              targetHandle: 'target',
              label: path.condition,
              labelStyle: { fill: '#000', fontWeight: 700 },
              labelBgStyle: { fill: '#FFFFFF', fillOpacity: 0.8 },
              labelBgPadding: [4, 2],
              labelBgBorderRadius: 2,
            };
            
            flowEdges.push(edge);
          });
        });
      }
    });
    
    setIsLayouting(true);
    
    // Apply layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = calculateLayout(allSteps, flowEdges);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 });
      }
      setIsLayouting(false);
    }, 50);
  }, [data, calculateLayout, reactFlowInstance, setNodes, setEdges]);

  const handleLayout = useCallback(() => {
    if (nodes.length === 0) return;
    
    setIsLayouting(true);
    
    // Extract step data from nodes
    const steps = nodes.map(node => node.data);
    
    // Extract connection data from edges
    const connections = edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      labelStyle: edge.labelStyle,
      labelBgStyle: edge.labelBgStyle,
      labelBgPadding: edge.labelBgPadding as [number, number] | undefined,
      labelBgBorderRadius: edge.labelBgBorderRadius,
    }));
    
    // Apply layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = calculateLayout(steps, connections);
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 });
      }
      setIsLayouting(false);
    }, 50);
  }, [nodes, edges, calculateLayout, reactFlowInstance, setNodes, setEdges]);

  const onConnect = useCallback((params: ReactFlowConnection) => {
    setEdges((eds) => 
      addEdge(
        { 
          ...params,
          type: 'smoothstep',
          animated: false,
          style: { stroke: '#333', strokeWidth: 2 },
          markerEnd: { 
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: '#333',
          },
          curvature: 0.4, // Add curvature to reduce edge overlaps
        }, 
        eds
      )
    );

    // Update the data model
    const sourceId = parseInt(params.source ?? '0');
    const targetId = parseInt(params.target ?? '0');
    
    if (!isNaN(sourceId) && !isNaN(targetId)) {
      const newData = structuredClone(data);
      
      // Find the source step and add the connection
      let updated = false;
      newData.document.procedures[0].sections.forEach(section => {
        section.steps.forEach(step => {
          if (step.step_number === sourceId) {
            if (!step.next_steps) {
              step.next_steps = [];
            }
            
            if (!step.next_steps.includes(targetId)) {
              step.next_steps.push(targetId);
              updated = true;
            }
          }
        });
      });
      
      if (updated) {
        updateData(newData);
      }
    }
  }, [setEdges, data, updateData]);

  const fitViewport = useCallback(() => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
      setZoom(reactFlowInstance.getZoom());
    }
  }, [reactFlowInstance]);

  const toggleFullscreen = () => {
    if (reactFlowWrapper.current) {
      if (!document.fullscreenElement) {
        reactFlowWrapper.current.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch((err: Error) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handleZoomIn = () => {
    if (reactFlowInstance) {
      const newZoom = Math.min(zoom + 0.1, 2);
      reactFlowInstance.zoomTo(newZoom);
      setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      const newZoom = Math.max(zoom - 0.1, 0.3);
      reactFlowInstance.zoomTo(newZoom);
      setZoom(newZoom);
    }
  };

  return (
    <div className="w-full h-full flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden" style={{ height: '70vh' }}>
      <ReactFlowProvider>
        <div className="flex-grow" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isLocked ? undefined : onNodesChange}
            onEdgesChange={isLocked ? undefined : onEdgesChange}
            onConnect={isLocked ? undefined : onConnect}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            fitView
            defaultEdgeOptions={{
              type: 'smoothstep',
              style: { stroke: '#333', strokeWidth: 2 },
            }}
            connectionLineStyle={{ stroke: '#333', strokeWidth: 2 }}
            attributionPosition="bottom-right"
            nodesDraggable={!isLocked}
            nodesConnectable={!isLocked}
            elementsSelectable={!isLocked}
            minZoom={0.3}
            maxZoom={2}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          >
            <Panel position="top-left" className="flex items-center gap-2">
              <button
                className="p-2 rounded bg-white shadow hover:bg-gray-100 text-gray-700 flex items-center gap-1"
                onClick={toggleFullscreen}
                title="Toggle Fullscreen"
              >
                <Maximize size={16} />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
              
              <button
                className={`p-2 rounded shadow flex items-center gap-1 ${
                  isLocked 
                    ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsLocked(!isLocked)}
                title={isLocked ? "Unlock Editing" : "Lock Editing"}
              >
                {isLocked ? (
                  <>
                    <Lock size={16} />
                    <span className="hidden sm:inline">Locked</span>
                  </>
                ) : (
                  <>
                    <Unlock size={16} />
                    <span className="hidden sm:inline">Editing</span>
                  </>
                )}
              </button>

              <button
                className={`p-2 rounded bg-white shadow hover:bg-gray-100 text-gray-700 flex items-center gap-1 ${isLayouting ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleLayout}
                disabled={isLayouting}
                title="Auto Layout"
              >
                <RefreshCw size={16} className={isLayouting ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Layout</span>
              </button>

              <button
                className="p-2 rounded bg-white shadow hover:bg-gray-100 text-gray-700"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>

              <button
                className="p-2 rounded bg-white shadow hover:bg-gray-100 text-gray-700"
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              
              <button
                className="p-2 rounded bg-white shadow hover:bg-gray-100 text-gray-700"
                onClick={fitViewport}
                title="Fit View"
              >
                <Maximize size={16} />
              </button>

              <div className="bg-white px-2 py-1 rounded shadow text-xs text-gray-700">
                {Math.round(zoom * 100)}%
              </div>
            </Panel>
            
            <Controls showInteractive={false} />
            <MiniMap zoomable pannable nodeStrokeWidth={3} />
            <Background variant="dots" gap={15} size={1} color="#aaa" />
          </ReactFlow>
        </div>
      </ReactFlowProvider>
    </div>
  );
};

export default FlowchartEditor;