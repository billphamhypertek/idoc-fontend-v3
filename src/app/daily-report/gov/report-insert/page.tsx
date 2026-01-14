"use client";
import DailyReportInsert from "@/components/daily-report/DailyReportInsert";
import { REPORT_TYPE } from "@/definitions/types/report.type";

export default function ReportInsertGOVPage() {
  return <DailyReportInsert reportType={REPORT_TYPE.REPORT_GOV} />;
}
