export * from './enhanced-step';

export interface ComponentStatus {
  status: string;
  message: string;
}

export interface HealthComponents {
  poppler?: ComponentStatus;
  ollama?: ComponentStatus;
  python_dependencies?: ComponentStatus;
  unity?: ComponentStatus & {
    api_connected: boolean;
    web_connected: boolean;
  };
}

export interface HealthStatus {
  status: string;
  message: string;
  components: HealthComponents;
}

export interface HistoryItem {
  filename: string;
  procedure_name: string;
  timestamp: string;
  is_active: boolean;
}

export interface ActiveFile {
  filename: string;
}

export interface ApiError {
  type: "connection" | "fetch" | "process";
  message: string;
}

// Update these interfaces to match FlowchartCustomizationWindow
export type UIElementType = "checkbox" | "text" | "number" | "select";
export type StepType = "assessment" | "intervention" | "treatment" | "standard";

// New interfaces for flowchart functionality
export interface DecisionPath {
  condition: string;
  next_steps: number[];
}

export interface Medication {
  name: string;
  dose?: string;
  route?: string;
  frequency?: string;
  timing?: string;
  concentration?: string;
  indication?: string;
  alternative?: string;
  addition_to?: string;
}

export interface Step {
  step_number: number;
  action: string;
  points: string;
  requirements: string[];
  warnings: string[];
  measurements: string[];
  ui_element: UIElementType;
  // Flowchart-specific properties
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

export interface Section {
  name: string;
  steps: Step[];
}

export interface Procedure {
  procedure_name: string;
  procedure_code: string;
  procedure_type?: "standard" | "flowchart"; // Added procedure_type
  sections: Section[];
  guidelines?: Record<string, string[]>; // Added guidelines
  key_points?: string[]; // Added key_points
  notes?: string; // Added notes
}

export interface JsonDocument {
  metadata: {
    page_count: number;
    processing_date: string;
    model_used: string;
    original_filename: string;
    settings_version: string;
    base64_image: string;
    source?: string; // Added source field
  };
  procedures: Procedure[];
}

export interface JsonResult {
  document: JsonDocument;
  filename?: string;
  timestamp?: string;
  is_active?: boolean;
  procedure_name?: string;
}

// Type for enhanced step with all possible properties
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
