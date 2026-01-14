import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetUsersEvaluate,
  useGetListSend,
} from "@/hooks/data/document.data";
import { DocumentOutService } from "@/services/document-out.service";
import { handleError } from "@/utils/common.utils";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ToastUtils } from "@/utils/toast.utils";

interface DocumentOutEvaluateProps {
  docId: string;
  isEvaluate: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  showEvaluateModal: boolean;
  setShowEvaluateModal: (value: boolean) => void;
}

export default function DocumentOutEvaluate({
  docId,
  isEvaluate,
  onClose,
  onSuccess,
  showEvaluateModal,
  setShowEvaluateModal,
}: DocumentOutEvaluateProps) {
  const router = useRouter();
  const [comment, setComment] = React.useState<string>("");
  const [agree, setAgree] = React.useState<boolean>(true);
  const [users, setUsers] = React.useState<
    Array<{ pId: number; fullName: string }>
  >([]);
  const [pId, setPId] = React.useState<number | null>(null);
  const [inSubmit, setInSubmit] = React.useState<boolean>(false);

  // Use hooks to fetch users based on isEvaluate mode
  const { data: usersEvaluateData } = useGetUsersEvaluate(
    Number(docId),
    showEvaluateModal && !!docId && isEvaluate
  );

  const { data: listSendData } = useGetListSend(
    Number(docId),
    showEvaluateModal && !!docId && !isEvaluate
  );

  // Process the data when it changes
  React.useEffect(() => {
    const list = isEvaluate ? usersEvaluateData : listSendData;
    if (list) {
      const mapped = (list || [])
        .filter((i: any) => i?.pId && i?.fullName)
        .map((i: any) => ({
          pId: i.pId as number,
          fullName: String(i.fullName),
        }));
      setUsers(mapped);
    } else {
      setUsers([]);
    }
  }, [usersEvaluateData, listSendData, isEvaluate]);

  const disableButton = (): boolean => {
    const invalidComment = !comment; // Angular disables when comment empty
    const invalidAgree = !isEvaluate && (agree === undefined || agree === null);
    const invalidPid = !pId;
    return invalidComment || inSubmit || invalidAgree || invalidPid;
  };

  const handleSubmit = async () => {
    if (disableButton()) return;
    setInSubmit(true);
    try {
      if (!isEvaluate) {
        await DocumentOutService.requestEvaluate(Number(docId), comment, false);
      } else {
        await DocumentOutService.evaluate(
          Number(docId),
          comment,
          !!agree,
          pId ?? undefined
        );
      }
      if (!isEvaluate) {
        ToastUtils.success("Xin đánh giá thành công");
      } else {
        ToastUtils.success("Đánh giá thành công");
      }
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (e: any) {
      ToastUtils.error("Đánh giá thất bại");
      handleError(e);
    } finally {
      setInSubmit(false);
    }
  };

  return (
    <Dialog open={showEvaluateModal} onOpenChange={setShowEvaluateModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEvaluate ? "Đánh giá" : "Xin đánh giá"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder={
              isEvaluate ? "Nhập đánh giá..." : "Nhập yêu cầu đánh giá..."
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
          />

          {/* Người đánh giá / Người được đánh giá */}
          <div className="space-y-2">
            <label className="font-medium">
              {isEvaluate ? "Người đánh giá" : "Người được đánh giá"}
            </label>
            <select
              className="border rounded px-2 py-1"
              value={pId ?? ""}
              onChange={(e) =>
                setPId(e.target.value ? Number(e.target.value) : null)
              }
              disabled={users.length === 0}
            >
              <option value="">-- Chọn --</option>
              {users.map((u) => (
                <option key={u.pId} value={u.pId}>
                  {u.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Ý kiến đánh giá khi evaluate mode */}
          {!isEvaluate && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="agree"
                  name="evaluation"
                  checked={agree === true}
                  onChange={() => setAgree(true)}
                />
                <label htmlFor="agree">Đồng ý</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="disagree"
                  name="evaluation"
                  checked={agree === false}
                  onChange={() => setAgree(false)}
                />
                <label htmlFor="disagree">Từ chối</label>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button onClick={handleSubmit} disabled={disableButton()}>
              {isEvaluate ? "Gửi đánh giá" : "Gửi yêu cầu"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
