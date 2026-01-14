import { UserRound } from "lucide-react";

interface CommentItemProps {
  comment: any;
  index: number;
  formatRelativeTime: (timestamp: Date | string | number) => string;
}

export function CommentItem({
  comment,
  index,
  formatRelativeTime,
}: CommentItemProps) {
  return (
    <div key={comment.id} className="relative flex gap-4">
      {/* Timeline dot */}
      <div className="relative z-10">
        {/* Timeline dot indicator */}
        <div className="absolute -right-1 -bottom-1 w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>

      {/* Comment content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border flex gap-2 border-gray-200 rounded-lg p-4 shadow-sm">
          <UserRound />
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-gray-900">
                {comment.userFullName || "Không xác định"}
              </span>
              <span className="text-xs text-gray-500">
                ({comment.userPosition})
              </span>
            </div>
            {/* Comment content */}
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              {comment.comment}
            </p>
            {/* Timestamp */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">
                {formatRelativeTime(comment.createDate)}
              </span>
              {index === 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute left-0 top-4 w-2 h-2 bg-white border-l border-t border-gray-200 transform rotate-45 -translate-x-1"></div>
      </div>
    </div>
  );
}
