"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormElement } from "./form-builder.types";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { CustomDatePicker } from "@/components/ui/calendar";

interface FormElementItemProps {
  element: FormElement;
  onUpdate: (updates: Partial<FormElement>) => void;
  onDelete?: () => void;
  onUpdateField?: (element: FormElement) => void;
  onDeleteField?: (element: FormElement) => void;
  isSelected?: boolean;
  isPropertiesPanel?: boolean;
}

export function FormElementItem({
  element,
  onUpdate,
  onDelete,
  onUpdateField,
  onDeleteField,
  isSelected,
  isPropertiesPanel = false,
}: FormElementItemProps) {
  if (isPropertiesPanel) {
    return (
      <div className="space-y-4">
        <div>
          <Label htmlFor="label">Label</Label>
          <Input
            id="label"
            value={element.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={element.name || ""}
            onChange={(e) => {
              const value = e.target.value.slice(0, 20); // Enforce max 20 characters
              onUpdate({ name: value });
            }}
            className="mt-1"
            placeholder="Field name"
            maxLength={20}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum 20 characters
          </p>
        </div>

        {element.type !== "checkbox" && element.type !== "radio" && (
          <div>
            <Label htmlFor="placeholder">Placeholder</Label>
            <Input
              id="placeholder"
              value={element.placeholder || ""}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              className="mt-1"
              placeholder="Enter placeholder text"
            />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="required"
            checked={element.required}
            onCheckedChange={(checked) =>
              onUpdate({ required: checked as boolean })
            }
          />
          <Label htmlFor="required" className="cursor-pointer">
            Required
          </Label>
        </div>

        {/* Grid Layout Properties */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="width">Width (cols)</Label>
            <Input
              id="width"
              type="number"
              min={1}
              max={12}
              value={element.w}
              onChange={(e) => onUpdate({ w: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="height">Height (rows)</Label>
            <Input
              id="height"
              type="number"
              min={1}
              value={element.h}
              onChange={(e) => onUpdate({ h: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
        </div>

        {element.type === "number" && (
          <>
            <div>
              <Label htmlFor="min">Min Value</Label>
              <Input
                id="min"
                type="number"
                value={element.validation?.min || ""}
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...element.validation,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="max">Max Value</Label>
              <Input
                id="max"
                type="number"
                value={element.validation?.max || ""}
                onChange={(e) =>
                  onUpdate({
                    validation: {
                      ...element.validation,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
                className="mt-1"
              />
            </div>
          </>
        )}

        {(element.type === "select" ||
          element.type === "radio" ||
          element.type === "checkbox") && (
          <div>
            <Label>Options</Label>
            <div className="mt-2 space-y-2">
              {element.options?.map((option, index) => (
                <div key={index} className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Input
                      placeholder="Label"
                      value={option.label || ""}
                      onChange={(e) => {
                        const newOptions = [...(element.options || [])];
                        newOptions[index] = {
                          ...newOptions[index],
                          label: e.target.value,
                        };
                        onUpdate({ options: newOptions });
                      }}
                    />
                  </div>
                  <div className="col-span-5">
                    <Input
                      placeholder="Value"
                      value={option.value || ""}
                      onChange={(e) => {
                        const newOptions = [...(element.options || [])];
                        newOptions[index] = {
                          ...newOptions[index],
                          value: e.target.value,
                        };
                        onUpdate({ options: newOptions });
                      }}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newOptions = element.options?.filter(
                          (_, i) => i !== index
                        );
                        onUpdate({ options: newOptions });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = [
                    ...(element.options || []),
                    {
                      label: `Option ${(element.options?.length || 0) + 1}`,
                      value: `option${(element.options?.length || 0) + 1}`,
                    },
                  ];
                  onUpdate({ options: newOptions });
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Update and Delete buttons for saved fields */}
        {element.id && !element.id.startsWith("element-") && (
          <div className="flex gap-2">
            {onUpdateField && (
              <Button onClick={() => onUpdateField(element)} className="flex-1">
                Cập nhật
              </Button>
            )}
            {onDeleteField && (
              <Button
                variant="destructive"
                onClick={() => onDeleteField(element)}
                className="flex-1"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            )}
          </div>
        )}

        {/* Delete button for new elements (not saved yet) */}
        {onDelete && (!element.id || element.id.startsWith("element-")) && (
          <Button variant="destructive" onClick={onDelete} className="w-full">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa Element
          </Button>
        )}
      </div>
    );
  }

  // Render preview của element
  return (
    <div className="h-full p-3 group drag-handle">
      <div className="space-y-1.5">
        <Label className="text-sm flex items-center gap-2 group-hover:cursor-move">
          <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          <span>
            {element.label}
            {element.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </Label>

        {element.type === "text" && (
          <Input
            placeholder={element.placeholder}
            defaultValue={element.defaultValue}
          />
        )}

        {element.type === "textarea" && (
          <Textarea
            placeholder={element.placeholder}
            defaultValue={element.defaultValue}
          />
        )}

        {element.type === "number" && (
          <Input
            type="number"
            placeholder={element.placeholder}
            min={element.validation?.min}
            max={element.validation?.max}
          />
        )}

        {element.type === "date" && (
          <div className="w-full">
            {/* Preview only */}
            <CustomDatePicker
              selected={
                element.defaultValue ? new Date(element.defaultValue) : null
              }
              onChange={() => {}}
            />
          </div>
        )}

        {element.type === "datetime-local" && (
          <Input type="datetime-local" defaultValue={element.defaultValue} />
        )}

        {element.type === "select" && (
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={element.placeholder || "Select..."} />
            </SelectTrigger>
            <SelectContent>
              {element.options?.map((option, index) => (
                <SelectItem key={index} value={option.value || option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {element.type === "checkbox" && (
          <div className="space-y-2">
            {element.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${element.id}-checkbox-${index}`} />
                <Label
                  htmlFor={`${element.id}-checkbox-${index}`}
                  className="font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}

        {element.type === "radio" && (
          <RadioGroup>
            {element.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value || option.label}
                  id={`${element.id}-${index}`}
                />
                <Label
                  htmlFor={`${element.id}-${index}`}
                  className="font-normal"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      </div>
    </div>
  );
}
