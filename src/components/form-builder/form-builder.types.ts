export type FormElementType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "datetime-local";

export interface FormElementOption {
  label: string;
  value: string;
}

export interface FormElement {
  id: string;
  type: FormElementType;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: FormElementOption[]; // For select, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  // Grid layout properties
  x: number;
  y: number;
  w: number;
  h: number;
  // Field name (editable by user)
  name?: string;
}

export const createFormElement = (
  type: FormElementType,
  x: number = 0,
  y: number = 0,
  w: number = 6,
  h: number = 2
): FormElement => {
  // Generate name like FormBuilder old: `${type.slice(0, 3)}${Date.now()}`
  // Then ensure max 20 characters
  const typePrefix = type.slice(0, 3);
  const timestamp = Date.now().toString();
  let name = `${typePrefix}${timestamp}`;

  // Ensure name doesn't exceed 20 characters
  if (name.length > 20) {
    // Keep first 3 chars (type) and take remaining from timestamp
    const maxTimestampLength = 20 - typePrefix.length;
    name = `${typePrefix}${timestamp.slice(-maxTimestampLength)}`;
  }

  const baseElement: FormElement = {
    id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
    required: false,
    x,
    y,
    w,
    h,
    name,
  };

  switch (type) {
    case "select":
    case "radio":
    case "checkbox":
      return {
        ...baseElement,
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
        ],
      };
    default:
      return baseElement;
  }
};

export const getElementIcon = (type: FormElementType): string => {
  const icons: Record<FormElementType, string> = {
    text: "📝",
    textarea: "📄",
    number: "#️⃣",
    select: "📋",
    checkbox: "☑️",
    radio: "🔘",
    date: "📅",
    "datetime-local": "🕒",
  };
  return icons[type] || "📝";
};

export const getElementLabel = (type: FormElementType): string => {
  const labels: Record<FormElementType, string> = {
    text: "Text Input",
    textarea: "Textarea",
    number: "Number",
    select: "Select",
    checkbox: "Checkbox",
    radio: "Radio",
    date: "Date",
    "datetime-local": "DateTime",
  };
  return labels[type] || type;
};
