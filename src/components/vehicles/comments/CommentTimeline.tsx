import { Loader2, Send } from "lucide-react";
import { CommentItem } from "./CommentItem";

interface CommentTimelineProps {
  comments: any[];
  commentsLoading: boolean;
  formatRelativeTime: (timestamp: Date | string | number) => string;
}

export function CommentTimeline({
  comments,
  commentsLoading,
  formatRelativeTime,
}: CommentTimelineProps) {
  if (commentsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Send className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">Chưa có ý kiến nào!</p>
        <p className="text-xs text-gray-400 mt-1">
          Hãy là người đầu tiên đưa ra ý kiến
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-6">
        {comments.map((commentItem, index) => (
          <CommentItem
            key={commentItem.id}
            comment={commentItem}
            index={index}
            formatRelativeTime={formatRelativeTime}
          />
        ))}
      </div>
    </div>
  );
}
