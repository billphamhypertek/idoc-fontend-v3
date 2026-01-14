"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  FormElementType,
  getElementIcon,
  getElementLabel,
} from "./form-builder.types";
import { GripVertical } from "lucide-react";

const FORM_ELEMENTS: FormElementType[] = [
  "text",
  "textarea",
  "number",
  "select",
  "checkbox",
  "radio",
  "date",
  "datetime-local",
];

interface FormElementsSidebarProps {
  onDragStart: (type: FormElementType) => void;
}

export function FormElementsSidebar({ onDragStart }: FormElementsSidebarProps) {
  const handleDragStart = (e: React.DragEvent, type: FormElementType) => {
    e.dataTransfer.setData("elementType", type);
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.dropEffect = "copy";
    onDragStart(type);
  };

  return (
    <div className="w-64 border-r bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold">Danh sách kiểu trường</h2>
      <p className="mb-4 text-xs text-gray-500">
        Kéo thả đối tượng để thêm trường động
      </p>
      <div className="space-y-2">
        {FORM_ELEMENTS.map((type) => (
          <Card
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            className="cursor-grab active:cursor-grabbing transition-all hover:shadow-md"
          >
            <CardContent className="flex items-center gap-3 p-3">
              <GripVertical className="h-4 w-4 text-gray-400" />
              <span className="text-xl">{getElementIcon(type)}</span>
              <span className="flex-1 text-sm font-medium">
                {getElementLabel(type)}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
