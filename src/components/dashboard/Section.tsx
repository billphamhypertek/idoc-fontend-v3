// --- SectionHeader logic backup ---
// import React from "react";
// export type SectionHeaderProps = { title: string; icon?: React.ReactNode };
// export const SectionHeader = ({ title, icon }: SectionHeaderProps) => {
//   return (
//     <div className="flex items-center gap-2">
//       {icon}
//       <span className="font-semibold text-lg">{title}</span>
//     </div>
//   );
// }
// --- End SectionHeader logic backup ---
import React from "react";
import { FileText, Send, Users, BarChart2, Paperclip } from "lucide-react";

interface SectionProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const getSectionIcon = (title: string) => {
  if (title.includes("văn bản đi"))
    return <Send className="w-4 h-4 text-yellow-600 animate-bounce" />;
  if (title.includes("văn bản đến"))
    return <Paperclip className="w-4 h-4 text-blue-600 animate-bounce" />;
  if (title.includes("truy cập"))
    return <Users className="w-4 h-4 text-purple-600 animate-bounce" />;
  return <BarChart2 className="w-4 h-4 text-green-600 animate-bounce" />;
};

export function Section({ title, subtitle, icon, children }: SectionProps) {
  return (
    <section className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-6 mt-8">
      <div className="flex items-center gap-3 mb-6">
        {icon ?? getSectionIcon(title)}
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-extrabold text-blue-800 tracking-tight drop-shadow animate-fade-in">
            {title}
          </h2>
          {subtitle && (
            <span className="text-xs text-gray-500">{subtitle}</span>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}
