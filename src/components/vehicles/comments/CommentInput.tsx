import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Paperclip, Send } from "lucide-react";

interface CommentInputProps {
  comment: string;
  setComment: (comment: string) => void;
  handleSendComment: () => void;
  isPending: boolean;
}

export function CommentInput({
  comment,
  setComment,
  handleSendComment,
  isPending,
}: CommentInputProps) {
  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Nhập nội dung ý kiến"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[100px] text-sm"
      />
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-9 px-2 text-xs">
          <Paperclip className="w-4 h-4 mr-1 text-blue-600" />
          Đính kèm
        </Button>
        <Button
          onClick={handleSendComment}
          size="sm"
          disabled={isPending}
          className={`bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-blue-600 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          Gửi ý kiến
        </Button>
      </div>
    </div>
  );
}
