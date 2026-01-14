"use client";
import DynamicSearchPage from "@/components/dynamic-form/DynamicSearchPage";
import { useParams } from "next/navigation";

export default function DynamicRequestSearchPage() {
  const params = useParams();
  const workflowId = params?.typeId as string;

  return <DynamicSearchPage type={workflowId} />;
}
