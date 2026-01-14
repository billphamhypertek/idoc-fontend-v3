import { Button } from "@/components/ui/button";
import {
  useGetUserSharedFile,
  useSearchUserOrgAll,
} from "@/hooks/data/user.data";
import { toast } from "@/hooks/use-toast";
import { EncryptionService } from "@/services/encryption.service";
import { ToastUtils } from "@/utils/toast.utils";

import { getUserInfo } from "@/utils/token.utils";
import { useEffect, useMemo, useState } from "react";

interface SharedUserProps {
  fileNames: string; // single fileName to share (encrypted)
  docId: string | number; // for parity with Angular, not used directly here
  type: string; // e.g. "VAN_BAN_DEN" | "VAN_BAN_DI" (not used here but kept for parity)
  onClose: () => void;
}

type ShareUser = {
  id: number | string;
  label: string;
  disabled?: boolean;
  check?: boolean;
};

export default function SharedUser({
  fileNames,
  docId,
  type,
  onClose,
}: SharedUserProps) {
  const [userIds, setUserIds] = useState<ShareUser[]>([]);
  const [userIdShared, setUserIdShared] = useState<(number | string)[]>([]);
  const [userIdDisabled, setUserIdDisabled] = useState<(number | string)[]>([]);
  const [canShare, setCanShare] = useState<boolean>(false);

  const currentUserId = useMemo(() => {
    try {
      const info = JSON.parse(getUserInfo() || "{}");
      return info?.id;
    } catch {
      return undefined;
    }
  }, []);

  // Use hooks to fetch data
  const { data: allUsers, isLoading: loadingUsers } = useSearchUserOrgAll();
  const { data: sharedUsers, isLoading: loadingShared } =
    useGetUserSharedFile(fileNames);

  // Process users list when data is loaded
  useEffect(() => {
    if (!allUsers) return;
    const list: ShareUser[] = (allUsers || []).map((u: any) => ({
      id: u.id,
      label:
        u.fullName ||
        u.name ||
        `${u.positionName ? u.positionName + " " : ""}${u.fullName || u.userName || u.name || "Người dùng"}`,
    }));
    setUserIds(list);
  }, [allUsers]);

  // Process shared users when data is loaded
  useEffect(() => {
    if (!sharedUsers) return;
    const ids: (number | string)[] = Array.isArray(sharedUsers)
      ? sharedUsers
      : [];
    setUserIdDisabled(ids);
    setCanShare(ids.includes(currentUserId));
  }, [sharedUsers, currentUserId]);

  useEffect(() => {
    // mark disabled and checked users based on userIdDisabled
    if (!userIds || userIds.length === 0) return;
    const updated = userIds.map((u) => ({
      ...u,
      disabled: userIdDisabled.includes(u.id),
      check: userIdDisabled.includes(u.id),
    }));
    setUserIds(updated);
  }, [userIdDisabled]);

  const toCheck = (user: ShareUser) => {
    const next = userIds.map((u) =>
      u.id === user.id ? { ...u, check: !u.check } : u
    );
    setUserIds(next);
    if (!user.check) {
      // now checked
      setUserIdShared((prev) =>
        [...prev, user.id].filter((v, i, a) => a.indexOf(v) === i)
      );
    } else {
      // now unchecked
      setUserIdShared((prev) => prev.filter((id) => id !== user.id));
    }
  };

  const handleSubmit = async () => {
    // Align with Angular: filter out disabled
    const selected = userIds
      .filter((u) => u.check && !u.disabled)
      .map((u) => u.id);
    if (!fileNames || selected.length === 0) {
      ToastUtils.error("Thiếu dữ liệu chia sẻ");
      return;
    }
    try {
      const ok = await EncryptionService.doTransferExecute(
        [fileNames],
        selected as any[]
      );
      if (ok) {
        ToastUtils.success("Chia sẻ khóa thành công");
        onClose();
      } else {
        ToastUtils.error("Chia sẻ thất bại");
      }
    } catch (e: any) {
      ToastUtils.error("Lỗi chia sẻ");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-semibold">Danh sách cá nhân được chia sẻ</h5>
        <button className="text-xl" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8">
          <div className="border rounded">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-2 w-3/5">Họ và tên</th>
                  <th className="text-left p-2 w-2/5">Chia sẻ</th>
                </tr>
              </thead>
              <tbody>
                {userIds.map((user) => (
                  <tr key={String(user.id)} className="border-b">
                    <td className="p-2">
                      <span className="mr-2 text-info">👤</span>
                      <span>{user.label}</span>
                    </td>
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={!!user.check}
                        onChange={() => toCheck(user)}
                        disabled={!!user.disabled}
                      />
                    </td>
                  </tr>
                ))}
                {userIds.length === 0 && (
                  <tr>
                    <td className="p-2 text-gray-500" colSpan={2}>
                      Không có dữ liệu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-red-600 font-semibold">
          {!canShare ? "Bạn chưa được chia sẻ tệp hiện tại!" : ""}
        </span>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!userIds.some((u) => u.check && !u.disabled) || !canShare}
          >
            Chia sẻ
          </Button>
        </div>
      </div>
    </div>
  );
}
