"use client";

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
  MarkerType,
  ConnectionLineType,
  NodeTypes,
  Position,
  Handle,
} from "reactflow";
import "reactflow/dist/style.css";
import { useGetListViewFollow } from "@/hooks/data/task.data";
import { TrackingItem } from "@/utils/workflow.utils";

interface TreeNode {
  id: string;
  data: any;
  children: TreeNode[];
  width: number;
  height: number;
  x: number;
  y: number;
  mod: number;
  prelim: number;
}

interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  siblingSpacing: number;
  subtreeSpacing: number;
  levelHeight: number;
}

const CONFIG: LayoutConfig = {
  nodeWidth: 600,
  nodeHeight: 220,
  siblingSpacing: 170,
  subtreeSpacing: 250,
  levelHeight: 300,
};

/**
 * Thuật toán ImprovedTreeLayout - Dựa trên Reingold-Tilford Algorithm
 *
 * Mục đích: Vẽ cây phân cấp với layout đẹp, tránh overlap giữa các subtree
 *
 * Cách hoạt động:
 * 1. Build parent map: Tạo map để truy vết parent của mỗi node
 * 2. Initialize: Khởi tạo các giá trị prelim, mod cho tất cả nodes
 * 3. First walk: Tính toán vị trí preliminary (tạm thời) từ dưới lên
 * 4. Second walk: Tính toán vị trí cuối cùng (x, y) từ trên xuống
 * 5. Normalize: Điều chỉnh để đảm bảo tất cả nodes có x >= padding
 */
class ImprovedTreeLayout {
  private config: LayoutConfig;
  private parentMap: Map<TreeNode, TreeNode>; // Map để truy vết parent của mỗi node

  constructor(config: LayoutConfig) {
    this.config = config;
    this.parentMap = new Map();
  }

  /**
   * Hàm chính: Tính toán layout cho toàn bộ tree
   * Thực hiện theo thứ tự: build map -> init -> first walk -> second walk -> normalize
   */
  public calculateLayout(root: TreeNode): void {
    this.buildParentMap(root);
    this.initializeNode(root);
    this.firstWalk(root);
    this.secondWalk(root, 0, 0);
    this.normalizePositions(root);
  }

  /**
   * Xây dựng parent map để có thể truy vết parent của bất kỳ node nào
   * Cần thiết để tìm left sibling của một node
   */
  private buildParentMap(node: TreeNode, parent?: TreeNode): void {
    if (parent) {
      this.parentMap.set(node, parent);
    }
    // Đệ quy xây dựng map cho tất cả children
    node.children.forEach((child) => this.buildParentMap(child, node));
  }

  /**
   * Khởi tạo các giá trị ban đầu cho node
   * - prelim: Vị trí preliminary (tạm thời), sẽ được tính trong firstWalk
   * - mod: Modifier để điều chỉnh vị trí khi có conflict
   * - width, height: Kích thước của node
   */
  private initializeNode(node: TreeNode): void {
    node.mod = 0;
    node.prelim = 0;
    node.width = this.config.nodeWidth;
    node.height = this.config.nodeHeight;
    // Đệ quy khởi tạo cho tất cả children
    node.children.forEach((child) => this.initializeNode(child));
  }

  /**
   * FIRST WALK: Tính toán vị trí preliminary từ dưới lên (bottom-up)
   *
   * Với mỗi node:
   * - Nếu là node lá: Đặt prelim dựa trên left sibling (nếu có)
   * - Nếu có children:
   *   1. Tính prelim cho tất cả children trước (đệ quy)
   *   2. Căn giữa node cha với children (midpoint)
   *   3. Nếu có left sibling: Đặt prelim sau left sibling và tính mod
   *   4. Kiểm tra và giải quyết conflict nếu có
   */
  private firstWalk(node: TreeNode): void {
    if (node.children.length === 0) {
      // NODE LÁ: Không có children
      const leftSibling = this.getLeftSibling(node);
      if (leftSibling) {
        // Nếu có left sibling: Đặt prelim ngay sau left sibling
        // = leftSibling.prelim + nodeWidth + spacing
        node.prelim =
          leftSibling.prelim +
          this.config.nodeWidth +
          this.config.siblingSpacing;
      } else {
        // Node đầu tiên trong level: prelim = 0
        node.prelim = 0;
      }
    } else {
      // NODE CÓ CON: Cần căn giữa với children

      // Bước 1: Tính prelim cho tất cả children trước (đệ quy từ dưới lên)
      node.children.forEach((child) => this.firstWalk(child));

      // Bước 2: Căn giữa node cha với children
      // Lấy leftmost và rightmost child để tính midpoint
      const leftMost = node.children[0];
      const rightMost = node.children[node.children.length - 1];
      const midpoint = (leftMost.prelim + rightMost.prelim) / 2;

      // Bước 3: Xử lý vị trí của node này
      const leftSibling = this.getLeftSibling(node);
      if (leftSibling) {
        // Nếu có left sibling: Đặt prelim sau left sibling
        node.prelim =
          leftSibling.prelim +
          this.config.nodeWidth +
          this.config.siblingSpacing;

        // Tính mod để điều chỉnh children về đúng vị trí căn giữa
        // mod = khoảng cách cần dịch để children được căn giữa dưới parent
        node.mod = node.prelim - midpoint;

        // Kiểm tra và giải quyết conflict với left sibling
        this.checkAndResolveConflicts(node);
      } else {
        // Không có left sibling (root hoặc con đầu tiên): Đặt prelim ở midpoint
        node.prelim = midpoint;
      }
    }
  }

  /**
   * SECOND WALK: Tính toán vị trí cuối cùng (x, y) từ trên xuống (top-down)
   *
   * - x = prelim + modSum (tổng tất cả mod từ root đến node này)
   * - y = depth * levelHeight
   * - modSum được truyền xuống và cộng dồn với mod của node hiện tại
   */
  private secondWalk(
    node: TreeNode,
    modSum: number, // Tổng tất cả mod từ root đến node này
    depth: number // Độ sâu của node trong tree (level)
  ): void {
    // Vị trí x cuối cùng = prelim + tổng tất cả mod từ root đến đây
    node.x = node.prelim + modSum;
    // Vị trí y = độ sâu * khoảng cách giữa các level
    node.y = depth * this.config.levelHeight;

    // Đệ quy tính toán cho children, truyền modSum + mod của node hiện tại
    node.children.forEach((child) => {
      this.secondWalk(child, modSum + node.mod, depth + 1);
    });
  }

  /**
   * Kiểm tra và giải quyết conflict giữa node hiện tại và left sibling
   *
   * Conflict xảy ra khi subtree của left sibling và subtree của node hiện tại
   * có thể overlap với nhau. Cần dịch node hiện tại sang phải để tránh overlap.
   *
   * Cách làm:
   * 1. Lấy left contour của left sibling (đường viền trái nhất)
   * 2. Lấy right contour của node hiện tại (đường viền phải nhất)
   * 3. So sánh từng level để tìm khoảng cách tối thiểu cần thiết
   * 4. Dịch node hiện tại sang phải nếu cần
   */
  private checkAndResolveConflicts(node: TreeNode): void {
    const leftSibling = this.getLeftSibling(node);
    if (!leftSibling) return; // Không có left sibling thì không có conflict

    let shift = 0; // Khoảng cách cần dịch
    const leftContour: TreeNode[] = []; // Contour trái của left sibling
    const rightContour: TreeNode[] = []; // Contour phải của node hiện tại

    // Lấy contours
    this.getLeftContour(leftSibling, leftContour);
    this.getRightContour(node, rightContour);

    // So sánh từng level trong contours
    const minLength = Math.min(leftContour.length, rightContour.length);

    for (let i = 0; i < minLength; i++) {
      const leftNode = leftContour[i]; // Node ở contour trái
      const rightNode = rightContour[i]; // Node ở contour phải

      // Tính vị trí x của right edge của left node
      const leftRight = leftNode.prelim + leftNode.mod;
      // Tính vị trí x của left edge của right node
      const rightLeft = rightNode.prelim + rightNode.mod;

      // Khoảng cách cần thiết = leftRight + nodeWidth + spacing - rightLeft
      const gap =
        leftRight +
        this.config.nodeWidth +
        this.config.subtreeSpacing -
        rightLeft;

      // Lấy gap lớn nhất (khoảng cách cần dịch tối thiểu)
      if (gap > shift) {
        shift = gap;
      }
    }

    // Nếu cần dịch: Cập nhật prelim và mod
    if (shift > 0) {
      node.prelim += shift;
      node.mod += shift;
    }
  }

  /**
   * Lấy left contour của subtree (đường viền trái nhất)
   * Left contour = leftmost node ở mỗi level
   */
  private getLeftContour(node: TreeNode, contour: TreeNode[]): void {
    contour.push(node);
    // Đệ quy lấy leftmost child
    if (node.children.length > 0) {
      this.getLeftContour(node.children[0], contour);
    }
  }

  /**
   * Lấy right contour của subtree (đường viền phải nhất)
   * Right contour = rightmost node ở mỗi level
   */
  private getRightContour(node: TreeNode, contour: TreeNode[]): void {
    contour.push(node);
    // Đệ quy lấy rightmost child
    if (node.children.length > 0) {
      this.getRightContour(node.children[node.children.length - 1], contour);
    }
  }

  /**
   * Tìm left sibling của node (node cùng level, đứng ngay bên trái)
   * Cần parent map để tìm parent, sau đó tìm node đứng trước trong children array
   */
  private getLeftSibling(node: TreeNode): TreeNode | null {
    const parent = this.parentMap.get(node);
    if (!parent) return null; // Root node không có parent

    // Tìm index của node trong children array của parent
    const index = parent.children.indexOf(node);
    // Left sibling là node ở index - 1
    return index > 0 ? parent.children[index - 1] : null;
  }

  /**
   * Chuẩn hóa vị trí: Đảm bảo tất cả nodes có x >= padding
   * Nếu node nào có x < padding, dịch toàn bộ tree sang phải
   */
  private normalizePositions(node: TreeNode): void {
    const minX = this.getMinX(node);
    const padding = 50;
    if (minX < padding) {
      // Dịch toàn bộ tree sang phải
      this.shiftTree(node, padding - minX);
    }
  }

  /**
   * Tìm giá trị x nhỏ nhất trong toàn bộ tree
   */
  private getMinX(node: TreeNode): number {
    let minX = node.x;
    // Đệ quy tìm minX trong tất cả children
    node.children.forEach((child) => {
      minX = Math.min(minX, this.getMinX(child));
    });
    return minX;
  }

  /**
   * Dịch toàn bộ subtree sang phải một khoảng offset
   * Áp dụng cho node và tất cả children của nó
   */
  private shiftTree(node: TreeNode, offset: number): void {
    node.x += offset;
    // Đệ quy dịch tất cả children
    node.children.forEach((child) => this.shiftTree(child, offset));
  }
}

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
      height: 0,
      x: 0,
      y: 0,
      mod: 0,
      prelim: 0,
    };
  };

  const rootNode = createNode(rootItem);
  const nodeMap = new Map<string, TreeNode>();
  nodeMap.set(rootNode.id, rootNode);

  items.forEach((item) => {
    if (item.key !== item.parent) {
      nodeMap.set(item.key?.toString() ?? String(item.key), createNode(item));
    }
  });

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

const TaskContainerNode = ({ data }: { data: any }) => {
  const { taskName, xuLyChinh, phoiHop, createName } = data;

  const mainProcessors = xuLyChinh
    ? xuLyChinh
        .split(",")
        .map((name: string) => name.trim())
        .filter(Boolean)
    : [];
  const coordinators = phoiHop
    ? phoiHop
        .split(",")
        .map((name: string) => name.trim())
        .filter(Boolean)
    : [];

  return (
    <div className="rounded-lg shadow-lg border-2 border-purple-300 bg-white min-w-[600px] overflow-hidden">
      <Handle
        type="target"
        position={Position.Top}
        style={{
          opacity: 0,
          width: 0,
          height: 0,
          border: "none",
          background: "transparent",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          opacity: 0,
          width: 0,
          height: 0,
          border: "none",
          background: "transparent",
        }}
      />

      <div className="bg-purple-100 border-b-2 border-purple-300 px-4 py-6 flex flex-col gap-2">
        <div className="text-lg font-bold text-gray-900 text-center">
          {taskName || "Chưa có tên"}
        </div>
        <div>
          {createName && (
            <div className="text-base font-medium text-black text-center">
              Người tạo: {createName}
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 p-4">
        {mainProcessors.length > 0 && (
          <div className="flex-1 rounded-lg border-2 border-purple-300 bg-purple-100 p-3 min-w-[280px]">
            <div className="text-lg font-medium text-red-600 mb-2 text-center">
              Xử lý chính
            </div>
            <div className="space-y-1">
              {mainProcessors.map((name: string, index: number) => (
                <div
                  key={index}
                  className="text-md font-bold px-2 py-1 text-center"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}

        {coordinators.length > 0 && (
          <div className="flex-1 rounded-lg border-2 border-cyan-300 bg-cyan-100 p-3 min-w-[280px]">
            <div className="text-lg font-medium text-green-600 mb-2 text-center">
              Phối hợp
            </div>
            <div className="space-y-1">
              {coordinators.map((name: string, index: number) => (
                <div
                  key={index}
                  className="text-md font-bold px-2 py-1 text-center"
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes: NodeTypes = {
  "task-container": TaskContainerNode,
};

interface ChildWorkflowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: number;
}

export default function ChildWorkflowDialog({
  isOpen,
  onClose,
  taskId,
}: ChildWorkflowDialogProps) {
  const { data: listViewFollowData } = useGetListViewFollow(
    taskId,
    isOpen && taskId > 0
  );

  const workflowData = useMemo(() => {
    if (!listViewFollowData || !Array.isArray(listViewFollowData)) {
      return { nodes: [], edges: [] };
    }

    if (listViewFollowData.length === 0) {
      return { nodes: [], edges: [] };
    }

    // Convert to TrackingItem format
    const trackingItems: TrackingItem[] = listViewFollowData.map(
      (item: any) => ({
        key: item.id,
        parent: item.parentId,
        name: item.taskName || "",
        taskName: item.taskName || "",
        xuLyChinh: item.xuLyChinh || "",
        phoiHop: item.phoiHop || "",
        status: item.status,
      })
    );

    // Build tree structure
    const treeRoot = buildTree(trackingItems);
    if (!treeRoot) {
      return { nodes: [], edges: [] };
    }

    const layout = new ImprovedTreeLayout(CONFIG);
    layout.calculateLayout(treeRoot);

    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Generate React Flow nodes and edges
    const traverse = (treeNode: TreeNode) => {
      const originalItem = listViewFollowData.find(
        (item: any) => String(item.id) === treeNode.id
      );

      if (!originalItem) return;

      const taskContainerId = `task-container-${treeNode.id}`;

      nodes.push({
        id: taskContainerId,
        type: "task-container",
        position: {
          x: treeNode.x,
          y: treeNode.y,
        },
        data: {
          taskName: originalItem.taskName || "",
          xuLyChinh: originalItem.xuLyChinh || "",
          phoiHop: originalItem.phoiHop || "",
          createName: originalItem.createName || "",
        },
      });

      treeNode.children.forEach((child) => {
        const childTaskContainerId = `task-container-${child.id}`;

        edges.push({
          id: `e${taskContainerId}-${childTaskContainerId}`,
          source: taskContainerId,
          target: childTaskContainerId,
          type: "smoothstep",
          animated: false,
          style: {
            stroke: "#374151",
            strokeWidth: 2,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#374151",
            width: 20,
            height: 20,
          },
        });

        traverse(child);
      });
    };

    traverse(treeRoot);

    return { nodes, edges };
  }, [listViewFollowData]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Sơ đồ công việc con
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6">
          <div className="h-[800px] w-full border border-gray-200 rounded-lg [&_.react-flow__attribution]:!hidden [&_.react-flow__panel.bottom.left]:!hidden">
            <ReactFlow
              nodes={workflowData.nodes}
              edges={workflowData.edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
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
            </ReactFlow>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
