import { Step, DecisionPath, Medication, StepType } from "./";

// Enhanced Step interface with all optional flowchart-specific properties
export interface EnhancedStep extends Step {
  timer_label?: string;
  timer_duration?: number;
  next_steps?: number[];
  is_decision_point?: boolean;
  decision_text?: string;
  decision_paths?: DecisionPath[];
  step_type?: StepType;
  additional_info?: string[];
  medications?: Medication[];
}

// Position information for flowchart steps
export interface StepPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Connection between steps in a flowchart
export interface Connection {
  from: number;
  to: number;
  label?: string;
  fromPoint?: "top" | "right" | "bottom" | "left";
  toPoint?: "top" | "right" | "bottom" | "left";
}
