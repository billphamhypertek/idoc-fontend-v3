"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  setDataEncrypt,
  setDataEncryptDi,
  setDataEncryptDocBook,
} from "@/utils/token.utils";

type EncryptState = {
  isEncrypt: boolean;
  setEncrypt: (v: boolean) => void;
};

export const useEncryptStore = create<EncryptState>()(
  persist(
    (set) => ({
      isEncrypt: false,
      setEncrypt: (v) => set({ isEncrypt: v }),
    }),
    {
      name: "encrypt-store", // single key for Zustand snapshot
      storage: createJSONStorage(() => sessionStorage),

      // keep your three sessionStorage flags in sync (side-effect)
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const v = state.isEncrypt;
        setAllEncryptFlags(v);
      },
      partialize: (s) => ({ isEncrypt: s.isEncrypt }),
    }
  )
);

// same helpers as before
export const setAllEncryptFlags = (v: boolean) => {
  setDataEncrypt(v);
  setDataEncryptDi(v);
  setDataEncryptDocBook(v);
};
