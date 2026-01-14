import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import { Bpmn2Service } from "@/services/bpmn2.service";

export const useGetStartNodes = (
  type: string,
  single: boolean = false,
  enabled: boolean = true
) =>
  useQuery<any[]>({
    queryKey: [queryKeys.bpmn.startNodes, type, single],
    queryFn: () => Bpmn2Service.getStartNode(type, single),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

export const useGetNextNodes = (currentNode?: number | null) =>
  useQuery<any[]>({
    queryKey: [queryKeys.bpmn.nextNodes, currentNode],
    queryFn: () => Bpmn2Service.getNextNodes(currentNode!),
    enabled: !!currentNode,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
