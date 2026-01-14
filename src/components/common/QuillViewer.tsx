"use client";

import "react-quill/dist/quill.snow.css";
import React from "react";

interface QuillViewerProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

export const QuillViewer: React.FC<QuillViewerProps> = ({
  content,
  className = "",
  style = {},
}) => {
  return (
    <div className={`ql-snow ${className}`} style={style}>
      <div
        className="ql-editor break-all"
        style={{ padding: 0 }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};

export default QuillViewer;
