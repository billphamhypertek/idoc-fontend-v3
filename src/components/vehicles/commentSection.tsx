import CommentsSectionCommon, {
  CommentItem as CommonCommentItem,
  Attachment as CommonAttachment,
} from "@/components/common/CommentsSection";
import {
  useCreateCommentVehicleUsagePlan,
  useGetVehicleUsagePlanComments,
} from "@/hooks/data/vehicle.data";
import { toast } from "@/hooks/use-toast";
import { VehicleService } from "@/services/vehicle.service";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";

type VehicleCommentsSectionProps = {
  id: number;
  allowAttachments?: boolean;
};

export default function VehicleCommentsSection({
  id,
  allowAttachments = true,
}: VehicleCommentsSectionProps) {
  const { data: commentsData, isLoading: commentsLoading } =
    useGetVehicleUsagePlanComments(id);
  const createCommentMutation = useCreateCommentVehicleUsagePlan();
  const queryClient = useQueryClient();

  const comments: CommonCommentItem[] = (commentsData || []).map((c: any) => ({
    id: c.id,
    userFullName: c.userFullName,
    userPosition: c.userPosition,
    comment: c.comment,
    createDate: c.createDate,
    attachments: Array.isArray(c.attachmentUsagePlans)
      ? (c.attachmentUsagePlans as CommonAttachment[])
      : [],
  }));

  const onSend = async (content: string, files: File[]) => {
    try {
      await VehicleService.saveCommentByType({
        objId: id,
        comment: content,
        files: allowAttachments ? files : [],
        type: "DU_TRU_XE_BINH_LUAN",
        hash: "",
        endDate: "",
        cmtContent: "",
      });
      await queryClient.invalidateQueries({
        queryKey: ["vehicle-usage-plan-comments", id],
      });
      ToastUtils.success("Thêm ý kiến xử lý thành công");
    } catch (error) {
      ToastUtils.error("Không thể thêm ý kiến xử lý. Vui lòng thử lại.");
    }
  };

  const onDownloadAttachment = async (file: CommonAttachment) => {
    const key = (file as any)?.name;
    if (!key) return undefined;
    return VehicleService.getCommentAttachmentFile(key);
  };

  return (
    <CommentsSectionCommon
      comments={comments}
      loading={commentsLoading}
      allowAttachments={allowAttachments}
      onSend={onSend}
      onDownloadAttachment={onDownloadAttachment}
    />
  );
}
