import React from 'react';
import { ReactFlowProvider } from 'reactflow';
import FlowchartEditor from './FlowchartEditor';
import type { JsonResult } from '@/app/types';

interface FlowchartEditorWrapperProps {
  data: JsonResult;
  updateData: (data: JsonResult) => void;
}

const FlowchartEditorWrapper: React.FC<FlowchartEditorWrapperProps> = ({ data, updateData }) => {
  return (
    <ReactFlowProvider>
      <FlowchartEditor data={data} updateData={updateData} />
    </ReactFlowProvider>
  );
};

export default FlowchartEditorWrapper;