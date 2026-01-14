"use client";
import DynamicRegisterPage from "@/components/dynamic-form/DynamicRegisterPage";
import { useParams } from "next/navigation";

export default function DynamicRequestRegisterPage() {
  const params = useParams();
  const typeId = params?.typeId as string;

  return <DynamicRegisterPage type={typeId} />;
}
