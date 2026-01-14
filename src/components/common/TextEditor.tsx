"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamic import để tránh SSR issues
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded" />,
});

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  readOnly?: boolean;
  className?: string;
  toolbar?: "full" | "basic" | "minimal" | "custom";
  customToolbar?: any;
  disabled?: boolean;
}

const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  placeholder = "Nhập nội dung...",
  height = "200px",
  readOnly = false,
  className = "",
  toolbar = "full",
  customToolbar,
  disabled = false,
}) => {
  // Cấu hình toolbar
  const toolbarConfig = useMemo(() => {
    switch (toolbar) {
      case "basic":
        return [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
          ["clean"],
        ];

      case "minimal":
        return [
          ["bold", "italic"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["clean"],
        ];

      case "custom":
        return customToolbar || [];

      case "full":
      default:
        return [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
          [{ size: ["small", false, "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ indent: "-1" }, { indent: "+1" }],
          [{ direction: "rtl" }],
          [{ align: [] }],
          ["blockquote", "code-block"],
          ["clean"],
        ];
    }
  }, [toolbar, customToolbar]);

  // Cấu hình modules
  const modules = useMemo(
    () => ({
      toolbar: toolbarConfig,
      clipboard: {
        matchVisual: false,
      },
      history: {
        delay: 2000,
        maxStack: 500,
        userOnly: true,
      },
    }),
    [toolbarConfig]
  );

  // Cấu hình formats
  const formats = useMemo(
    () => [
      "header",
      "font",
      "size",
      "bold",
      "italic",
      "underline",
      "strike",
      "color",
      "background",
      "script",
      "list",
      "bullet",
      "indent",
      "direction",
      "align",
      "blockquote",
      "code-block",
    ],
    []
  );

  return (
    <div className={`text-editor-wrapper ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        modules={modules}
        formats={formats}
        style={{ height: height }}
        className={`text-editor ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      />

      <style jsx global>{`
        .text-editor-wrapper .ql-container {
          height: calc(${height} - 42px);
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
        }

        .text-editor-wrapper .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border-bottom: 1px solid #d1d5db;
        }

        .text-editor-wrapper .ql-editor {
          font-size: 14px;
          line-height: 1.5;
        }

        .text-editor-wrapper .ql-editor.ql-blank::before {
          font-style: normal;
          color: #9ca3af;
        }

        .text-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #374151;
        }

        .text-editor-wrapper .ql-toolbar .ql-fill {
          fill: #374151;
        }

        .text-editor-wrapper .ql-toolbar button:hover .ql-stroke {
          stroke: #1f2937;
        }

        .text-editor-wrapper .ql-toolbar button:hover .ql-fill {
          fill: #1f2937;
        }

        .text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
          stroke: #3b82f6;
        }

        .text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
          fill: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default TextEditor;
