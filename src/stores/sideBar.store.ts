import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarStore {
  isCollapsed: boolean;
  toggleCollapse: () => void;

  menuSideBar: string;
  setMenuSideBar: (value: string) => void;
  removeMenuSideBar: () => void;

  previousMenuSideBar: string | null;
  setPreviousMenuSideBar: (value: string | null) => void;
  restorePreviousMenuSideBar: () => void;
}

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      // collapse state
      isCollapsed: false,
      toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed })),

      // menu state
      menuSideBar: "",
      setMenuSideBar: (value) => set({ menuSideBar: value }),
      removeMenuSideBar: () => set({ menuSideBar: "" }),

      // previous menu state for navigation
      previousMenuSideBar: null,
      setPreviousMenuSideBar: (value) => set({ previousMenuSideBar: value }),
      restorePreviousMenuSideBar: () => {
        const { previousMenuSideBar } = get();
        if (previousMenuSideBar) {
          set({ menuSideBar: previousMenuSideBar, previousMenuSideBar: null });
        } else {
          set({ menuSideBar: "", previousMenuSideBar: null });
        }
      },
    }),
    {
      name: "sidebar-store",
      partialize: (state) => ({
        menuSideBar: state.menuSideBar,
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);
