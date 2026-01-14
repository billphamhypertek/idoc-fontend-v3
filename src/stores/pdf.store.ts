"use client";

import { create } from "zustand";

type PdfState = {
  pdf: Blob | null;
  setPdf: (v: Blob | null) => void;
  clearPdf: () => void;
};

export const usePdfStore = create<PdfState>((set) => ({
  pdf: null,
  setPdf: (b) => set({ pdf: b }),
  clearPdf: () => set({ pdf: null }),
}));
