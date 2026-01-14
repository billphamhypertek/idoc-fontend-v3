export const DASHBOARD_COLORS = {
  complexityLow: "#3ab63a",
  complexityMedium: "#e8c22f",
  complexityHigh: "#ff3333",
  statusNew: "#ff6b6b",
  statusInProgress: "#ffa500",
  statusRejected: "#dc3545",
  statusReview: "#9b59b6",
  statusCompleted: "#4ecdc4",
  statusCancelled: "#ff7043",
} as const;

export const TaskStatusColor: Record<number, string> = {
  0: DASHBOARD_COLORS.statusNew,
  1: DASHBOARD_COLORS.statusInProgress,
  2: DASHBOARD_COLORS.statusRejected,
  3: DASHBOARD_COLORS.statusReview,
  4: DASHBOARD_COLORS.statusCompleted,
  5: DASHBOARD_COLORS.statusCancelled,
};

/**
 * Get avatar color based on name hash
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    "#1abc9c",
    "#3498db",
    "#9b59b6",
    "#f39c12",
    "#e67e22",
    "#e74c3c",
    "#16a085",
    "#2ecc71",
    "#27ae60",
    "#2980b9",
    "#8e44ad",
    "#d35400",
    "#c0392b",
    "#7f8c8d",
    "#2c3e50",
  ];

  if (!name) return "#6B7280";

  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
