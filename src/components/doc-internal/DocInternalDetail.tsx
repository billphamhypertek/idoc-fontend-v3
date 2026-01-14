"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import CommentModal from "@/components/doc-internal/CommentModal";
import CompleteModal from "@/components/doc-internal/CompleteModal";
import DocInternalCommentsSection, {
  type DocInternalCommentsSectionRef,
} from "@/components/doc-internal/DocInternalCommentsSection";
import DocInternalFilesTable from "@/components/doc-internal/DocInternalFilesTable";
import DocInternalProcessTable from "@/components/doc-internal/DocInternalProcessTable";
import DocInternalReturnTable from "@/components/doc-internal/DocInternalReturnTable";
import GeneralInfoInternalCard from "@/components/doc-internal/GeneralInfoInternalCard";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { queryKeys } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";
import {
  useApproveDocInternal,
  useCompleteDocInternal,
  useDeleteDocInternal,
  useFindByExecuteDocinternal,
  useGetDocInternalComments,
  useGetDocInternalDetail,
  useRetakeDocInternal,
  useSaveNewCommentAttachment,
} from "@/hooks/data/doc-internal.data";
import {
  useListObjectTagQuery,
  useListTagUnpageQuery,
} from "@/hooks/data/label.data";
import { uploadFileService } from "@/services/file.service";
import { LabelService } from "@/services/label.service";
import { SharedService } from "@/services/shared.service";
import { isVerifierPDF, isVerifierPDFOrDocx } from "@/utils/common.utils";
import { viewFile } from "@/utils/file.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { getUserInfo } from "@/utils/token.utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Edit,
  Redo,
  Trash2,
  X,
} from "lucide-react";
import dynamic from "next/dynamic";
const DocumentViewer = dynamic(
  () => import("@/components/common/DocumentViewer"),
  {
    ssr: false,
  }
);

enum ApproveType {
  SIGNER = "SIGNER",
  USER = "USER",
  ORG = "ORG",
  COMMENTER = "COMMENTER",
}

enum HandleStatus {
  EXECUTE = "EXECUTE",
  VIEW = "VIEW",
}
interface DocInternalDetailProps {
  currentPageLabel: string;
}
export default function DocInternalDetail({
  currentPageLabel,
}: DocInternalDetailProps) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const docId = Number(params?.id);

  const commentSectionRef = useRef<DocInternalCommentsSectionRef | null>(null);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [checkComplete, setCheckComplete] = useState(false);
  const [checkRecipients, setCheckRecipients] = useState(false);
  const [selectedTags, setSelectedTags] = useState<any[]>([]);
  const [isPerformer, setIsPerformer] = useState(false);
  const [historyTab, setHistoryTab] = useState<string>("");
  const [previewFile, setPreviewFile] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);

  const [showCommentModal, setShowCommentModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [modalMode, setModalMode] = useState<{
    isApprove: boolean;
    isComment: boolean;
  }>({ isApprove: true, isComment: false });

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmActionType, setConfirmActionType] = useState<
    "retake" | "complete-creator" | "delete" | null
  >(null);
  const [confirmTitle, setConfirmTitle] = useState("");
  const [confirmDescription, setConfirmDescription] = useState("");

  const tParam = searchParams?.get("t") || "";

  const {
    data: detail,
    isLoading,
    refetch,
  } = useGetDocInternalDetail(docId || null);
  const { data: comments, refetch: refetchComments } =
    useGetDocInternalComments(docId || null);
  const { data: execInfo } = useFindByExecuteDocinternal(docId || null);

  const { data: allTags } = useListTagUnpageQuery();
  const { data: selectedTagsData } = useListObjectTagQuery(
    docId ? String(docId) : null,
    "VAN_BAN_NOI_BO"
  );

  const { mutate: approveDoc, isPending: approving } = useApproveDocInternal();
  const { mutate: retakeDoc, isPending: retaking } = useRetakeDocInternal();
  const { mutate: completeDoc, isPending: completing } =
    useCompleteDocInternal();
  const { mutate: deleteDoc, isPending: deleting } = useDeleteDocInternal();
  const { mutate: saveCommentAttach } = useSaveNewCommentAttachment();
  const queryClient = useQueryClient();

  const currentRoute = `/doc-internal/register/detail/${docId}`;
  const currentBaseRoute = `/${currentRoute.split("/").slice(1, 3).join("/")}`;

  // ==== THÊM: Hàm refresh toàn bộ data sau khi hoàn thành action ====
  const refreshDocInternalDetail = async () => {
    await Promise.all([
      queryClient.refetchQueries({
        queryKey: [queryKeys.docInternal.detail, docId],
      }),
      queryClient.refetchQueries({
        queryKey: [queryKeys.docInternal.comments, docId],
      }),
      queryClient.refetchQueries({
        queryKey: [queryKeys.docInternal.list],
      }),
    ]);
  };

  useEffect(() => {
    const user = JSON.parse(getUserInfo() || "{}");
    if (user?.id) {
      setCurrentUserId(user.id);
      setUserInfo(user);
    }
  }, []);

  useEffect(() => {
    if (tParam) {
      SharedService.setCurrentMenuDocInternal(tParam);
      setHistoryTab(tParam);
    } else {
      SharedService.loadCurrentMenuInternal();
      const tabFromStorage = SharedService.currentMenuDocumentInternal;
      if (tabFromStorage) {
        setHistoryTab(tabFromStorage);
      }
    }
  }, [tParam]);

  useEffect(() => {
    setHistoryTab(SharedService.currentMenuDocumentInternal || "");
  }, [SharedService.currentMenuDocumentInternal]);

  useEffect(() => {
    if (selectedTagsData) {
      setSelectedTags(selectedTagsData);
    }
  }, [selectedTagsData]);

  useEffect(() => {
    if (!detail || !userInfo?.id) return;
    if (detail.createBy === userInfo.id) {
      setCheckComplete(true);
    } else {
      setCheckComplete(false);
    }
  }, [detail, userInfo]);

  useEffect(() => {
    if (!execInfo?.data) {
      setCheckRecipients(false);
      return;
    }
    const PENDING_PUBLISH = Constant.DOC_INTERNAL_TAB_INDEX.PENDING_PUBLISH;
    if (historyTab === PENDING_PUBLISH) {
      setCheckRecipients(true);
    } else {
      setCheckRecipients(false);
    }
  }, [execInfo, historyTab]);

  const usersApprove = useMemo(() => {
    return (
      detail?.listApprover
        ?.filter((x: any) => x.type === ApproveType.USER)
        ?.map((x: any) => ({
          id: x.userId,
          fullName: x.userFullName,
          orgName: x.orgName,
          positionName: x.positionName,
        })) || []
    );
  }, [detail]);

  const orgApprove = useMemo(() => {
    return (
      detail?.listApprover
        ?.filter((x: any) => x.type === ApproveType.ORG)
        ?.map((x: any) => ({
          parent: null,
          child: x.orgId,
          name: x.orgName,
        })) || []
    );
  }, [detail]);

  const mainChecked = useMemo(() => {
    const list =
      detail?.listReceiver
        ?.filter((x: any) => x.handleStatus === HandleStatus.EXECUTE)
        ?.map((x: any) => ({
          parent: null,
          child: x.orgId ? x.orgId : x.userId,
          name: x.orgName ? x.orgName : x.userName,
          type: x.type ? x.type : x.orgId ? "ORG" : "USER",
          listCmt: x.listCmt,
        })) || [];

    if (userInfo?.id) {
      const isUserPerformer = list.some(
        (item: any) => item.child === userInfo.id
      );
      setIsPerformer(isUserPerformer);
    }

    return list;
  }, [detail, userInfo]);

  const toKnowCheck = useMemo(() => {
    return (
      detail?.listReceiver
        ?.filter((x: any) => x.handleStatus === HandleStatus.VIEW)
        ?.map((x: any) => ({
          parent: null,
          child: x.orgId ? x.orgId : x.userId,
          name: x.orgName ? x.orgName : x.userName,
          type: x.type ? x.type : x.orgId ? "ORG" : "USER",
        })) || []
    );
  }, [detail]);

  const textOrgApprove = useMemo(
    () => orgApprove.map((o: any) => o.name).join(", "),
    [orgApprove]
  );

  const textMainChecked = useMemo(
    () => mainChecked.map((o: any) => o.name).join(", "),
    [mainChecked]
  );

  const textToknowChecked = useMemo(
    () => toKnowCheck.map((o: any) => o.name).join(", "),
    [toKnowCheck]
  );

  const textUserApprove = useMemo(
    () =>
      usersApprove
        .map((u: any) => `${u.fullName} - ${u.positionName}`)
        .join(", "),
    [usersApprove]
  );

  const docFiles = useMemo(
    () =>
      detail?.listAttachment?.filter(
        (x: any) =>
          x.attachType === Constant.DOCUMENT_INTERNAL_FILE_TYPE.DOC_FILE
      ) || [],
    [detail]
  );

  const addendumFiles = useMemo(
    () =>
      detail?.listAttachment?.filter(
        (x: any) =>
          x.attachType === Constant.DOCUMENT_INTERNAL_FILE_TYPE.ADDENDUM_FILE
      ) || [],
    [detail]
  );

  const toAttachment = (f: any) => ({
    id: f.id,
    name: f.name,
    displayName: f.displayName || f.name,
    encrypt: !!f.encrypt,
  });

  const docFileAttachments = useMemo(
    () => (docFiles || []).map(toAttachment),
    [docFiles]
  );

  const addendumFileAttachments = useMemo(
    () => (addendumFiles || []).map(toAttachment),
    [addendumFiles]
  );

  const pdfDocFiles = useMemo(
    () =>
      docFiles
        ?.filter((file: any) => {
          return isVerifierPDFOrDocx(file);
        })
        .map((file: any) => ({
          id: file.id,
          name: file.name,
          displayName: file.displayName || file.name,
          encrypt: file.encrypt,
        })) || [],
    [docFiles]
  );

  const pdfAddendumFiles = useMemo(
    () =>
      addendumFiles
        ?.filter((file: any) => {
          return isVerifierPDFOrDocx(file);
        })
        .map((file: any) => ({
          id: file.id,
          name: file.name,
          displayName: file.displayName || file.name,
          encrypt: file.encrypt,
        })) || [],
    [addendumFiles]
  );
  // Ưu tiên file PDF trước, sau đó mới đến các định dạng khác được hỗ trợ
  const preferredViewableFiles = useMemo(() => {
    const merged = [...(pdfDocFiles || []), ...(pdfAddendumFiles || [])];
    const isPdf = (f: any) => isVerifierPDF(f);
    const pdfs = merged.filter(isPdf);
    const others = merged.filter((f) => !isPdf(f));
    return [...pdfs, ...others];
  }, [pdfDocFiles, pdfAddendumFiles]);

  useEffect(() => {
    // chỉ set lần đầu khi chưa có selectedFileId
    if (selectedFileId == null && preferredViewableFiles.length > 0) {
      setSelectedFileId(preferredViewableFiles[0].id);
    }
  }, [preferredViewableFiles, selectedFileId]);

  const checkSignAndApprove = (doc: any) => {
    if (doc?.docStatus === "NB_LANH_DAO_KY") {
      return true;
    }
    return false;
  };

  const checkPermissionEdit = (doc: any) => {
    if (!doc) return false;
    if (!currentUserId) {
      const user = JSON.parse(getUserInfo() || "{}");
      return doc.createBy && user?.id && doc.createBy === user.id;
    }
    return doc.createBy && doc.createBy === currentUserId;
  };
  const doEditDoc = (doc: any) => {
    if (!doc?.docId) return;
    router.push(`/doc-internal/update/${doc.docId}`);
  };
  const doBack = () => {
    const t = tParam;
    switch (t) {
      case Constant.DOC_INTERNAL_TAB_INDEX.DOING:
      case Constant.DOC_INTERNAL_TAB_INDEX.WAIT:
        router.push(`/doc-internal/approve?t=${t}`);
        break;
      case Constant.DOC_INTERNAL_TAB_INDEX.PUBLISH:
        router.push(`/doc-internal/publish`);
        break;
      case Constant.DOC_INTERNAL_TAB_INDEX.DRAFT:
      case Constant.DOC_INTERNAL_TAB_INDEX.DOING_APPROVE:
        router.push(
          `/doc-internal/register?t=${t === Constant.DOC_INTERNAL_TAB_INDEX.DRAFT ? "draft" : "registered"}`
        );
        break;
      case Constant.DOC_INTERNAL_TAB_INDEX.PENDING_PUBLISH:
      case Constant.DOC_INTERNAL_TAB_INDEX.PENDING_COMPLETE:
        router.push(`/doc-internal/pending`);
        break;
      default:
        router.back();
        break;
    }
  };

  const doApproveDoc = (doc: any) => {
    if (!doc) return;

    const isSignAction = checkSignAndApprove(doc);

    setModalMode({
      isApprove: true,
      isComment: !isSignAction,
    });
    setShowCommentModal(true);
  };

  const handleCommentConfirm = (comment: string, files: File[]) => {
    if (!detail) return;

    const isSignAction = checkSignAndApprove(detail);

    approveDoc(
      { docId: detail.docId, comment, files, accept: true },
      {
        onSuccess: async (data: any) => {
          if (isSignAction) {
            ToastUtils.success("Ký duyệt văn bản thành công");
            await refreshDocInternalDetail();
            router.push("/doc-internal/publish");
          } else {
            if (files.length > 0 && data) {
              try {
                saveCommentAttach({ commentId: Number(data), files });
              } catch {}
            }
            ToastUtils.success("Cho ý kiến văn bản thành công");
            await refreshDocInternalDetail();
            router.push(
              `/doc-internal/publish?t=${Constant.DOC_INTERNAL_TAB_INDEX.DOING}`
            );
          }
        },
      }
    );
  };

  const doRejectDoc = (docId: number) => {
    if (!docId) return;

    const comment = "";
    const files: File[] = [];

    approveDoc(
      { docId, comment, files, accept: false },
      {
        onSuccess: async () => {
          ToastUtils.success("Từ chối văn bản thành công");
          await refreshDocInternalDetail();
          router.push("/doc-internal/return");
        },
      }
    );
  };

  const doRetake = () => {
    if (!detail?.docId) return;

    setConfirmTitle("Thu hồi văn bản");
    setConfirmDescription("Bạn muốn thu hồi văn bản này?");
    setConfirmActionType("retake");
    setIsConfirmOpen(true);
  };

  const doComplete = () => {
    if (!detail?.docId) return;

    if (detail.createBy === userInfo?.id) {
      setConfirmTitle("Hoàn thành văn bản");
      setConfirmDescription("Bạn muốn hoàn thành văn bản này?");
      setConfirmActionType("complete-creator");
      setIsConfirmOpen(true);
    } else {
      setShowCompleteModal(true);
    }
  };

  const handleCompleteConfirm = (comment: string, files: File[]) => {
    if (!detail?.docId) return;

    completeDoc(
      { docId: detail.docId, files, comment },
      {
        onSuccess: async () => {
          ToastUtils.success("Hoàn thành văn bản thành công");
          await refreshDocInternalDetail();
          router.push("/doc-internal/pending");
        },
      }
    );
  };

  const doDeleteDoc = (doc: any) => {
    if (!doc?.docId) return;

    setConfirmTitle("Xóa văn bản");
    setConfirmDescription("Bạn chắc muốn xóa văn bản này?");
    setConfirmActionType("delete");
    setIsConfirmOpen(true);
  };

  const handleConfirmAction = () => {
    if (confirmActionType === "retake") {
      retakeDoc(detail.docId, {
        onSuccess: async () => {
          ToastUtils.success("Thu hồi văn bản thành công");
          await refreshDocInternalDetail();
          router.push("/doc-internal/register");
          setIsConfirmOpen(false);
        },
        onError: () => {
          setIsConfirmOpen(false);
        },
      });
    } else if (confirmActionType === "complete-creator") {
      completeDoc(
        { docId: detail.docId, files: [], comment: "" },
        {
          onSuccess: async () => {
            ToastUtils.success("Hoàn thành văn bản thành công");
            await refreshDocInternalDetail();
            router.push("/doc-internal/pending");
            setIsConfirmOpen(false);
          },
          onError: () => {
            setIsConfirmOpen(false);
          },
        }
      );
    } else if (confirmActionType === "delete") {
      deleteDoc(detail.docId, {
        onSuccess: async () => {
          ToastUtils.success("Xóa văn bản thành công");
          await refreshDocInternalDetail();
          router.push("/doc-internal/register");
          setIsConfirmOpen(false);
        },
        onError: () => {
          setIsConfirmOpen(false);
        },
      });
    }
  };

  const currentIsLoading =
    confirmActionType === "retake"
      ? retaking
      : confirmActionType === "complete-creator"
        ? completing
        : confirmActionType === "delete"
          ? deleting
          : false;

  const onClickFile = async (file: any, showPopup: boolean = false) => {
    try {
      if (isVerifierPDFOrDocx(file)) {
        await handleViewFile(file, showPopup);
      } else {
        await handleDownloadFile(file);
      }
    } catch (e) {
      console.error("Error with file:", e);
      ToastUtils.khongTheMoTepTin();
    }
  };

  const handleViewFile = async (file: any, showPopup: boolean = false) => {
    try {
      if (isVerifierPDFOrDocx(file)) {
        setSelectedFileId(file.id);
        if (showPopup) {
          setPreviewFile(true);
        }
      } else {
        await handleDownloadFile(file);
      }
    } catch (e) {
      console.error("Error viewing file:", e);
      ToastUtils.khongTheMoTepTin();
    }
  };

  const handleDownloadFile = async (file: any) => {
    try {
      if (file.encrypt) {
        const url = `/doc_internal/download/${file.id}`;
        await uploadFileService.doDecrypt(file.name, url, true, null);
      } else {
        await uploadFileService.downloadFile(
          file.name,
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL,
          file.encrypt,
          file.id
        );
      }
    } catch (e) {
      console.error("Error downloading file:", e);
      ToastUtils.error("Không thể tải xuống tệp tin");
    }
  };

  const doOpenShare = (file: any) => {
    ToastUtils.info("Chức năng chia sẻ file đang phát triển");
  };

  const handleViewFileInViewer = (fileId: number) => {
    setSelectedFileId(fileId);
    setPreviewFile(true);
  };

  const handleFileChange = (fileId: number) => {
    setSelectedFileId(fileId);
  };

  const handleDownloadFileFromViewer = async (file: any) => {
    await handleDownloadFile(file);
  };

  const getDocNumber = (): string => {
    const numberOrSign = detail?.numberOrSign ? detail.numberOrSign : "";
    const numberInBook = detail?.numberInBook ? `${detail.numberInBook}` : "";
    if (numberOrSign.includes(numberInBook)) {
      return numberOrSign;
    }
    return numberInBook + numberOrSign;
  };

  const handleChangeTags = async (next: any[]) => {
    if (!docId) return;

    const prev = selectedTags || [];
    const prevIds = new Set(prev.map((t: any) => String(t.id)));
    const nextIds = new Set((next || []).map((t: any) => String(t.id)));
    const toAdd = (next || []).filter((t: any) => !prevIds.has(String(t.id)));
    const toRemove = (prev || []).filter(
      (t: any) => !nextIds.has(String(t.id))
    );
    setSelectedTags(next);

    try {
      for (const tag of toAdd) {
        const tagData = {
          objId: String(docId),
          tagId: tag.id,
          type: "VAN_BAN_NOI_BO",
        };
        const data = await LabelService.assignTag(tagData);
        if (data) {
          ToastUtils.success("Gán nhãn thành công.", "Thành công");
        }
      }
      for (const tag of toRemove) {
        const tagData = {
          tagId: String(tag.id),
          objId: String(docId),
          type: "VAN_BAN_NOI_BO",
        };
        const data = await LabelService.removeObject(
          tagData.tagId,
          tagData.objId,
          tagData.type
        );
        if (data) {
          ToastUtils.success("Hủy gán nhãn thành công.", "Thành công");
          queryClient.invalidateQueries({
            queryKey: [
              queryKeys.objects.root,
              "byDocId",
              String(docId),
              "VAN_BAN_NOI_BO",
            ],
          });
        }
      }
      queryClient.invalidateQueries({
        queryKey: [
          queryKeys.objects.root,
          "byDocId",
          String(docId),
          "VAN_BAN_NOI_BO",
        ],
      });
    } catch (e) {}
  };

  const handleSubmitComment = async (
    comment: string,
    files: File[],
    encrypt: boolean
  ) => {
    if (!detail?.docId) return;

    try {
      const formattedComment = `- ${comment.trim()}`;

      if (encrypt && Constant.ENCRYPTION_TWD) {
        ToastUtils.warning("Kiểm tra kết nối mã hóa...");
      }

      const filesWithEncrypt = encrypt
        ? files.map((f: any) => ({ ...f, encrypt: true }))
        : files;

      if (encrypt && Constant.ENCRYPTION_TWD) {
        const data = {
          objId: detail.docId,
          files: filesWithEncrypt,
          comment: formattedComment,
          cmtContent: null,
          userIds: [],
          attType: "VAN_BAN_NOI_BO_BINH_LUAN",
          cmtType: "VAN_BAN_NOI_BO_BINH_LUAN",
          objType: "VAN_BAN_NOI_BO_BINH_LUAN",
          userOrobj: "VAN_BAN_NOI_BO_BINH_LUAN",
          onlyShareFileObject: true,
        };

        const rs = await uploadFileService.doSharePermissionDocFile(
          data,
          false
        );

        if (rs === false) {
          commentSectionRef.current?.clearCommentForm();
          refetchComments();
          refetch();
          return;
        }
      } else {
        const data = {
          objId: detail.docId,
          files: filesWithEncrypt,
          comment: formattedComment,
          cmtContent: "",
          endDate: "",
          hash: "",
          cmtType: "VAN_BAN_NOI_BO_BINH_LUAN",
        };

        await uploadFileService.saveCmtAndAtmByNonEnc(data);
      }

      commentSectionRef.current?.clearCommentForm();
      ToastUtils.success("Thêm ý kiến xử lý thành công.");

      await refreshDocInternalDetail();
      refetchComments();
      refetch();
    } catch (error) {
      console.error("Error submitting comment:", error);
      ToastUtils.error("Gửi ý kiến thất bại");
    }
  };

  const WAIT = Constant.DOC_INTERNAL_TAB_INDEX.WAIT;
  const DRAFT = Constant.DOC_INTERNAL_TAB_INDEX.DRAFT;
  const RETURN = Constant.DOC_INTERNAL_TAB_INDEX.RETURN;

  const showApproveButton = historyTab === WAIT;

  const showCompleteButton =
    (detail?.docStatus === "NB_CHO_DUYET" && checkComplete) ||
    (detail?.docStatus === "NB_BAN_HANH" && checkRecipients);

  const showEditDeleteButtons =
    (historyTab === DRAFT || historyTab === RETURN) &&
    checkPermissionEdit(detail) &&
    detail?.docStatus !== "NB_CHO_DUYET";

  const allowedComment = historyTab === WAIT;

  if (isLoading || !detail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Spinner variant="ring" size={48} className="text-blue-600" />
          <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between gap-4 mb-4 px-4">
        <BreadcrumbNavigation
          items={[{ label: "Văn bản nội bộ" }]}
          currentPage={currentPageLabel ?? "Chi tiết văn bản nội bộ"}
          showHome={false}
        />
        <div className="flex gap-2">
          {showApproveButton && (
            <Button
              onClick={() => doApproveDoc(detail)}
              disabled={approving}
              className="h-9 bg-blue-600 hover:bg-blue-700 hover:text-white text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              {checkSignAndApprove(detail) ? "Ký duyệt" : "Cho ý kiến"}
            </Button>
          )}
          {showCompleteButton && (
            <Button
              onClick={doComplete}
              disabled={completing}
              className="h-9 bg-blue-600 hover:bg-blue-700 hover:text-white text-white"
              variant="default"
            >
              <CheckCircle className="mr-2 h-4 w-4" /> Hoàn thành
            </Button>
          )}
          {detail?.canRetake && (
            <Button
              variant="secondary"
              onClick={doRetake}
              disabled={retaking}
              className="h-9 bg-red-600 hover:bg-red-700 hover:text-white text-white"
            >
              <Redo className="mr-2 h-4 w-4" /> Thu hồi
            </Button>
          )}
          {showEditDeleteButtons && (
            <>
              <Button
                variant="outline"
                onClick={() => doEditDoc(detail)}
                className="h-9 bg-blue-600 hover:bg-blue-700 hover:text-white text-white"
              >
                <Edit className="mr-2 h-4 w-4" /> Sửa
              </Button>
              <Button
                variant="destructive"
                onClick={() => doDeleteDoc(detail)}
                disabled={deleting}
                className="h-9 bg-red-600 hover:bg-red-700 hover:text-white text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Xóa
              </Button>
            </>
          )}
          <Button variant="outline" onClick={doBack} className="h-9">
            <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
          </Button>
        </div>
      </div>
      <div className="bg-white px-4">
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-9 space-y-4 max-w-full min-w-0">
            <GeneralInfoInternalCard
              detail={detail}
              dropdownList={allTags}
              selectedItems={selectedTags}
              onChangeTags={handleChangeTags}
              docFiles={docFileAttachments}
              addendumFiles={addendumFileAttachments}
              onViewFile={(file) =>
                viewFile(
                  file,
                  Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
                )
              }
              onDownloadFile={handleDownloadFile}
              onShareFile={doOpenShare}
              textMainChecked={textMainChecked}
              textToknowChecked={textToknowChecked}
            />
            <DocInternalReturnTable listReturn={detail?.listReturn} />
            {(pdfDocFiles.length > 0 || pdfAddendumFiles.length > 0) && (
              <div className="mt-4">
                <DocumentViewer
                  files={[...pdfDocFiles, ...pdfAddendumFiles]}
                  documentTitle={(() => {
                    const selectedFile = selectedFileId
                      ? [...pdfDocFiles, ...pdfAddendumFiles].find(
                          (f: any) => f.id === selectedFileId
                        )
                      : [...pdfDocFiles, ...pdfAddendumFiles][0];
                    const fileName =
                      selectedFile?.displayName ||
                      [...pdfDocFiles, ...pdfAddendumFiles][0]?.displayName ||
                      "";
                    return fileName ? `Chi tiết tệp văn bản: ${fileName}` : "";
                  })()}
                  selectedFile={
                    selectedFileId
                      ? [...pdfDocFiles, ...pdfAddendumFiles].find(
                          (f: any) => f.id === selectedFileId
                        )
                      : [...pdfDocFiles, ...pdfAddendumFiles][0]
                  }
                  handleDownloadFile={handleDownloadFileFromViewer}
                  onFileChange={handleFileChange}
                  fileType={Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL}
                />
              </div>
            )}

            <DocInternalFilesTable
              title="Tệp văn bản"
              files={docFiles}
              canViewFile={(file: any) => isVerifierPDFOrDocx(file)}
              onDownloadFile={handleDownloadFile}
              onOpenShare={doOpenShare}
              onClickFile={onClickFile}
              onViewFile={(file) =>
                viewFile(
                  file,
                  Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
                )
              }
              showDigitalSign={true}
              signingFiles={new Set()}
              selectedSignatureTypes={{}}
              setSelectedSignatureTypes={() => {}}
              digitalSignSkips={[]}
              docNumber={getDocNumber()}
            />

            <DocInternalFilesTable
              title="Tệp phụ lục"
              files={addendumFiles}
              canViewFile={(file: any) => isVerifierPDFOrDocx(file)}
              onDownloadFile={handleDownloadFile}
              onOpenShare={doOpenShare}
              onClickFile={onClickFile}
              onViewFile={(file) =>
                viewFile(
                  file,
                  Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
                )
              }
              showDigitalSign={false}
              docNumber={getDocNumber()}
            />

            <DocInternalProcessTable
              listApprover={detail?.listApprover}
              mainChecked={mainChecked}
              toKnowCheck={toKnowCheck}
              docInternal={detail}
              currentUserId={currentUserId || undefined}
              isPerformer={isPerformer}
              onClickFile={onClickFile}
              onViewFile={(file) =>
                viewFile(
                  file,
                  Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
                )
              }
              onOpenShare={doOpenShare}
            />
          </div>
          <div className="col-span-12 md:col-span-3">
            <DocInternalCommentsSection
              ref={commentSectionRef}
              docId={docId}
              comments={comments || []}
              allowedComment={true}
              onSubmitComment={handleSubmitComment}
              isSubmitting={approving}
              onOpenShare={doOpenShare}
            />
          </div>
        </div>
        {previewFile && selectedFileId && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-auto relative">
              <button
                onClick={() => setPreviewFile(false)}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <X className="w-3 h-3" />
              </button>
              <DocumentViewer
                files={[...pdfDocFiles, ...pdfAddendumFiles]}
                selectedFile={[...pdfDocFiles, ...pdfAddendumFiles].find(
                  (f: any) => f.id === selectedFileId
                )}
                handleDownloadFile={handleDownloadFileFromViewer}
                onFileChange={handleFileChange}
                fileType={Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL}
                noHeader={false}
              />
            </div>
          </div>
        )}
      </div>
      <CommentModal
        open={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        onConfirm={handleCommentConfirm}
        isApprove={modalMode.isApprove}
        isComment={modalMode.isComment}
        isSubmitting={approving}
      />
      <CompleteModal
        open={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onConfirm={handleCompleteConfirm}
        isSubmitting={completing}
      />
      <ConfirmDeleteDialog
        isOpen={isConfirmOpen}
        onOpenChange={(open) => {
          if (open || !currentIsLoading) setIsConfirmOpen(open);
        }}
        onConfirm={handleConfirmAction}
        title={confirmTitle}
        description={confirmDescription}
        confirmText="Đồng ý"
        cancelText="Hủy"
        isLoading={currentIsLoading}
        haveNote={false}
        positionButton={false}
      />
    </div>
  );
}
