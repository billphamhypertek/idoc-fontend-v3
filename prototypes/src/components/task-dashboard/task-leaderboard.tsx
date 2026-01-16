"use client";

import { PersonIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { TrendingUp, Award } from "lucide-react";

interface LeaderboardPerson {
    rank: number;
    name: string;
    department: string;
    tasksCompleted: number;
    completionRate: number;
    avatar: string;
}

interface TaskLeaderboardProps {
    className?: string;
}

// Mock data for leaderboard
const leaderboardData: LeaderboardPerson[] = [
    { rank: 1, name: "Nguyễn Văn A", department: "TT CNTT", tasksCompleted: 45, completionRate: 92, avatar: "NVA" },
    { rank: 2, name: "Trần Thị B", department: "Văn phòng", tasksCompleted: 38, completionRate: 88, avatar: "TTB" },
    { rank: 3, name: "Lê Văn C", department: "Cục QLNS", tasksCompleted: 32, completionRate: 85, avatar: "LVC" },
    { rank: 4, name: "Phạm Thị D", department: "Vụ Pháp chế", tasksCompleted: 28, completionRate: 78, avatar: "PTD" },
    { rank: 5, name: "Hoàng Văn E", department: "Vụ TCCB", tasksCompleted: 24, completionRate: 72, avatar: "HVE" },
];

const rankColors: Record<number, { bg: string; text: string }> = {
    1: { bg: "bg-yellow-500", text: "text-white" },
    2: { bg: "bg-gray-400", text: "text-white" },
    3: { bg: "bg-amber-600", text: "text-white" },
};

const getProgressColor = (rate: number) => {
    if (rate >= 90) return "bg-green-500";
    if (rate >= 75) return "bg-blue-500";
    if (rate >= 60) return "bg-amber-500";
    return "bg-red-500";
};

export function TaskLeaderboard({ className }: TaskLeaderboardProps) {
    return (
        <div className={cn("v3-card p-6", className)}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-amber-100 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-[hsl(var(--v3-card-foreground))]">
                        Top nhân viên
                    </h3>
                    <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                        Tháng này
                    </p>
                </div>
            </div>

            {/* Leaderboard List */}
            <div className="space-y-3">
                {leaderboardData.map((person) => (
                    <div
                        key={person.rank}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--v3-muted))]/50 hover:bg-[hsl(var(--v3-muted))] transition-colors"
                    >
                        {/* Rank */}
                        <div className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                            rankColors[person.rank]?.bg || "bg-[hsl(var(--v3-muted-foreground))]",
                            rankColors[person.rank]?.text || "text-white"
                        )}>
                            {person.rank}
                        </div>

                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-[hsl(var(--v3-primary))]/10 flex items-center justify-center text-xs font-semibold text-[hsl(var(--v3-primary))]">
                            {person.avatar}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] truncate">
                                {person.name}
                            </p>
                            <p className="text-xs text-[hsl(var(--v3-muted-foreground))] truncate">
                                {person.department}
                            </p>
                        </div>

                        {/* Progress */}
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-[hsl(var(--v3-card-foreground))]">
                                    {person.tasksCompleted}
                                </span>
                                <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                                    việc
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 w-20">
                                <div className="flex-1 h-1.5 bg-[hsl(var(--v3-muted))] rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full rounded-full transition-all", getProgressColor(person.completionRate))}
                                        style={{ width: `${person.completionRate}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-[hsl(var(--v3-muted-foreground))] w-8 text-right">
                                    {person.completionRate}%
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Link */}
            <button className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-[hsl(var(--v3-primary))] hover:bg-[hsl(var(--v3-primary))]/5 rounded-lg transition-colors">
                <span>Xem bảng xếp hạng đầy đủ</span>
                <TrendingUp className="w-4 h-4" />
            </button>
        </div>
    );
}
