"use client";

import { TYPE_WORKFLOW } from "@/definitions/enums/common.enum";
import RequestDetailPage from "@/components/dynamic-form/Detail";
import { useParams } from "next/navigation";

export default function DynamicRequestDetailPage() {
  const params = useParams();
  const typeId = params?.typeId as string;

  return <RequestDetailPage type={typeId} pageType="main" />;
}
