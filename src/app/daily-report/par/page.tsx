"use client";
import DailyReportPage from "@/components/daily-report/DailyReportPage";
import { REPORT_TYPE } from "@/definitions/types/report.type";

export default function DailyReportPAR() {
  return <DailyReportPage reportType={REPORT_TYPE.REPORT_PAR} />;
}
