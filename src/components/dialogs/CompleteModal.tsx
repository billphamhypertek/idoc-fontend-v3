"use client";

import React, { useState } from "react";
import { X, Paperclip, Check } from "lucide-react";

interface CompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (opinion: string, file?: File) => void;
  title?: string;
}

const CompleteModal: React.FC<CompleteModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  title = "Hoàn thành",
}) => {
  const [opinion, setOpinion] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(opinion, selectedFile || undefined);
      handleClose();
    } catch (error) {
      console.error("Error completing:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOpinion("");
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-normal text-black">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-3">
            {/* Label */}
            <div>
              <label className="block text-sm font-bold text-black mb-2">
                Ý kiến xử lý
              </label>
              {/* Textarea */}
              <textarea
                value={opinion}
                onChange={(e) => setOpinion(e.target.value)}
                className="w-full h-16 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Nhập ý kiến xử lý..."
              />
            </div>

            {/* File Upload */}
            <div>
              <input
                type="file"
                id="file-upload"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Paperclip className="w-4 h-4 text-white" />
                Chọn tệp
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 gap-2">
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? "Đang xử lý..." : "Hoàn thành"}
          </button>
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteModal;
