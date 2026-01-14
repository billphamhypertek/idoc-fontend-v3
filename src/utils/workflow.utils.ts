import { MarkerType } from "reactflow";
import { WorkflowNode, WorkflowEdge } from "@/definitions/types/workflow.type";

/**
 * Interface for tracking item data
 */
export interface TrackingItem {
  key: string | number;
  parent: string | number;
  name?: string;
  position?: string;
  org?: string;
  execute?: boolean;
  [key: string]: any;
}

/**
 * Internal tree node structure for layout calculation
 */
interface TreeNode {
  id: string;
  data: TrackingItem;
  children: TreeNode[];
  width: number;
  x: number;
  y: number;
}

/**
 * Configuration for workflow tree generation
 */
const CONFIG = {
  nodeWidth: 300,
  nodeSpacingX: 80,
  levelHeight: 250,
  startX: 0,
  startY: 50,
  edgeStyle: {
    stroke: "#374151",
    strokeWidth: 2,
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: "#374151",
    width: 20,
    height: 20,
  },
} as const;

/**
 * Builds a tree structure from flat tracking items
 */
function buildTree(items: TrackingItem[]): TreeNode | null {
  if (!items || items.length === 0) return null;

  const rootItem = items.find((t) => t.key === t.parent);
  if (!rootItem) return null;

  const createNode = (item: TrackingItem): TreeNode => {
    return {
      id: item.key?.toString() ?? String(item.key),
      data: item,
      children: [],
      width: 0,
      x: 0,
      y: 0,
    };
  };

  const rootNode = createNode(rootItem);
  const nodeMap = new Map<string, TreeNode>();
  nodeMap.set(rootNode.id, rootNode);

  // Create all nodes
  items.forEach((item) => {
    if (item.key !== item.parent) {
      nodeMap.set(item.key?.toString() ?? String(item.key), createNode(item));
    }
  });

  // Build parent-child relationships
  items.forEach((item) => {
    if (item.key !== item.parent) {
      const childNode = nodeMap.get(item.key?.toString() ?? String(item.key));
      const parentKey = item.parent?.toString() ?? String(item.parent);
      const parentNode = nodeMap.get(parentKey);

      if (childNode && parentNode) {
        parentNode.children.push(childNode);
      }
    }
  });

  return rootNode;
}

/**
 * Calculates the width of each node in the tree
 */
function calculateLayout(node: TreeNode): void {
  if (node.children.length === 0) {
    node.width = CONFIG.nodeWidth;
  } else {
    node.children.forEach((child) => calculateLayout(child));
    const childrenWidth = node.children.reduce(
      (sum, child) => sum + child.width,
      0
    );
    const spacingWidth = (node.children.length - 1) * CONFIG.nodeSpacingX;
    node.width = Math.max(CONFIG.nodeWidth, childrenWidth + spacingWidth);
  }
}

/**
 * Assigns x, y coordinates to each node
 */
function assignCoordinates(node: TreeNode, x: number, y: number): void {
  node.x = x + node.width / 2;
  node.y = y;

  let currentX = x;
  node.children.forEach((child) => {
    assignCoordinates(child, currentX, y + CONFIG.levelHeight);
    currentX += child.width + CONFIG.nodeSpacingX;
  });
}

/**
 * Generates workflow nodes and edges from tree structure
 */
function generateFlowElements(root: TreeNode): {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
} {
  const nodes: WorkflowNode[] = [];
  const edges: WorkflowEdge[] = [];

  const traverse = (node: TreeNode) => {
    nodes.push({
      id: node.id,
      type: "organization",
      position: {
        x: node.x - CONFIG.nodeWidth / 2,
        y: node.y,
      },
      data: {
        role: node.data.execute ? "Xử lý chính" : "Phối hợp",
        name: node.data.name || "",
        title: node.data.position || "",
        department: node.data.org || "",
        isMainProcessor: node.data.execute || false,
      },
    });

    node.children.forEach((child) => {
      edges.push({
        id: `e${node.id}-${child.id}`,
        source: node.id,
        target: child.id,
        type: "smoothstep",
        animated: false,
        style: {
          stroke: CONFIG.edgeStyle.stroke,
          strokeWidth: CONFIG.edgeStyle.strokeWidth,
        },
        markerEnd: {
          type: CONFIG.markerEnd.type,
          color: CONFIG.markerEnd.color,
          width: CONFIG.markerEnd.width,
          height: CONFIG.markerEnd.height,
        },
      });
      traverse(child);
    });
  };

  traverse(root);
  return { nodes, edges };
}

/**
 * Converts tracking items to workflow nodes and edges
 * @param tracking - Array of tracking items
 * @returns Object containing nodes and edges, or null if tree cannot be built
 */
export function buildWorkflowTree(
  tracking: TrackingItem[]
): { nodes: WorkflowNode[]; edges: WorkflowEdge[] } | null {
  if (!tracking || tracking.length === 0) {
    return null;
  }

  const treeRoot = buildTree(tracking);
  if (!treeRoot) {
    return null;
  }

  calculateLayout(treeRoot);
  assignCoordinates(treeRoot, CONFIG.startX, CONFIG.startY);

  return generateFlowElements(treeRoot);
}
