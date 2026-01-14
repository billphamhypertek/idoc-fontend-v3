"use client";
import React, { useRef, useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { ToastUtils } from "@/utils/toast.utils";

interface AvatarUploadProps {
  avatarPreview: string | null;
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  uploading: boolean;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  avatarPreview,
  selectedFile,
  onFileSelect,
  onUpload,
  uploading,
}) => {
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const DEFAULT_AVATAR = "/v2/assets/images/users/boy-no-photo.jpg";

  const getAvatarUrl = (url: string | null): string => {
    if (!url || url.includes("undefined")) {
      return DEFAULT_AVATAR;
    }

    if (url.startsWith("http")) {
      return url;
    }

    const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/files/avatar/`;
    return `${baseUrl}${url}`;
  };

  useEffect(() => {
    setImageError(false);
  }, [avatarPreview]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/image\/.*/)) {
      ToastUtils.error(
        "Định dạng ảnh không hợp lệ. Vui lòng chọn file ảnh (.jpg, .png, .jpeg)"
      );
      event.target.value = "";
      return;
    }
    const MAX_SIZE = 314572800; // 300MB
    if (file.size > MAX_SIZE) {
      ToastUtils.error(
        "Dung lượng ảnh không hợp lệ. Kích thước file phải nhỏ hơn 300MB"
      );
      event.target.value = "";
      return;
    }

    onFileSelect(file);
    event.target.value = "";
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const avatarUrl = getAvatarUrl(avatarPreview);

  return (
    <div className="flex flex-col">
      {/* Avatar Image */}
      <div className="bg-gray-300 aspect-[3/4] rounded-sm mb-3 flex items-center justify-center overflow-hidden">
        {!imageError ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Avatar load error:", avatarPreview);
              console.error("Attempted URL:", avatarUrl);
              setImageError(true);
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-300 to-gray-400 flex items-center justify-center">
            <div className="w-32 h-32 bg-white rounded-full"></div>
          </div>
        )}
      </div>

      {/* Upload Section - CỐ ĐỊNH WIDTH */}
      <div className="space-y-2">
        <div className="flex w-̃70">
          {selectedFile ? (
            <>
              {/* Nút Tải ảnh - width cố định */}
              <button
                type="button"
                onClick={onUpload}
                disabled={uploading}
                className="w-24 px-3 py-2 bg-blue-600 text-white text-sm hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-1 whitespace-nowrap shrink-0"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Tải ảnh
              </button>

              {/* Tên file - chiếm phần còn lại */}
              <label className="flex-1 px-2 py-2 border border-gray-300 border-l-0 text-sm text-gray-500 bg-gray-50 truncate cursor-pointer overflow-hidden">
                {selectedFile.name}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.png,.jpeg"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>

              {/* Nút Browse - width cố định */}
              <button
                type="button"
                onClick={handleBrowseClick}
                className="w-20 px-3 py-2 border border-gray-300 text-gray-700 text-sm bg-gray-100 flex items-center justify-center gap-1 font-bold whitespace-nowrap shrink-0"
              >
                Browse
              </button>
            </>
          ) : (
            <>
              {/* Label "Chọn ảnh đại diện" - chiếm phần lớn */}
              <label className="flex-1 px-3 py-2 border border-gray-300 border-r-0 text-sm text-gray-500 cursor-pointer truncate">
                Chọn ảnh đại diện
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.png,.jpeg"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>

              {/* Nút Browse - width cố định */}
              <button
                type="button"
                onClick={handleBrowseClick}
                className="w-20 px-3 py-2 border border-gray-300 text-gray-700 text-sm bg-gray-100 flex items-center justify-center gap-1 font-bold whitespace-nowrap shrink-0"
              >
                Browse
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
