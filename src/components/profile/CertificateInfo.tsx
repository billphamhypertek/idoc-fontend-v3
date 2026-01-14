"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface CertificateInfoProps {
  nameToken: string;
  orgToken: string;
  startTimeToken: string;
  expiredTimeToken: string;
}

export const CertificateInfo: React.FC<CertificateInfoProps> = ({
  nameToken,
  orgToken,
  startTimeToken,
  expiredTimeToken,
}) => {
  return (
    <div className="space-y-4">
      {/* Certificate Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Tên người sử dụng
          </label>
          <Input
            type="text"
            value={nameToken}
            disabled
            className="w-full px-3 py-2 bg-gray-200 border border-gray-300 text-sm text-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Tổ chức
          </label>
          <Input
            type="text"
            value={orgToken}
            disabled
            className="w-full px-3 py-2 bg-gray-200 border border-gray-300 text-sm text-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Thời gian sử dụng từ
          </label>
          <Input
            type="text"
            value={startTimeToken}
            disabled
            className="w-full px-3 py-2 bg-gray-200 border border-gray-300 text-sm text-gray-600"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1">
            Thời gian sử dụng đến
          </label>
          <Input
            type="text"
            value={expiredTimeToken}
            disabled
            className="w-full px-3 py-2 bg-gray-200 border border-gray-300 text-sm text-gray-600"
          />
        </div>
      </div>
    </div>
  );
};
