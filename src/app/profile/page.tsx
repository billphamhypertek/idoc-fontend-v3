"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useGetProfile } from "@/hooks/data/profile.data";
import { Button } from "@/components/ui/button";
import { Lock, Save } from "lucide-react";

//Deprecated
export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const { data: profileData, isLoading, error } = useGetProfile();
  const [triggerSave, setTriggerSave] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSave = () => {
    setTriggerSave((prev) => !prev);
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-sm text-gray-500 mb-4">Thông tin cá nhân</div>

        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Thông tin tài khoản cá nhân
            </h1>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setShowPasswordModal(true);
                }}
                className="px-3 py-1 text-sm  bg-blue-600 text-white hover:bg-blue-600"
              >
                <Lock className="w-4 h-4 inline mr-1" />
                Đổi mật khẩu
              </Button>
              <Button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-600"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Lưu lại
              </Button>
              <Button
                onClick={handleGoBack}
                className="px-3 py-1 text-sm bg-gray-500 text-white hover:bg-gray-600"
              >
                Quay lại
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Cập nhật điều chỉnh thông tin thành viên của hệ thống
          </p>
        </div>

        {profileData && (
          <ProfileForm
            profileData={profileData}
            onUpdateSuccess={() => {}}
            onSave={handleSave}
            triggerSave={triggerSave}
            showPasswordModal={showPasswordModal}
            setShowPasswordModal={setShowPasswordModal}
          />
        )}
      </div>
    </div>
  );
}
