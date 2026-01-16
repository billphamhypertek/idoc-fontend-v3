"use client";

import { useState } from "react";
import { PageLayout } from "@/components/documents/page-layout";
import { cn } from "@/lib/utils";
import { reportsPar, ReportItem } from "@/data/reports-data";
import { PlusIcon, FileTextIcon } from "@radix-ui/react-icons";
import { CheckCircle2, Clock, XCircle, FileEdit, Printer } from "lucide-react";
import { DocumentFilters } from "@/components/documents/document-filters";

function StatusBadge({ status }: { status: ReportItem["status"] }) {
    const config = {
        draft: { label: "Nháp", class: "bg-gray-100 text-gray-700", icon: FileEdit },
        submitted: { label: "Đã nộp", class: "bg-blue-100 text-blue-700", icon: Clock },
        approved: { label: "Đã duyệt", class: "bg-green-100 text-green-700", icon: CheckCircle2 },
        rejected: { label: "Từ chối", class: "bg-red-100 text-red-700", icon: XCircle },
    };
    const { label, class: className, icon: Icon } = config[status];
    return (
        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", className)}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}

export default function ReportsParPage() {
    const [data] = useState<ReportItem[]>(reportsPar);

    return (
        <PageLayout activeModule="reports" activeSubMenu="par">
            <div className="space-y-4">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold text-[hsl(var(--v3-card-foreground))]">Báo cáo Đảng</h1>
                    <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[hsl(var(--v3-primary))] text-white text-sm font-medium hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-sm">
                        <PlusIcon className="w-4 h-4" />
                        Tạo báo cáo
                    </button>
                </div>

                {/* Filters */}
                <div className="flex items-center justify-between">
                    <DocumentFilters
                        searchPlaceholder="Tìm kiếm báo cáo..."
                        showDateFilter={true}
                        showAdvancedSearch={false}
                    />

                    <button className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[hsl(var(--v3-border))] text-[hsl(var(--v3-muted-foreground))] text-sm font-medium hover:bg-[hsl(var(--v3-muted))] transition-colors">
                        <Printer className="w-4 h-4" />
                        In danh sách
                    </button>
                </div>

                {/* Reports Table */}
                <div className="v3-card overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white border-b border-[hsl(var(--v3-border))]">
                                <th className="w-14 px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                    STT
                                </th>
                                <th className="min-w-[250px] px-4 py-3.5 text-left text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                    Tiêu đề
                                </th>
                                <th className="min-w-[150px] px-4 py-3.5 text-left text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                    Kỳ báo cáo
                                </th>
                                <th className="min-w-[150px] px-4 py-3.5 text-left text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                    Đơn vị
                                </th>
                                <th className="min-w-[120px] px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                    Ngày nộp
                                </th>
                                <th className="min-w-[100px] px-4 py-3.5 text-center text-xs font-bold text-[hsl(var(--v3-card-foreground))] uppercase tracking-wider">
                                    Trạng thái
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[hsl(var(--v3-border))]">
                            {data.map((report, index) => (
                                <tr key={report.id} className="hover:bg-[hsl(var(--v3-muted))]/50 cursor-pointer transition-colors">
                                    <td className="px-4 py-3 text-center text-sm text-[hsl(var(--v3-muted-foreground))]">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <FileTextIcon className="w-4 h-4 text-[hsl(var(--v3-primary))]" />
                                            <span className="text-sm font-medium text-[hsl(var(--v3-card-foreground))]">
                                                {report.title}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[hsl(var(--v3-muted-foreground))]">
                                        {report.period}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-[hsl(var(--v3-muted-foreground))]">
                                        {report.department}
                                    </td>
                                    <td className="px-4 py-3 text-center text-sm text-[hsl(var(--v3-muted-foreground))]">
                                        {report.submittedDate}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <StatusBadge status={report.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageLayout>
    );
}
