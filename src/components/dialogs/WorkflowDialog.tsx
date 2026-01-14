import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  NodeTypes,
  MarkerType,
  ConnectionLineType,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom Node Component
const OrganizationNode = ({ data }: { data: any }) => {
  const { role, name, title, department, isMainProcessor, result } = data;

  return (
    <div
      className={`p-4 rounded-lg shadow-md border-2 min-w-[200px] ${
        isMainProcessor
          ? "bg-purple-100 border-purple-300"
          : role === "Phối hợp"
            ? "bg-cyan-100 border-cyan-300"
            : "bg-purple-50 border-purple-200"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: "transparent",
          border: "none",
          width: 0,
          height: 0,
        }}
      />
      <div className="text-center">
        <div
          className={`text-sm font-medium mb-2 ${
            role === "Phối hợp" ? "text-green-600" : "text-red-600"
          }`}
        >
          {role}
        </div>
        <div className="text-lg font-bold text-gray-900 mb-1">{name}</div>
        <div className="text-sm text-gray-700 mb-1">{title}</div>
        <div className="text-xs text-gray-600 mb-2">{department}</div>
        {result && (
          <div className="max-w-xs mx-auto">
            <div className="text-xs font-medium text-blue-600 mb-1">
              Kết quả thực hiện: {result}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  organization: OrganizationNode,
};

interface WorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workItem?: {
    workName?: string;
    [key: string]: any;
  };
  workflowData?: {
    nodes: Node[];
    edges: Edge[];
  };
}

export default function WorkflowDialog({
  isOpen,
  onClose,
  workItem,
  workflowData: customWorkflowData,
}: WorkflowDialogProps) {
  // Default workflow data if not provided
  const defaultWorkflowData = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    return { nodes, edges };
  }, []);

  // Use custom data if provided, otherwise use default
  const workflowData = customWorkflowData || defaultWorkflowData;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {workItem?.workName || "Sơ đồ giao việc"}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          {/* ReactFlow Organizational Chart */}
          <div className="h-[500px] w-full border border-gray-200 rounded-lg [&_.react-flow__attribution]:!hidden [&_.react-flow__panel.bottom.left]:!hidden">
            <ReactFlow
              nodes={workflowData.nodes}
              edges={workflowData.edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.1 }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              panOnDrag={true}
              zoomOnScroll={true}
              defaultViewport={{ x: 0, y: 0, zoom: 1 }}
              connectionLineType={ConnectionLineType.Straight}
              edgeTypes={{}}
              deleteKeyCode={null}
              multiSelectionKeyCode={null}
              selectionKeyCode={null}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#f8fafc" />
              <Controls
                showZoom={true}
                showFitView={true}
                showInteractive={false}
              />
              {/* <MiniMap
                nodeColor={(node: {
                  data: { isMainProcessor: any; role: string };
                }) => {
                  if (node.data?.isMainProcessor) return "#a855f7";
                  if (node.data?.role === "Phối hợp") return "#06b6d4";
                  return "#e5e7eb";
                }}
                nodeStrokeWidth={3}
                nodeBorderRadius={8}
                maskColor="rgba(0, 0, 0, 0.1)"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              /> */}
            </ReactFlow>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
