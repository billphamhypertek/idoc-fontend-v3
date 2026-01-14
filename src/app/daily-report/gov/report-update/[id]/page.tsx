"use client";
import DailyReportInsert from "@/components/daily-report/DailyReportInsert";
import { REPORT_TYPE } from "@/definitions/types/report.type";
import { useParams } from "next/navigation";

export default function ReportUpdateGOVPage() {
  const { id } = useParams() as { id: string };
  return <DailyReportInsert reportType={REPORT_TYPE.REPORT_GOV} id={id} />;
}
