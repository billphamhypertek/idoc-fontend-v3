import { MarkerType } from "reactflow";

export type WorkflowNode = {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    role: string;
    name: string;
    title: string;
    department: string;
    isMainProcessor: boolean;
    result?: string;
  };
};

export type WorkflowEdge = {
  id: string;
  source: string;
  target: string;
  type: string;
  animated: boolean;
  style: {
    stroke: string;
    strokeWidth: number;
  };
  markerEnd: {
    type: MarkerType;
    color: string;
    width: number;
    height: number;
  };
};

export type WorkflowData = {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};
