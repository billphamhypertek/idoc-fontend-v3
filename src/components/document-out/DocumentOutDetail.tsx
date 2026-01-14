"use client";
import { format } from "date-fns";
import React, { useEffect, useMemo, useRef, useState } from "react";

// Placeholder components (to be implemented separately)
import DocumentOutCommentsSection, {
  DocumentOutCommentsSectionRef,
} from "@/components/document-out/CommentsSection";
import DocumentOutComment from "@/components/document-out/DocumentOutComment";
import DocumentOutDeadline from "@/components/document-out/DocumentOutDeadline";
import DocumentOutEvaluate from "@/components/document-out/DocumentOutEvaluate";
import DocumentOutRetakeByStep from "@/components/document-out/DocumentOutRetakeByStep";
import DocumentOutTracking from "@/components/document-out/DocumentOutTracking";
import DocumentProcessDone from "@/components/document-out/DocumentProcessDone";
import DocumentReject from "@/components/document-out/DocumentReject";
import RetakeDoneDocument from "@/components/document-out/RetakeDoneDocument";
import SharedUser from "@/components/document-out/SharedUser";

// Shadcn UI imports
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ActionButtons from "@/components/document-out/ActionButtons";
import AttachmentsCard from "@/components/document-out/AttachmentsCard";
import DataTableCard from "@/components/document-out/DataTableCard";
import DocList from "@/components/document-out/DocList";
import GeneralInfoCard from "@/components/document-out/GeneralInfoCard";
import ProcessTableCard from "@/components/document-out/ProcessTableCard";
import RetakeChildDocument from "@/components/document-out/RetakeChildDoc";
import { SwitchAndAddUser } from "@/components/document-out/SwitchAndAddUser";
import type {
  Attachment,
  Document,
  DocumentDetail,
  ProcessRow,
  TagItem,
} from "@/components/document-out/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { queryKeys } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import type {
  ButtonStatus,
  ChildrenRow,
  CollapseState,
  NextNode,
  ParentRow,
  ProcessFlatRow,
  ProcessItemData,
  ResponseRow,
  TableColumn,
  TaskRow,
} from "@/definitions/types/document-out";
import { useGetNextNodes, useGetStartNode } from "@/hooks/data/bpmn2.data";
import { useRejectDocument } from "@/hooks/data/document-out.actions";
import {
  useGetDocumentOutDetailLegacy,
  useGetHandleType,
  useGetReceiveAndSend,
} from "@/hooks/data/document-out.data";
import { useGetHstlContainDocId } from "@/hooks/data/document-record.data";
import { useCheckTypeHandleByDoc } from "@/hooks/data/document.data";
import {
  useListObjectTagQuery,
  useListTagUnpageQuery,
} from "@/hooks/data/label.data";
import { useSignYKien } from "@/hooks/useSignYKien";
import { Bpmn2Service } from "@/services/bpmn2.service";
import { CommonService } from "@/services/common";
import { DocumentService } from "@/services/document.service";
import { uploadFileService } from "@/services/file.service";
import { LabelService } from "@/services/label.service";
import { notificationService } from "@/services/notification.service";
import { UserService } from "@/services/user.service";
import {
  handleError,
  isVerifierPDF,
  isVerifierPDFOrDocx,
} from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { getUserInfo } from "@/utils/token.utils";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useParams, usePathname, useRouter } from "next/navigation";
import SelectHstl from "./SelectHstl";

// Additional types
import type { User } from "@/definitions";
import type { SharedFileData } from "@/definitions/types/document-out.type";
import {
  DecryptionProgress,
  DecryptionService,
} from "@/services/decryption.service";
import { useEncryptStore } from "@/stores/encrypt.store";
import { viewFileCheck } from "@/utils/file.utils";
import WorkAssignDialog from "../work-assign/createDialog";
import useAuthStore from "@/stores/auth.store";
import {
  currentMessage$,
  decryptResult$,
} from "@/services/event-emitter.service";
import { usePdfStore } from "@/stores/pdf.store";
import LoadingOverlay from "@/components/overlay/LoadingOverlay";
import DecryptOverlay from "@/components/overlay/DecryptOverlay";
import dayjs from "dayjs";
// Minimal response type for CommonService.getUserLeadOrgBanTransfer()
type LeadOrgTransferCheck = {
  isTransfer: boolean;
  truongBanId: number[];
  vanThuDonViId: number[];
  comment: string;
  commentTruongBan: string;
};

// ProgressBar component
const ProgressBar = ({ progress }: { progress: number }) => {
  const percentage = Math.min(Math.max(progress || 0, 0), 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            percentage === 100
              ? "bg-green-500"
              : percentage >= 75
                ? "bg-blue-600"
                : percentage >= 50
                  ? "bg-yellow-500"
                  : percentage >= 25
                    ? "bg-orange-500"
                    : "bg-red-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Types moved to shared file: '@/components/document-out/types'

const DocumentOutDetail: React.FC = () => {
  const { id: documentId, isDelegate } = useParams<{
    id: string;
    isDelegate: string;
  }>() || { id: "", isDelegate: "" };
  const { setPdf, clearPdf } = usePdfStore();
  const pathname = usePathname();
  const queryParams = new URLSearchParams(location.search);
  const isTrackDocumentList = queryParams.get("isTrackDocumentList") === "true";
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail>({
    document: {} as Document,
  });
  const [selectedItems, setSelectedItems] = useState<TagItem[]>([]);
  const [selectedFile, setSelectedFile] = useState<Attachment | undefined>(
    undefined
  );
  const [dropdownList, setDropdownList] = useState<TagItem[]>([]);
  const [hstlList, setHstlList] = useState<unknown[]>([]);
  const [collapseState, setCollapseState] = useState<CollapseState>({
    docInfo: false,
    docProcess: true,
    listTask: true,
    attachments: true,
  });
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>({
    canAsk: false,
    canDone: false,
    canReply: false,
    canReview: false,
    canRequestReview: false,
    canReturn: false,
    canTransfer: false,
    canRetake: false,
    canRetakeDone: false,
    canSwitchOrAdd: false,
    canOrgTransfer: false,
    createTaskButton: false,
    canFinish: false,
    canRead: false,
    canMoreTime: true,
  });
  useEffect(() => {
    // Reset tất cả button về false mỗi khi documentId thay đổi
    setButtonStatus({
      canAsk: false,
      canDone: false,
      canReply: false,
      canReview: false,
      canRequestReview: false,
      canReturn: false,
      canTransfer: false,
      canRetake: false,
      canRetakeDone: false,
      canSwitchOrAdd: false,
      canOrgTransfer: false,
      createTaskButton: false,
      canFinish: false,
      canRead: false,
      canMoreTime: true,
    });
  }, [documentId]);
  const [isdownloadFile, setIsdownloadFile] = useState(false);
  const [nameFileDownload, setNameFileDownload] = useState("");
  const [isVanthuDv, setIsVanthuDv] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showReadButton, setShowReadButton] = useState(false);
  const [modalNode, setModalNode] = useState<NextNode | null>(null);
  const [isShowNhatTri, setIsShowNhatTri] = useState(false);
  const [textShowNhatTri, setTextShowNhatTri] = useState("Nhất trí");
  const [isShowNextVanThuPhong, setIsShowNextVanThuPhong] = useState(false);
  const [listUserTransfer, setListUserTransfer] = useState<User[]>([]);
  const [showRetakeChildDocModal, setShowRetakeChildDocModal] = useState(false);
  const [textShowChuyenVanThu, setTextShowChuyenVanThu] = useState(
    "Chuyển văn thư phòng Hành chính"
  );
  const [listNextNode, setListNextNode] = useState<NextNode[]>([]);
  const [listNextNodeOrg, setListNextNodeOrg] = useState<NextNode[]>([]);
  type CurrentNodeInfo = {
    step?: number;
    node?: number;
    type?: number | string;
  } | null;
  const [docCurrentNode, setDocCurrentNode] = useState<CurrentNodeInfo>(null);
  const [nodeHandleByUser, setNodeHandleByUser] = useState<number | null>(null);
  const [processStep, setProcessStep] = useState(0);
  const [isCanFinishReceive, setIsCanFinishReceive] = useState(false);
  const [isShowRejectChildDoc, setIsShowRejectChildDoc] = useState(false);
  const [showBtnNewDraft, setShowBtnNewDraft] = useState(
    Constant.BTN_NEW_DRAFT_FROM_DOC_IN_DETAIL_H05
  );
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showProcessDoneModal, setShowProcessDoneModal] = useState({
    open: false,
    isFinishReceive: false,
  });
  const [showAskIdeaModal, setShowAskIdeaModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState({
    open: false,
    isEvaluate: false,
  });
  const [showRetakeByStepModal, setShowRetakeByStepModal] = useState(false);
  const [showStepRetakeModal, setShowStepRetakeModal] = useState(false);
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
  const [showRetakeDoneModal, setShowRetakeDoneModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showSelectHstlModal, setShowSelectHstlModal] = useState(false);
  const [showDocListModal, setShowDocListModal] = useState(false);
  const [showSharedUserModal, setShowSharedUserModal] = useState(false);
  const [isShowLoadingEncrypt, setIsShowLoadingEncrypt] = useState(false);
  const [isSwitchDone, setIsSwitchDone] = useState(false);
  const [canDoneInternal, setCanDoneInternal] = useState(false);
  const [viewContent, setViewContent] = useState(true);
  const [isCanHandleDoc, setIsCanHandleDoc] = useState(true);
  const [openWorkAssignDialog, setOpenWorkAssignDialog] = useState(false);
  const { isEncrypt: encryptShowing } = useEncryptStore();
  const router = useRouter();
  const [newComment, setNewComment] = useState({
    comment: "",
    attachments: [] as File[],
    isToken: false,
    endDate: null as Date | null,
  });
  const [process, setProcess] = useState<DecryptionProgress>({});
  const commentSectionRef = useRef<DocumentOutCommentsSectionRef | null>(null);
  const { signYKien, isLoading: isLoadingSignYKien } = useSignYKien();
  const { user: userInfo } = useAuthStore();
  const nameText = userInfo?.fullName ?? "";
  const positionNameUser = userInfo?.positionModel.name || "";
  const isTruongBan = () => positionNameUser?.toLowerCase() === "trưởng ban";
  // Danh sách tệp có thể xem (PDF/DOCX)
  const viewableFiles = useMemo<Attachment[]>(() => {
    const atts = documentDetail?.document?.attachments ?? [];
    return atts.filter((att: any) => isVerifierPDFOrDocx(att));
  }, [documentDetail?.document?.attachments]);
  // Ưu tiên PDF trước, sau đó các định dạng khác (DOCX...)
  const preferredViewableFiles = useMemo<Attachment[]>(() => {
    const isPdf = (f: Attachment) => isVerifierPDF(f);
    const pdfs = viewableFiles.filter(isPdf);
    const others = viewableFiles.filter((f) => !isPdf(f));
    return [...pdfs, ...others];
  }, [viewableFiles]);
  const forceDisconnect = () => {
    DecryptionService.disconnect();
    setIsShowLoadingEncrypt(false);
  };
  useEffect(() => {
    // Chỉ set lần đầu: ưu tiên PDF, nếu không có thì chọn file có thể xem đầu tiên
    const first = preferredViewableFiles[0];
    if (!first) return;
    if (!selectedFile) {
      if (!encryptShowing) setSelectedFile(first);
      else {
        viewFile(first);
        setSelectedFile(first);
      }
    }
  }, [preferredViewableFiles, encryptShowing, selectedFile]);
  useEffect(() => {
    const unsub = DecryptionService.subscribe((data) => setProcess(data));
    return () => unsub();
  }, []);
  useEffect(() => {
    currentMessage$.subscribe((event) => {
      if (event === Constant.SHARE_DATA.CLOSE_POPUP) forceDisconnect();
    });
  }, []);
  useEffect(() => {
    if (isTrackDocumentList) {
      setButtonStatus((prev) => ({
        ...prev,
        canAsk: false,
        canDone: false,
        canReply: false,
        canReview: false,
        canRequestReview: false,
        canReturn: false,
        canTransfer: false,
        canRetake: false,
        canRetakeDone: false,
        canSwitchOrAdd: false,
        canOrgTransfer: false,
        canFinish: false,
        canRead: false,
        canMoreTime: true,
      }));
    }
  }, [isTrackDocumentList]);
  // Expand/collapse state and flattening for process tree data (Thông tin gửi nhận)
  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());
  const toggleExpanded = (path: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const flattenProcess = (
    nodes: { data: ProcessItemData; children?: { data: ProcessItemData }[] }[],
    level: number = 0,
    basePath: string = "0"
  ): ProcessRow[] => {
    const rows: ProcessRow[] = [];
    nodes.forEach((node, index) => {
      const path = node?.data?.pid || "";
      const hasChildren = !!(node.children && node.children.length);
      rows.push({
        data: node.data,
        children: node.children,
        level,
        path,
        hasChildren,
      } as unknown as ProcessRow);
      if (hasChildren && expandedSet.has(path)) {
        rows.push(...flattenProcess(node.children!, level + 1, path));
      }
    });
    return rows;
  };

  const processColumns: TableColumn<ProcessFlatRow>[] = [
    {
      accessorKey: "frInfo",
      header: "Người gửi/nhận",
      accessor: (row: ProcessFlatRow) => (
        <div
          className="flex items-start"
          style={{ paddingLeft: `${row?.level * 12}px` }}
        >
          <div className="mr-2">
            {row?.children?.length ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(row?.data?.pid ?? "");
                }}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label={
                  !expandedSet.has(row?.data?.pid ?? "") ? "Collapse" : "Expand"
                }
              >
                {expandedSet.has(row?.data?.pid ?? "") ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
            ) : (
              <span className="w-4 inline-block" />
            )}
          </div>
          <div>
            {row?.data?.frUser === row?.data?.toUser ? (
              <div>{row?.data?.frInfo}</div>
            ) : (
              <div>
                <div>{row?.data?.toInfo}</div>
                {row?.data?.delegateInfo && (
                  <div>({row?.data?.delegateInfo})</div>
                )}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "handleStatus",
      header: "Trạng thái",
      accessor: (row: ProcessFlatRow) => row?.data?.handleStatus,
    },
    {
      accessorKey: "deadline",
      header: "Hạn xử lý",
      accessor: (row: ProcessFlatRow) =>
        row?.data?.deadline
          ? format(new Date(row?.data?.deadline), "dd/MM/yyyy")
          : "",
    },
    {
      accessorKey: "action",
      header: "Hoạt động",
      accessor: (row: ProcessFlatRow) => {
        const action = row?.data?.action;
        let backgroundColor = "";
        let textColor = "text-gray-800";

        if (action === "Đã xem") {
          backgroundColor = "bg-blue-100";
          textColor = "text-blue-800";
        } else if (action === "Đang xử lý") {
          backgroundColor = "bg-yellow-100";
          textColor = "text-yellow-800";
        } else if (action === "Hoàn thành") {
          backgroundColor = "bg-green-100";
          textColor = "text-green-800";
        } else if (action === "Đã xử lý") {
          backgroundColor = "bg-green-100";
          textColor = "text-green-800";
        } else if (action === "Trả lại") {
          backgroundColor = "bg-red-100";
          textColor = "text-red-800";
        } else if (action === "Chuyển tiếp") {
          backgroundColor = "bg-purple-100";
          textColor = "text-purple-800";
        } else {
          backgroundColor = "bg-gray-100";
          textColor = "text-gray-800";
        }

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${backgroundColor} ${textColor}`}
          >
            {action}
          </span>
        );
      },
    },
    {
      accessorKey: "progress",
      header: "Tiến độ",
      accessor: (row: ProcessFlatRow) => (
        <ProgressBar progress={row?.data?.progress || 0} />
      ),
    },
  ];

  // Parent doc columns
  const parentColumns: TableColumn<ParentRow>[] = [
    {
      accessorKey: "stt",
      header: "STT",
      accessor: (row: ParentRow) => row.stt,
    },
    {
      accessorKey: "preview",
      header: "Trích Yếu",
      accessor: (row: ParentRow) => row.preview,
    },
    {
      accessorKey: "orgReceive",
      header: "Đơn vị chuyển văn bản",
      accessor: (row: ParentRow) => row.orgReceive,
    },
    {
      accessorKey: "statusName",
      header: "Trạng thái",
      accessor: (row: ParentRow) => row.statusName,
    },
  ];

  // Children columns
  const childrenColumns: TableColumn<ChildrenRow>[] = [
    {
      accessorKey: "stt",
      header: "STT",
      accessor: (row: ChildrenRow) => row.stt,
    },
    {
      accessorKey: "preview",
      header: "Trích Yếu",
      accessor: (row: ChildrenRow) => row.preview,
    },
    {
      accessorKey: "orgReceive",
      header: "Đơn vị tiếp nhận",
      accessor: (row: ChildrenRow) => row.orgReceive,
    },
    {
      accessorKey: "typeOrg",
      header: "Tình trạng",
      accessor: (row: ChildrenRow) => getStatus(row.typeOrg),
    },
    { accessorKey: "statusName", header: "Trạng thái" },
    {
      header: "Thao tác",
      type: "action",
      renderActions: (row: ChildrenRow) =>
        Constant.ORG_MULTI_TRANSFER_BCY &&
        isShowRejectChildDoc && (
          <div className="space-x-2">
            {row.status == "DONE" ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => doReject(String(row.id))}
              >
                Từ chối
              </Button>
            ) : (
              <label className="text-green-500">Từ chối</label>
            )}
            {row.status == "WAIT_RECEIVE" ? (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => doRetakeChildDocument(String(row.id))}
              >
                Thu hồi
              </Button>
            ) : (
              <label className="text-gray-500">Thu hồi</label>
            )}
          </div>
        ),
    },
  ];

  // Response columns
  const responseColumns: TableColumn<ResponseRow>[] = [
    {
      accessorKey: "stt",
      header: "STT",
      accessor: (row: ResponseRow) => row.stt,
    },
    {
      accessorKey: "preview",
      header: "Trích Yếu",
      accessor: (row: ResponseRow) => row.preview,
    },
    {
      accessorKey: "statusName",
      header: "Trạng thái",
      accessor: (row: ResponseRow) => row.statusName,
    },
  ];
  // Task columns
  const taskColumns: TableColumn<TaskRow>[] = [
    { accessorKey: "stt", header: "STT", accessor: (row: TaskRow) => row.stt },
    {
      accessorKey: "taskName",
      header: "Tên công việc",
      accessor: (row: TaskRow) => row.taskName,
    },
    {
      accessorKey: "userAssignName",
      header: "Người giao việc",
      accessor: (row: TaskRow) => row.userAssignName,
    },
  ];

  // Toggle functions for collapse
  const docInfoUpdateStatus = () => {
    setCollapseState((prev) => ({ ...prev, docInfo: !prev.docInfo }));
  };

  const docProcessUpdateStatus = () => {
    setCollapseState((prev) => ({ ...prev, docProcess: !prev.docProcess }));
  };

  const listTaskUpdateStatus = () => {
    setCollapseState((prev) => ({ ...prev, listTask: !prev.listTask }));
  };

  const attachmentsUpdateStatus = () => {
    setCollapseState((prev) => ({ ...prev, attachments: !prev.attachments }));
  };

  // Reusable helper to handle leader/office transfer flows
  const handleLeaderTransfer = async (
    mode: "nhat_tri" | "gui_van_thu"
  ): Promise<void> => {
    try {
      const resCheck: LeadOrgTransferCheck =
        await CommonService.getUserLeadOrgBanTransfer();
      if (!resCheck?.isTransfer) return;

      const docIdNum = Number(documentId);

      if (mode === "nhat_tri") {
        // Requires signing then transfer to leader or office depending on config
        signYKien({
          message: newComment.comment,
          successCallback: (_ev: unknown, data: string) => {
            let signature = "";
            try {
              const received = JSON.parse(data);
              signature = received?.Signature ?? "";
            } catch (e) {
              console.error("Parse JSON error:", e);
            }
            transferOne(
              docIdNum,
              "",
              resCheck.truongBanId,
              resCheck.vanThuDonViId,
              resCheck.comment,
              resCheck.commentTruongBan,
              false,
              signature
            );
          },
          failCallback: (err: unknown) => {
            console.error("Sign failed:", err);
            transferOne(
              docIdNum,
              "",
              resCheck.truongBanId,
              resCheck.vanThuDonViId,
              resCheck.comment,
              resCheck.commentTruongBan,
              false,
              ""
            );
          },
        });
      } else {
        // Send to office (no signature)
        transferOne(
          docIdNum,
          "",
          [],
          resCheck.vanThuDonViId,
          resCheck.comment,
          "",
          true,
          ""
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const doNhatTri = () => handleLeaderTransfer("nhat_tri");
  const guiVanThuPhongHC = () => handleLeaderTransfer("gui_van_thu");

  const transferOne = async (
    documentId: number,
    comment: string,
    main: number[] | null,
    main2: number[] | null,
    textComment: string,
    textComment2: string,
    isVanThu: boolean,
    signature: string
  ) => {
    try {
      const res = await DocumentService.doGetHandleType(documentId, "");
      if (res) {
        setDocCurrentNode(res);
        if (!res.node || res.node === 0) {
          setListNextNode([]);
        } else {
          setListNextNode([]);
          await doNextNode(
            res.node,
            documentId,
            comment,
            main,
            main2,
            textComment,
            textComment2,
            isVanThu,
            signature
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const setSharedFileData = (
    documentId: number,
    comment: string,
    cmtContent: string,
    userIds: number[]
  ): SharedFileData => {
    const data: SharedFileData = {
      objId: documentId,
      files: newComment?.attachments,
      comment: newComment?.comment,
      cmtContent,
      userIds,
      userIdShared: [],
      allFileNames: [],
      attType: CERT_OBJ_TYPE.doc_in_add as unknown as string,
      cmtType: "VAN_BAN_DEN_CMT",
      userOrobj: CERT_OBJ_TYPE.user as unknown as string,
    };
    return data;
  };

  const doNextNode = async (
    nodeId: number,
    documentId: number,
    comment: string,
    main: number[] | null,
    main2: number[] | null,
    textComment: string,
    textComment2: string,
    isVanThu: boolean,
    signature: string
  ) => {
    try {
      const res = await Bpmn2Service.getNextNodes(nodeId);
      let nextNodeInfo: NextNode | null = null;
      let nextNodeId: number | null = null;

      if (res && res.length > 0) {
        res.forEach((element: any) => {
          const name = element.name.trim().toLowerCase();
          if (
            !isVanThu &&
            [
              "trưởng ban",
              "lãnh đạo ban",
              "trưởng đơn vị",
              "văn thư ban",
              "văn thư",
              "văn thư đơn vị",
            ].includes(name)
          ) {
            nextNodeId = element.id;
            nextNodeInfo = element;
          } else if (
            isVanThu &&
            ["văn thư đơn vị", "văn thư văn phòng"].includes(name)
          ) {
            nextNodeId = element.id;
            nextNodeInfo = element;
          }
        });
      }

      if (!nextNodeId) {
        ToastUtils.khongTimThayLuongPhuHop();
        return;
      }

      const resultUser: User[] = await Bpmn2Service.getUsersByNode(nextNodeId);
      setListUserTransfer(resultUser);

      let dataId = 0;
      let text = "";
      let userReceivedTransfer = "";

      const mainSafe = main ?? [];
      const main2Safe = main2 ?? [];

      const checkExit = resultUser.filter((u) =>
        mainSafe.includes(u.id as number)
      );

      if (checkExit.length === 1) {
        dataId = checkExit[0].id;
        text = `${checkExit[0].positionName} ${checkExit[0].fullName}`;
        userReceivedTransfer = `${checkExit[0].positionName}: ${checkExit[0].fullName}`;
      } else if (checkExit.length > 1) {
        // Trường hợp nhiều người => mở popup chọn
        doOpenTransferPopup(nextNodeInfo);
        return;
      } else {
        const checkExit2 = resultUser.filter((u) =>
          main2Safe.includes(u.id as number)
        );
        if (checkExit2.length > 0) {
          dataId = checkExit2[0].id;
          text = `${checkExit2[0].positionName} ${checkExit2[0].fullName}`;
          userReceivedTransfer = `${checkExit2[0].positionName}: ${checkExit2[0].fullName}`;
        } else {
          const nodeName =
            nextNodeInfo && typeof (nextNodeInfo as any).name === "string"
              ? String((nextNodeInfo as any).name)
              : "";
          ToastUtils.khongTheChuyenXuLy(nodeName);
          return;
        }
      }

      const userIds = [dataId];

      // xử lý chia sẻ file
      const attachLen =
        (window as unknown as { lengthAtt?: { length?: number } }).lengthAtt
          ?.length ?? 0;
      if (attachLen > 0) {
        const data = setSharedFileData(documentId, text, text, userIds);
        const rs = await uploadFileService.doSharePermissionDocFile(data);
        if (rs === false) return;
      }

      if (nextNodeId && dataId !== 0) {
        await DocumentService.documentTrasferListComment(
          documentId?.toString(),
          `Xử lý chính: ${text} - Ý kiến: Nhất trí`,
          signature,
          nextNodeId,
          dataId?.toString(),
          "false"
        );

        await commentSectionRef.current?.saveNewDraftComment();
        ToastUtils.chuyenXuLyVanBan(userReceivedTransfer);
        notificationService.countUnreadNotification();
        router.push("/document-out/main");
      } else {
        ToastUtils.khongTimThayLuongPhuHop();
      }
    } catch (e) {
      handleError(e);
    }
  };

  const doOpenSwitchUserPopup = () => {
    // Set currentSelectedNodeID like Angular
    // this.bpmnService.currentSelectedNodeID = this.nodeHandleByUser;
    setShowSwitchUserModal(true);
  };

  const doOpenDeadlinePopup = () => {
    setShowDeadlineModal(true);
  };

  const doCreateTask = () => {
    router.push(
      `/task/userAssign?docId=${documentId}&name=${documentDetail.document?.preview}`
    );
  };

  const newDraftDocument = () => {
    router.push(
      "/document-in/draft-list/draft-insert?documentId=" + documentId
    );
  };
  const getDateLeft = () => {
    const deadline = documentDetail?.document?.deadline;

    // Không có deadline → trả theo rule
    if (!deadline) {
      return "";
    }

    // deadline dạng yyyy-MM-dd (như trong transform)
    const deadlineDate = dayjs(deadline, "YYYY-MM-DD");
    const currentDate = dayjs();

    // Tính số ngày còn lại (logic nguyên bản)
    const dateLeft =
      Math.floor(
        deadlineDate.diff(currentDate, "millisecond") / (1000 * 3600 * 24)
      ) + 2;

    return Math.max(dateLeft, 0)?.toString();
  };

  const queryClient = useQueryClient();
  const { mutate: doRejectDocument } = useRejectDocument();
  const doReject = (docId: string) => {
    doRejectDocument([Number(docId)], {
      onSuccess: () => {
        ToastUtils.documentRejectSuccess();
        queryClient.invalidateQueries({
          queryKey: [queryKeys.documentOut.detail],
        });
      },
      onError: (err: Error) => {
        handleError(err);
      },
    });
  };

  const doRetakeChildDocument = (docId: string) => {
    setShowRetakeChildDocModal(true);
    ToastUtils.thuHoiVanBan(docId);
  };

  const getStatus = (status: number | null) => {
    if (status == 1 || status == null) return "Xử lý chính";
    if (status == 2) return "Phối hợp xử lý";
    return "Nhận để biết";
  };

  const doOpenTransferPopup = (node: any) => {
    setModalNode(node);
  };

  const doOrgTransferPopup = (node: any) => {
    setModalNode(node);
  };

  const onItemSelect = async (item: TagItem) => {
    const tag = { objId: documentId, tagId: item.id, type: "VAN_BAN_DEN" };
    const success = await LabelService.assignTag(tag);
    if (success) {
      ToastUtils.ganNhanThanhCong();
      const updated = await LabelService.listObjectTag(
        documentId!,
        "VAN_BAN_DEN"
      );
      setSelectedItems(updated);
    }
  };

  const onItemDeSelect = async (item: TagItem) => {
    const success = await LabelService.removeObject(
      item.id,
      documentId!,
      "VAN_BAN_DEN"
    );
    if (success) {
      ToastUtils.huyGanNhanThanhCong();
      const updated = await LabelService.listObjectTag(
        documentId!,
        "VAN_BAN_DEN"
      );
      setSelectedItems(updated);
    }
  };

  const doOpenDocumentList = (item: any) => {
    setShowDocListModal(true);
  };

  const doOpenSelectHSTL = () => {
    setShowSelectHstlModal(true);
  };

  const viewFile = (
    file: Attachment,
    isClick: boolean = true,
    isOpentab: boolean = true
  ) => {
    if (!isOpentab && !encryptShowing) {
      setSelectedFile(file);
      return;
    } else if (encryptShowing) {
      // bật loading
      setIsShowLoadingEncrypt(true);
      clearPdf();
      DecryptionService.updateProgress({
        totalFiles: 0,
        currentFile: 0,
        currentProgress: 0,
        fileName: "",
        namedraftFiles: "",
        expectedChunks: 0,
        receivedChunks: 0,
        fileSize: 0,
        error: false,
        isDownLoad: true,
      });

      // gọi backend hoặc service để chuẩn bị decrypt
      viewFileCheck(
        file,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT,
        documentId,
        (file) => {
          setIsCanHandleDoc(true);
          if (file.encrypt) setIsShowLoadingEncrypt(false);
        },
        (file: any) => {
          setIsCanHandleDoc(false);
          if (file.encrypt) setIsShowLoadingEncrypt(false);
        }
      );
    } else if (isClick) {
      uploadFileService.viewFile(
        file,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
      );
    }

    // lắng nghe kết quả decrypt (nếu encrypt)
    if (encryptShowing) {
      decryptResult$.subscribe((decryptedBlob: Blob) => {
        setPdf(decryptedBlob);
        setSelectedFile(file);
        setIsShowLoadingEncrypt(false);
      });
    }
  };

  const downloadFile = async (file: Attachment): Promise<void> => {
    setNameFileDownload(file.name);
    setIsdownloadFile(true);

    try {
      if (file.encrypt) {
        const userInfo = JSON.parse(getUserInfo()!);
        const positionName = userInfo.positionModel?.name?.toLowerCase() ?? "";

        if (positionName === "văn thư ban") {
          const res = await UserService.findByUserId(file.createBy as string);
          if (res.cert) {
            await uploadFileService.downloadFile(
              file.name,
              Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT,
              file.encrypt,
              null,
              res.cert
            );
            console.log("Tải thành công!");
            setIsCanHandleDoc(true);
          }
        } else {
          await uploadFileService.downloadFile(
            file.name,
            Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT,
            file.encrypt,
            null
          );
          console.log("Tải thành công!");
          setIsCanHandleDoc(true);
        }
      } else {
        await uploadFileService.downloadFile(
          file.name,
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT,
          file.encrypt
        );
      }
    } catch (error) {
      console.error("Lỗi khi tải file:", error);
      setIsCanHandleDoc(false);
    } finally {
      setIsdownloadFile(false);
    }
  };

  const doOpenShare = (file: Attachment) => {
    setShowSharedUserModal(true);
  };

  // Derived query params and simple UI flags
  const currentTabParams = queryParams.get("tab");
  const notificationId = queryParams.get("notId");
  const iconTypeParam = queryParams.get("iconType");

  useEffect(() => {
    setShowReadButton(
      Number(iconTypeParam) === Constant.DOCUMENT_OUT_MENU.TO_KNOW &&
        currentTabParams === "toKnow_waitHandleTab"
    );
  }, [iconTypeParam, currentTabParams]);

  // Role-based UI setup
  useEffect(() => {
    setIsVanthuDv(positionNameUser.toLowerCase().includes("văn thư"));
    setShowBtnNewDraft(Constant.BTN_NEW_DRAFT_FROM_DOC_IN_DETAIL_H05);
  }, [positionNameUser]);

  useEffect(() => {
    if (isVanthuDv) {
      setCollapseState((prev) => ({ ...prev, docInfo: true }));
    }
  }, [isVanthuDv]);
  // Queries
  const { data: docResponse, isLoading: isLoadingDetail } =
    useGetDocumentOutDetailLegacy(Number(documentId), {
      notId: notificationId,
      tab: currentTabParams || null,
    });

  const { data: filesResponse, isLoading: isLoadingTracking } =
    useGetReceiveAndSend(Number(documentId));
  const { data: handleTypeResponse, isLoading: isLoadingHandleType } =
    useGetHandleType(Number(documentId), currentTabParams || null);

  // Sync detail data

  const processData = useMemo<ProcessRow[]>(() => {
    return flattenProcess(filesResponse || [], 0, "0");
  }, [filesResponse, expandedSet]);

  useEffect(() => {
    if (!docResponse) return;
    setDocumentDetail(docResponse?.data);
    setIsCanFinishReceive(
      docResponse?.data?.canFinish && Constant.ORG_MULTI_TRANSFER_BCY
    );
    setViewContent(docResponse?.data?.document?.status != "RETAKE_DOC");
  }, [docResponse]);

  // Sync handle type state and compute next nodes

  useEffect(() => {
    if (!handleTypeResponse) return;

    setDocCurrentNode(handleTypeResponse);
    setNodeHandleByUser(handleTypeResponse.node);
    setProcessStep(handleTypeResponse.step);

    // Update createTaskButton based on user authorities
    const hasLeadershipAuthority =
      userInfo?.authoritys.some(
        (x: { authority: string; active: boolean }) =>
          (x.authority === "LEADERSHIP" || x.authority === "LEADERSHIP_UNIT") &&
          x.active
      ) ?? false;

    const newCreateTaskButton =
      Constant.CREATE_TASK_AT_DOC_DETAIL_H05 && hasLeadershipAuthority;

    setButtonStatus((prev) => ({
      ...prev,
      createTaskButton: newCreateTaskButton,
      canAsk: handleTypeResponse.canAsk,
      canDone: handleTypeResponse.canDone,
      canReply: handleTypeResponse.canReply,
      canReview: handleTypeResponse.canReview,
      canRequestReview: handleTypeResponse.canRequestReview,
      canReturn: handleTypeResponse.canReturn,
      canTransfer: handleTypeResponse.canTransfer,
      canRetake: handleTypeResponse.canRetake,
      canRetakeDone: handleTypeResponse.canRetakeDone,
      canSwitchOrAdd: handleTypeResponse.canSwitchOrAdd,
      canOrgTransfer: handleTypeResponse.canOrgTransfer,
      canFinish: handleTypeResponse.canFinish,
      canRead: handleTypeResponse.canRead,
      canMoreTime: handleTypeResponse.canMoreTime,
    }));

    setIsShowRejectChildDoc(handleTypeResponse.canOrgTransfer);
    setIsSwitchDone(handleTypeResponse.status == "DA_XU_LY_SWITCH");
  }, [handleTypeResponse, userInfo?.authoritys, documentId]);

  // Fetch BPMN nodes via hooks based on handle type
  const { data: startNodes } = useGetStartNode(
    Constant.THREAD_TYPE.INCOMING,
    handleTypeResponse?.mergedLines,
    !!handleTypeResponse &&
      (!handleTypeResponse.node || handleTypeResponse.node === 0)
  );
  const { data: nextNodes } = useGetNextNodes(
    handleTypeResponse?.node as any,
    !!handleTypeResponse && !!handleTypeResponse.node
  );

  useEffect(() => {
    if (
      startNodes &&
      (!handleTypeResponse?.node || handleTypeResponse?.node === 0)
    ) {
      setListNextNode(
        startNodes.filter((x: any) => !x.allowMultiple && !x.lastNode)
      );
      setListNextNodeOrg(startNodes.filter((x: any) => x.allowMultiple));
    }
  }, [startNodes, handleTypeResponse?.node]);

  useEffect(() => {
    if (nextNodes && handleTypeResponse?.node) {
      setListNextNode(
        nextNodes.filter((x: any) => !x.allowMultiple && !x.lastNode)
      );
      setListNextNodeOrg(nextNodes.filter((x: any) => x.allowMultiple));
      setIsShowNhatTri(
        userInfo?.roles.some(
          (x: any) =>
            x.name === "Trưởng đơn vị" ||
            x.name === "Phó đơn vị" ||
            x.name === "Văn thư"
        ) ?? false
      );
      setTextShowNhatTri(
        nameText.toLowerCase() === "đinh phượng trung"
          ? "Chuyển Trưởng ban"
          : "Nhất trí"
      );
      setIsShowNextVanThuPhong(nameText.toLowerCase() === "đinh phượng trung");
    }
  }, [nextNodes, handleTypeResponse?.node]);
  const onSignFileEncrypt = async (
    fileName: string,
    encrypt: boolean,
    fileId: string
  ) => {
    try {
      await uploadFileService.uploadFileEncryptToSign(
        fileName,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT,
        true,
        documentDetail.id,
        null,
        fileId,
        "VAN_BAN_DEN"
      );
      setIsCanHandleDoc(true);
    } catch (error) {
      setIsCanHandleDoc(false);
      console.error("Lỗi khi tải file:", error);
    }
  };

  const onAddDocumentSuccess = async () => {
    await queryClient.invalidateQueries({
      queryKey: [queryKeys.documentOut.detail],
    });
  };

  const refreshDocumentDetail = async () => {
    // Refetch tất cả các query liên quan để cập nhật đầy đủ UI và button status
    await Promise.all([
      // Detail data
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, Number(documentId)],
      }),
      // Handle type - để cập nhật button status
      queryClient.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          "handle-type",
          Number(documentId),
        ],
      }),
      // Receive and send - để cập nhật process table
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentOut.tracking, Number(documentId)],
      }),
      // Check type handle - để cập nhật comment form visibility
      queryClient.invalidateQueries({
        queryKey: [queryKeys.document.checkTypeHandleByDoc, Number(documentId)],
      }),
    ]);
  };
  // Tags / labels
  const { data: tags } = useListTagUnpageQuery();

  // Constants
  const MAX_LABEL_LENGTH = 50;
  useEffect(() => {
    if (tags) setDropdownList(tags);
  }, [tags]);
  const { data: selectedTags } = useListObjectTagQuery(
    documentId as unknown as string,
    "VAN_BAN_DEN"
  );
  useEffect(() => {
    if (selectedTags) setSelectedItems(selectedTags as TagItem[]);
  }, [selectedTags]);

  // HSTL
  const { data: hstl } = useGetHstlContainDocId(
    documentId as unknown as string,
    "VAN_BAN_DEN"
  );
  useEffect(() => {
    if (hstl) setHstlList(hstl as unknown[]);
  }, [hstl]);

  // Process list for comment form visibility
  const { data: processList } = useCheckTypeHandleByDoc(Number(documentId));
  useEffect(() => {
    if (processList) {
      setShowCommentForm(
        processList.objList?.some(
          (item: { handleType: string }) =>
            item.handleType === Constant.HANDLE_TYPE.MAIN ||
            item.handleType === Constant.HANDLE_TYPE.SUPPORT
        ) || false
      );
    }
  }, [processList]);

  const isLoadingAny = isLoadingDetail;

  if (isLoadingAny) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Spinner variant="ring" size={48} className="text-blue-600" />
          <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Prepare data for tables
  const parentData = documentDetail.parentDoc
    ? [
        {
          stt: 1,
          preview: documentDetail.parentDoc.preview,
          orgReceive: documentDetail.parentDoc.orgReceive,
          statusName: documentDetail.parentDoc.statusName,
        },
      ]
    : [];

  const childrenData =
    documentDetail.listChildrenDoc?.map((doc, i) => ({
      stt: i + 1,
      preview: doc.preview,
      orgReceive: doc.orgReceive,
      typeOrg: doc.typeOrg,
      statusName: doc.statusName,
      id: doc.id,
    })) || [];

  const responseData =
    documentDetail.listResponseDoc?.map((doc, i) => ({
      stt: i + 1,
      id: doc.id,
      preview: doc.preview,
      statusName: doc.statusName,
    })) || [];

  const taskData =
    documentDetail.listTask?.map((task, i) => ({
      stt: i + 1,
      id: task.id,
      taskName: task.taskName,
      userAssignName: task.userAssignName,
    })) || [];

  const handleMultiSelectChange = (items: TagItem[]) => {
    if (items.length > selectedItems.length) {
      const newItem = items.find(
        (item) => !selectedItems.some((s) => s.id === item.id)
      );
      if (newItem) onItemSelect(newItem);
    } else {
      const removedItem = selectedItems.find(
        (item) => !items.some((i) => i.id === item.id)
      );
      if (removedItem) onItemDeSelect(removedItem);
    }
  };

  const getBreadcrumbConfig = () => {
    // 1) Retake
    if (pathname?.includes("/retake/out/detail")) {
      return {
        items: [{ href: "/retake/out", label: "Thu hồi văn bản đến" }],
        currentPage: "Chi tiết văn bản",
      };
    }

    if (pathname?.includes("/retake/in/detail")) {
      return {
        items: [{ href: "/retake/in", label: "Thu hồi văn bản đi" }],
        currentPage: "Chi tiết văn bản",
      };
    }

    // ===============================
    // 2) DOCUMENT-OUT (Văn bản đến)
    // ===============================

    const docOutMap: Record<string, string> = {
      list: "Danh sách văn bản đến",
      main: "Danh sách văn bản xử lý chính",
      combine: "Danh sách văn bản phối hợp",
      know: "Danh sách văn bản nhận để biết",
      done: "Danh sách văn bản đã xử lý",
      search: "Tra cứu văn bản đến",
    };

    const matched = Object.keys(docOutMap).find((key) =>
      pathname?.includes(`/document-out/${key}`)
    );

    // === CASE: Chi tiết văn bản đến ===
    if (pathname?.includes("/document-out/detail")) {
      const match = matched === "done" ? "opinion" : matched;
      return {
        items: [
          { label: "Văn bản đến" }, // không link
          matched
            ? { href: `/document-out/${match}`, label: docOutMap[matched] }
            : { href: "/document-out/list", label: "Danh sách văn bản đến" },
          { label: "Chi tiết văn bản đến" },
        ],
      };
    }

    // === CASE: Danh sách văn bản ===
    if (matched) {
      const match = matched === "done" ? "opinion" : matched;
      return {
        items: [
          { label: "Văn bản đến" },
          {
            label: docOutMap[matched],
            href: `/document-out/${match}`,
          },
        ], // không link
        currentPage: "Chi tiết văn bản đến",
      };
    }

    return null;
  };

  const breadcrumbConfig = getBreadcrumbConfig();

  return (
    <div className="mx-auto p-4 max-w-full overflow-x-hidden">
      <BreadcrumbNavigation
        items={breadcrumbConfig?.items ?? []}
        currentPage={breadcrumbConfig?.currentPage || ""}
        showHome={false}
      />
      {/* Action Buttons */}
      <div className="flex justify-start">
        <ActionButtons
          isCanHandleDoc={isCanHandleDoc}
          isTruongBan={isTruongBan()}
          encryptShowing={encryptShowing}
          buttonStatus={buttonStatus}
          showBtnNewDraft={!!showBtnNewDraft}
          isSwitchDone={!!isSwitchDone}
          isCanFinishReceive={!!isCanFinishReceive}
          listNextNode={listNextNode}
          listNextNodeOrg={listNextNodeOrg}
          selectedDocId={parseInt(documentId)}
          textShowNhatTri={textShowNhatTri}
          isShowNhatTri={isShowNhatTri}
          isShowNextVanThuPhong={isShowNextVanThuPhong}
          textShowChuyenVanThu={textShowChuyenVanThu}
          docCurrentNode={docCurrentNode}
          canDoneInternal={canDoneInternal}
          onBack={() => router.back()}
          onShowTracking={() => setShowTrackingModal(true)}
          onOpenReject={() => setShowRejectModal(true)}
          onOpenRetakeByStep={() => setShowRetakeByStepModal(true)}
          onOpenStepRetake={() => setShowStepRetakeModal(true)}
          onOpenEvaluate={(isEvaluate) =>
            setShowEvaluateModal({ open: true, isEvaluate })
          }
          onOpenAskIdea={() => setShowAskIdeaModal(true)}
          onOpenSwitchUser={doOpenSwitchUserPopup}
          onOpenRetakeDone={() => setShowRetakeDoneModal(true)}
          onOpenProcessDone={(isFinishReceive) =>
            setShowProcessDoneModal({ open: true, isFinishReceive })
          }
          onNewDraft={newDraftDocument}
          onCreateTask={doCreateTask}
          onGuiVanThuPhongHC={guiVanThuPhongHC}
          onNhatTri={doNhatTri}
          onOpenDeadline={doOpenDeadlinePopup}
          onGiaoViec={() => setOpenWorkAssignDialog(true)}
        />
      </div>
      <div className="flex gap-4 w-full max-w-full">
        <div className="w-full flex gap-6 flex-col min-w-0">
          {/* Thông tin chung - Collapsible */}
          <GeneralInfoCard
            detail={documentDetail}
            collapse={collapseState.docInfo}
            onToggle={docInfoUpdateStatus}
            isVanthuDv={isVanthuDv}
            hstlList={hstlList}
            onOpenDocumentList={doOpenDocumentList}
            onOpenSelectHSTL={doOpenSelectHSTL}
            dropdownList={dropdownList}
            selectedItems={selectedItems}
            onChangeTags={handleMultiSelectChange}
            dateLeftText={getDateLeft()}
          />

          {/* Attachments List - First 3 */}
          <AttachmentsCard
            files={documentDetail.document.attachments || []}
            selectedFile={selectedFile}
            encryptShowing={encryptShowing}
            isDownloading={isdownloadFile}
            downloadName={nameFileDownload}
            viewContent={viewContent}
            onView={viewFile}
            onDownload={downloadFile}
            onShare={() => setShowSharedUserModal(true)}
            onVerifyPDF={(fileName) => uploadFileService.verifierPDF(fileName)}
            onSignEncrypt={onSignFileEncrypt}
          />
          <div className="md:col-span-8 space-y-6">
            {/* Văn bản liên kết trên */}
            {documentDetail.parentDoc && (
              <DataTableCard
                title="Văn bản liên kết trên"
                columns={parentColumns}
                data={parentData}
                sortable={true}
                showPagination={false}
              />
            )}

            {/* Văn bản liên kết dưới */}
            {isShowRejectChildDoc &&
              documentDetail.listChildrenDoc &&
              documentDetail.listChildrenDoc.length > 0 && (
                <DataTableCard
                  title="Văn bản liên kết dưới"
                  columns={childrenColumns}
                  data={childrenData}
                  sortable={true}
                  showPagination={false}
                />
              )}

            {/* Danh sách văn bản đi phúc đáp */}
            {documentDetail.listResponseDoc &&
              documentDetail.listResponseDoc.length > 0 && (
                <DataTableCard
                  title="Danh sách văn bản đi phúc đáp"
                  columns={responseColumns}
                  data={responseData}
                  sortable={true}
                  showPagination={false}
                  onRowClick={(record: { id: string | number }) => {
                    router.push(
                      `/document-in/draft-list/draft-detail/${record.id}`
                    );
                  }}
                />
              )}

            {/* Danh sách công việc liên quan */}
            {documentDetail.listTask && documentDetail.listTask.length > 0 && (
              <DataTableCard
                title="Danh sách công việc liên quan"
                columns={taskColumns}
                data={taskData}
                sortable={true}
                showPagination={false}
                onRowClick={(record: { id: string | number }) => {
                  router.push(`/task/assign/detail/${record.id}`);
                }}
              />
            )}

            {/* Thông tin gửi nhận - Process Table */}
            <ProcessTableCard
              collapse={collapseState.docProcess}
              onToggle={docProcessUpdateStatus}
              columns={processColumns}
              data={processData}
            />
          </div>
        </div>
        {/* Comment Section */}
        {
          <div className="bg-white border border-gray-200 p-4 space-y-6 min-h-screen min-w-[350px] w-[350px] rounded-lg">
            <DocumentOutCommentsSection
              ref={commentSectionRef}
              id={Number(documentId!)}
              allowAttachments
              allowedComment
              setNewComment={setNewComment}
              newComment={newComment}
            />
          </div>
        }
      </div>
      <DocumentReject
        docId={documentId!}
        onClose={() => {
          setShowRejectModal(false);
          router.back();
        }}
        onSuccess={refreshDocumentDetail}
        showRejectModal={showRejectModal}
        setShowRejectModal={setShowRejectModal}
      />
      <DocumentOutTracking
        docId={documentId!}
        onClose={() => setShowTrackingModal(false)}
        showTrackingModal={showTrackingModal}
        setShowTrackingModal={setShowTrackingModal}
      />
      <SelectHstl
        showSelectHstlModal={showSelectHstlModal}
        setShowSelectHstlModal={setShowSelectHstlModal}
        onClose={() => setShowSelectHstlModal(false)}
        docId={documentId}
        docType={Constant.HSTL_DOCUMENT_TYPE.VAN_BAN_DEN}
        onAddDocumentSuccess={onAddDocumentSuccess}
      />
      <DocumentProcessDone
        docId={documentId!}
        isFinishReceive={
          showProcessDoneModal.isFinishReceive
            ? canDoneInternal
              ? false
              : showProcessDoneModal.isFinishReceive
            : showProcessDoneModal.isFinishReceive
        }
        isDelegate={isDelegate === "true"}
        onClose={() =>
          setShowProcessDoneModal({ open: false, isFinishReceive: false })
        }
        onSuccess={() => {
          router.back();
        }}
        showProcessDoneModal={showProcessDoneModal.open}
        setShowProcessDoneModal={(open: boolean) =>
          setShowProcessDoneModal({ open, isFinishReceive: false })
        }
      />
      <DocumentOutComment
        docId={documentId!}
        onClose={() => setShowAskIdeaModal(false)}
        onSuccess={() => {
          router.back();
        }}
        isFinishReceive={false}
        showAskIdeaModal={showAskIdeaModal}
        setShowAskIdeaModal={setShowAskIdeaModal}
      />
      <DocumentOutEvaluate
        docId={documentId!}
        isEvaluate={showEvaluateModal.isEvaluate}
        onClose={() => setShowEvaluateModal({ open: false, isEvaluate: false })}
        onSuccess={() => {
          router.back();
        }}
        showEvaluateModal={showEvaluateModal.open}
        setShowEvaluateModal={(open: boolean) =>
          setShowEvaluateModal({ open, isEvaluate: false })
        }
      />
      <DocumentOutRetakeByStep
        docId={documentId!}
        isDelegate={isDelegate === "true"}
        onClose={() =>
          showStepRetakeModal
            ? setShowStepRetakeModal(false)
            : setShowRetakeByStepModal(false)
        }
        onSuccess={() => {
          router.back();
        }}
        nodeHandleByUser={nodeHandleByUser}
        type={showStepRetakeModal ? "step-retake" : "retake"}
        title={showStepRetakeModal ? "Thu hồi chuyển xử lý" : "Thu hồi văn bản"}
        showRetakeByStepModal={showRetakeByStepModal || showStepRetakeModal}
        setShowRetakeByStepModal={
          showStepRetakeModal
            ? setShowStepRetakeModal
            : setShowRetakeByStepModal
        }
      />
      <SwitchAndAddUser
        isOpen={showSwitchUserModal}
        onOpenChange={setShowSwitchUserModal}
        onClose={() => setShowSwitchUserModal(false)}
        documentId={documentId!}
        step={docCurrentNode?.step}
        currentSelectedNodeID={docCurrentNode?.node}
        isSwitchMainUser={
          String(docCurrentNode?.type) === String(Constant.HANDLE_TYPE.MAIN)
        }
        isOnlyKnow={
          String(docCurrentNode?.type) === String(Constant.HANDLE_TYPE.SHOW)
        }
        isCombine={true}
        onSuccess={async () => {
          setShowSwitchUserModal(false);
          await refreshDocumentDetail();
          router.back();
        }}
      />
      <RetakeDoneDocument
        docId={documentId!}
        onClose={() => setShowRetakeDoneModal(false)}
        onSuccess={() => {
          router.back();
        }}
        showRetakeDoneModal={showRetakeDoneModal}
        setShowRetakeDoneModal={setShowRetakeDoneModal}
      />
      <DocumentOutDeadline
        docId={documentId!}
        type="THREADS"
        currentDeadline={
          documentDetail?.document?.deadline
            ? format(new Date(documentDetail?.document?.deadline), "dd/MM/yyyy")
            : null
        }
        onClose={() => setShowDeadlineModal(false)}
        onSuccess={() => {
          router.back();
        }}
        showDeadlineModal={showDeadlineModal}
        setShowDeadlineModal={setShowDeadlineModal}
      />
      <Dialog open={showDocListModal} onOpenChange={setShowDocListModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Danh sách văn bản</DialogTitle>
          </DialogHeader>
          <DocList
            onClose={() => {
              setShowDocListModal(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <RetakeChildDocument
        docId={documentId!}
        onClose={() => {
          setShowRetakeChildDocModal(false);
          router.back();
        }}
        showRetakeChildDocModal={showRetakeChildDocModal}
        setShowRetakeChildDocModal={setShowRetakeChildDocModal}
        isRetakeDelegateDoc={isDelegate === "true"}
      />
      <Dialog open={showSharedUserModal} onOpenChange={setShowSharedUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ người dùng</DialogTitle>
          </DialogHeader>
          <SharedUser
            fileNames={selectedFile?.name || ""}
            docId={documentId!}
            type={Constant.HSTL_DOCUMENT_TYPE.VAN_BAN_DEN}
            onClose={() => setShowSharedUserModal(false)}
          />
        </DialogContent>
      </Dialog>
      {openWorkAssignDialog && (
        <WorkAssignDialog
          open={openWorkAssignDialog}
          onClose={() => {
            setOpenWorkAssignDialog(false);
          }}
          //isAddChildTask={true}
          documentDetail={docResponse.data.document}
          documentType={Constant.HSTL_DOCUMENT_TYPE.VAN_BAN_DEN}
        />
      )}{" "}
      {process.isDownLoad ? (
        <LoadingOverlay
          isOpen={isShowLoadingEncrypt}
          isLoading={process.isDownLoad}
          text={"Đang tải tệp..."}
        />
      ) : (
        <DecryptOverlay
          isOpen={isShowLoadingEncrypt}
          progress={process}
          onForceDisconnect={forceDisconnect}
        />
      )}
    </div>
  );
};

export default DocumentOutDetail;
