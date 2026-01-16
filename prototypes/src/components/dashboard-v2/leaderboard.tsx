"use client";

import { PersonIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
    className?: string;
}

// Mock data for top performers
const leaderboardData = [
    { rank: 1, name: "Nguyễn Văn A", department: "Văn phòng", tasks: 25, avatar: "NVA" },
    { rank: 2, name: "Trần Thị B", department: "Cục QLNS", tasks: 22, avatar: "TTB" },
    { rank: 3, name: "Lê Văn C", department: "TT CNTT", tasks: 18, avatar: "LVC" },
    { rank: 4, name: "Phạm Thị D", department: "Vụ Pháp chế", tasks: 15, avatar: "PTD" },
    { rank: 5, name: "Hoàng Văn E", department: "Vụ TCCB", tasks: 12, avatar: "HVE" },
];

const rankColors: Record<number, string> = {
    1: "bg-yellow-500",
    2: "bg-gray-400",
    3: "bg-amber-600",
};

export function Leaderboard({ className }: LeaderboardProps) {
    return (
        <div className={cn("v3-card p-6", className)}>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-md bg-[hsl(var(--v3-warning))]/10 flex items-center justify-center">
                    <PersonIcon className="w-5 h-5 text-[hsl(var(--v3-warning))]" />
                </div>
                <h3 className="text-lg font-semibold text-[hsl(var(--v3-card-foreground))]">
                    Nhân viên tiêu biểu
                </h3>
            </div>

            <div className="space-y-3">
                {leaderboardData.map((person) => (
                    <div
                        key={person.rank}
                        className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--v3-muted))]/50 hover:bg-[hsl(var(--v3-muted))] transition-colors"
                    >
                        <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white",
                            rankColors[person.rank] || "bg-[hsl(var(--v3-muted-foreground))]"
                        )}>
                            {person.rank}
                        </div>

                        <div className="w-9 h-9 rounded-full bg-[hsl(var(--v3-primary))]/10 flex items-center justify-center text-xs font-semibold text-[hsl(var(--v3-primary))]">
                            {person.avatar}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[hsl(var(--v3-card-foreground))] truncate">
                                {person.name}
                            </p>
                            <p className="text-xs text-[hsl(var(--v3-muted-foreground))] truncate">
                                {person.department}
                            </p>
                        </div>

                        <div className="text-right">
                            <span className="text-sm font-bold text-[hsl(var(--v3-success))]">
                                {person.tasks}
                            </span>
                            <span className="text-xs text-[hsl(var(--v3-muted-foreground))] ml-1">
                                tasks
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
