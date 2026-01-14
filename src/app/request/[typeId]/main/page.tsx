"use client";
import DynamicMainPage from "@/components/dynamic-form/DynamicMainPage";
import { useParams } from "next/navigation";

export default function DynamicRequestMainPage() {
  const params = useParams();
  const workflowId = params?.typeId as string;

  return <DynamicMainPage type={workflowId} />;
}
