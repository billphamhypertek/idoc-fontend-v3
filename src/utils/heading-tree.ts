import type { UiTreeNode } from "@/definitions/types/document-record";

export const flattenTree = (nodes: UiTreeNode[]): UiTreeNode[] => {
  const out: UiTreeNode[] = [];
  const dfs = (arr: UiTreeNode[]) =>
    arr.forEach((n) => {
      out.push(n);
      if (n.children?.length) dfs(n.children);
    });
  dfs(nodes);
  return out;
};
