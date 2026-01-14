"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { TaskExecute } from "@/definitions/types/task-assign.type";

interface WorkAssignStore {
  lastSelectedNodeId: number | null;
  lastAssignee: TaskExecute[] | null;
  lastAssigneeName: string;
  setLastSelectedNodeId: (nodeId: number | null) => void;
  setLastAssignee: (
    assignee: TaskExecute[] | null,
    assigneeName?: string
  ) => void;
  clearLastAssignee: () => void;
}

export const useWorkAssignStore = create<WorkAssignStore>()(
  persist(
    (set) => ({
      lastSelectedNodeId: null,
      lastAssignee: null,
      lastAssigneeName: "",
      setLastSelectedNodeId: (nodeId) => set({ lastSelectedNodeId: nodeId }),
      setLastAssignee: (assignee, assigneeName = "") => {
        let name = assigneeName;
        if (!name && assignee && assignee.length > 0) {
          name = assignee
            .map((a) => {
              if (a.type === 2) {
                return a.org?.name ?? "";
              } else if (a.type === 0) {
                return a.user?.fullName ?? "";
              }
              return "";
            })
            .filter(Boolean)
            .join(", ");
        }
        set({ lastAssignee: assignee, lastAssigneeName: name });
      },
      clearLastAssignee: () =>
        set({
          lastSelectedNodeId: null,
          lastAssignee: null,
          lastAssigneeName: "",
        }),
    }),
    {
      name: "work-assign-store",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
