export interface Column<T> {
  header: string | React.ReactNode;
  accessor?: keyof T | ((item: T, index: number) => React.ReactNode);
  className?: string;
  sortable?: boolean;
  type?: "default" | "checkbox" | "actions";
  renderActions?: (item: T, index: number) => React.ReactNode; // cho cột actions
  sortKey?: string;
}
