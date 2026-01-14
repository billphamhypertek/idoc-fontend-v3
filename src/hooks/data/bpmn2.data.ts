import { useQuery } from "@tanstack/react-query";
import { queryKeys, UserInfo } from "@/definitions";
import { Bpmn2Service } from "@/services/bpmn2.service";
import { THREAD_TYPE } from "@/definitions/constants/common.constant";
import { BpmnResponse } from "@/definitions/types/bpmn.type";

export const useSearchFlowNode = (
  params: Record<string, any>,
  newNode: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.bpmn.nextNodes, params],
    queryFn: () => {
      if (newNode) {
        return Bpmn2Service.getStartNode(THREAD_TYPE.OUTCOMING, params.single);
      } else {
        return Bpmn2Service.getNextNodes(params.nodeId);
      }
    },
    enabled: !!params.nodeId || newNode,
  });
};
export const useGetNextNodes = (currentNode: number, enabled: boolean) => {
  return useQuery<BpmnResponse[]>({
    queryKey: [queryKeys.bpmn.nextNodes, currentNode],
    queryFn: () => Bpmn2Service.getNextNodes(currentNode),
    enabled: !!currentNode && enabled,
  });
};
export const useGetNextConsultNodes = (userInfo?: UserInfo | null) => {
  const posName = (userInfo?.positionModel?.name || "").toLowerCase();
  const parentId = userInfo?.orgModel?.parentId ?? null;
  const selfOrgId = userInfo?.orgModel?.id;

  return useQuery<BpmnResponse[]>({
    queryKey: [queryKeys.bpmn.nextConsultNodes],
    queryFn: () => Bpmn2Service.getNextConsultNodes(),
    enabled: !!userInfo,
    select: (data: BpmnResponse[]) => {
      if (parentId && parentId !== 2) {
        return data.filter((n) => !n.lastNode && n.orgId === parentId);
      } else if (!parentId && posName === "văn thư ban") {
        const picked = data.filter(
          (n) =>
            !n.lastNode && (n.name || "").toLowerCase() === "văn thư đơn vị"
        );
        return picked.map((n) => ({ ...n, name: `${n.name} ${n.orgName}` }));
      } else if (parentId && parentId === 2) {
        return data.filter((n) => !n.lastNode && n.orgId === selfOrgId);
      } else {
        const dataCopy = data.filter((n) => !n.lastNode);
        return dataCopy.length > 0 ? [dataCopy[0]] : [];
      }
    },
  });
};

export const useGetStartNode = (
  threadType: string,
  mergedLines?: any,
  enabled: boolean = true
) => {
  return useQuery<BpmnResponse[]>({
    queryKey: [queryKeys.bpmn.startNodes, threadType, mergedLines],
    queryFn: () => Bpmn2Service.getStartNode(threadType, mergedLines),
    enabled,
  });
};
