"use client";

import { FileText } from "lucide-react";
import React from "react";

export const EmptyDocument: React.FC = () => (
  <div className="flex flex-col items-center gap-3 py-8">
    <div className="text-center">
      <p className="text-sm text-gray-400">
        Chưa có văn bản nào trong danh sách này
      </p>
    </div>
  </div>
);
