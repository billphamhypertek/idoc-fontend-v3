"use client";

import { TransferDocumentOutDialog } from "@/components/dialogs/TransferDocumentOutDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Constant } from "@/definitions/constants/constant";
import { BpmnResponse } from "@/definitions/types/bpmn.type";
import { TreeNode } from "@/definitions/types/document-out.type";
import {
  useOrgTransferAdvancedMutation,
  useTransferHandleListMutation,
} from "@/hooks/data/document-out.actions";
import { buildFilteredOrganizationTree } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { ChevronDown, Landmark, Redo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TransferHandlerProps {
  selectedItemId: number | null; // ID của item được chọn (chỉ hỗ trợ 1 item)
  disabled?: boolean; // Disable button nếu cần
  onSuccess?: () => void; // Callback sau khi transfer thành công (ví dụ: refetch, clear selection)
  className?: string; // Class tùy chỉnh cho button
  listNextNode: BpmnResponse[];
  unit?: boolean;
  singleRole?: BpmnResponse | null;
  onBeforeOpen?: () => boolean | Promise<boolean>; // Validate trước khi mở chuyển xử lý
}

export function TransferDocumentOut({
  selectedItemId,
  disabled = false,
  onSuccess,
  className = "",
  listNextNode,
  unit = false,
  singleRole = null,
  onBeforeOpen,
}: TransferHandlerProps) {
  const router = useRouter();
  const [isTransferDropdownOpen, setIsTransferDropdownOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<BpmnResponse | null>(null);
  const [orgData, setOrgData] = useState<TreeNode[]>([]);
  const [listIdDisableByOrgCheck, setListIdDisableByOrgCheck] = useState<
    number[]
  >([]);
  const [listIdDisableByLeaderCheck, setListIdDisableByLeaderCheck] = useState<
    number[]
  >([]);
  const [listByOrgAndTypeIsOne, setListByOrgAndTypeIsOne] = useState<number[]>(
    []
  );
  const [listByOrgAndTypeIsTwo, setListByOrgAndTypeIsTwo] = useState<number[]>(
    []
  );
  const [listByOrgAndTypeIsThree, setListByOrgAndTypeIsThree] = useState<
    number[]
  >([]);
  const [listByLeaderAndTypeIsOne, setListByLeaderAndTypeIsOne] = useState<
    number[]
  >([]);
  const [listByLeaderAndTypeIsTwo, setListByLeaderAndTypeIsTwo] = useState<
    number[]
  >([]);
  const [listByLeaderAndTypeIsThree, setListByLeaderAndTypeIsThree] = useState<
    number[]
  >([]);
  const transferMutation = useTransferHandleListMutation(); // Assume this is for non-multi, add multi if needed
  const orgTransferAdvancedMutation = useOrgTransferAdvancedMutation();

  const handleRoleClick = async (role: BpmnResponse) => {
    // Validate trước khi mở dialog chuyển xử lý
    if (typeof onBeforeOpen === "function") {
      try {
        const ok = await Promise.resolve(onBeforeOpen());
        if (!ok) {
          setIsTransferDropdownOpen(false);
          return;
        }
      } catch {
        setIsTransferDropdownOpen(false);
        return;
      }
    }
    if (!selectedItemId) {
      return;
    }
    setSelectedRole(role);
    setIsTransferDropdownOpen(false);
    try {
      const data = await buildFilteredOrganizationTree(
        role.id,
        selectedItemId,
        Constant.ORG_MULTI_TRANSFER_BCY && role.allowMultiple,
        role.allowMultiple
      );
      setOrgData(data.tree);
      setListIdDisableByOrgCheck(data.listIdDisableByOrgCheck);
      setListIdDisableByLeaderCheck(data.listIdDisableByLeaderCheck);
      setListByOrgAndTypeIsOne(data.listByOrgAndTypeIsOne);
      setListByOrgAndTypeIsTwo(data.listByOrgAndTypeIsTwo);
      setListByOrgAndTypeIsThree(data.listByOrgAndTypeIsThree);
      setListByLeaderAndTypeIsOne(data.listByLeaderAndTypeIsOne);
      setListByLeaderAndTypeIsTwo(data.listByLeaderAndTypeIsTwo);
      setListByLeaderAndTypeIsThree(data.listByLeaderAndTypeIsThree);
      setIsTransferDialogOpen(true);
    } catch (err) {
      console.error("Error fetching data for transfer dialog:", err);
    }
  };

  const handleTransferDialogSubmit = (submitData: {
    comment: string;
    cmtContent: string;
    main: any[]; // Adjust to any[] for multi
    support: number[];
    show: number[];
    orgMain: number[];
    orgSupport: number[];
    orgShow: number[];
    direction: number[];
    deadlineDate: Date | null;
    requestReview: boolean;
    files: File[];
  }) => {
    if (!selectedItemId || !selectedRole) {
      console.error("No item, role, or currentNode selected");
      return;
    }

    const allowMultiple =
      Constant.ORG_MULTI_TRANSFER_BCY && selectedRole.allowMultiple;

    const transferBody = {
      docId: selectedItemId,
      nodeId: selectedRole.id,
      comment: submitData.comment ?? "",
      cmtContent: submitData.cmtContent ?? "-",
      requestReview: submitData.requestReview,
      files: submitData.files,
    };

    // If transfer to unit (organization transfer)
    if (unit) {
      // Angular sends the selected triples directly as listOrg via `main` when allowMultiple (org transfer):
      // each entry is [id, typeOrg(1 main|2 support|3 know), isUser(0 org | 1 user)]
      let listOrgTuples: number[][] = [];
      if (Array.isArray(submitData.main)) {
        listOrgTuples = submitData.main
          .filter((entry): entry is number[] => Array.isArray(entry))
          .map((entry) => [
            Number(entry[0]),
            Number(entry[1]),
            Number(entry[2] ?? 0),
          ]);
      }
      // Fallback: if dialog didn't provide triples (older path), derive from org* arrays as org-only
      if (listOrgTuples.length === 0) {
        const pushOrg = (ids: number[] | undefined, type: 1 | 2 | 3) => {
          (ids || []).forEach((id) =>
            listOrgTuples.push([Number(id), type, 0])
          );
        };
        pushOrg(submitData.orgMain, 1);
        pushOrg(submitData.orgSupport, 2);
        pushOrg(submitData.orgShow, 3);
      }
      const payload = {
        node: selectedRole.id,
        comment: transferBody.comment,
        // service serializes arrays as CSV when array is provided
        listOrg: listOrgTuples,
        deadline: submitData.deadlineDate
          ? new Date(submitData.deadlineDate).toISOString().split("T")[0]
          : undefined,
        files: transferBody.files,
        special: false,
      } as const;

      orgTransferAdvancedMutation.mutate(
        { docIds: [selectedItemId], payload },
        {
          onSuccess: () => {
            ToastUtils.transferSuccess();
            router.refresh();
            setIsTransferDialogOpen(false);
            onSuccess?.();
          },
        }
      );
      return;
    }

    // Otherwise, internal user transfer
    if (allowMultiple) {
      // TODO: Implement multi-user transfer parity if backend endpoint exists
      ToastUtils.chuaHoTroChuyenNhieuNguoi();
      return;
    }

    // Extract main userId (may be string like "123-456" from delegatedId pattern)
    // Keep the array format to match Angular's behavior
    const main =
      submitData.main?.map((entry) => {
        if (typeof entry === "string") {
          return entry; // Could be "userId" or "userId-delegatedId"
        }
        return String(entry || 0);
      }) ?? [];

    transferMutation.mutate(
      {
        docId: transferBody.docId,
        nodeId: transferBody.nodeId,
        main,
        comment: transferBody.comment,
        cmtContent: transferBody.cmtContent,
        requestReview: transferBody.requestReview,
        files: transferBody.files,
        support: submitData.support?.map((v) => String(v)) ?? [],
        show: submitData.show?.map((v) => String(v)) ?? [],
        orgMain: submitData.orgMain ?? [],
        orgSupport: submitData.orgSupport ?? [],
        orgShow: submitData.orgShow ?? [],
        direction: submitData.direction ?? [],
        deadline: submitData.deadlineDate
          ? new Date(submitData.deadlineDate).toISOString().split("T")[0]
          : undefined,
      },
      {
        onSuccess: () => {
          ToastUtils.transferSuccess();
          router.refresh();
          setIsTransferDialogOpen(false);
          onSuccess?.();
        },
      }
    );
  };
  return (
    <>
      <DropdownMenu
        open={isTransferDropdownOpen}
        onOpenChange={setIsTransferDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={`text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className} bg-blue-600 hover:bg-blue-700 hover:text-white`}
          >
            {unit ? (
              <>
                <Landmark className="w-4 h-4 mr-1" />
                <span>Chuyển đơn vị</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                <Redo2 className="w-4 h-4 mr-1" />
                <span>Chuyển xử lý</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="min-w-[360px] max-w-[600px]">
          {singleRole ? (
            <DropdownMenuItem
              className="cursor-pointer whitespace-nowrap"
              onClick={() => handleRoleClick(singleRole)}
            >
              {singleRole.name}
            </DropdownMenuItem>
          ) : (
            listNextNode?.map((role, index) => (
              <DropdownMenuItem
                key={index}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => handleRoleClick(role)}
              >
                {role.name}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <TransferDocumentOutDialog
        isOpen={isTransferDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // ensure fully reset when closing by overlay/ESC
            setIsTransferDialogOpen(false);
          } else {
            setIsTransferDialogOpen(true);
          }
        }}
        onClose={() => setIsTransferDialogOpen(false)}
        onSubmit={handleTransferDialogSubmit}
        selectedRole={selectedRole}
        organizationData={orgData}
        listIdDisableByOrgCheck={listIdDisableByOrgCheck}
        listIdDisableByLeaderCheck={listIdDisableByLeaderCheck}
        listByOrgAndTypeIsOne={listByOrgAndTypeIsOne}
        listByOrgAndTypeIsTwo={listByOrgAndTypeIsTwo}
        listByOrgAndTypeIsThree={listByOrgAndTypeIsThree}
        listByLeaderAndTypeIsOne={listByLeaderAndTypeIsOne}
        listByLeaderAndTypeIsTwo={listByLeaderAndTypeIsTwo}
        listByLeaderAndTypeIsThree={listByLeaderAndTypeIsThree}
      />
    </>
  );
}
