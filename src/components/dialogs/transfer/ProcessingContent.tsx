import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProcessingContentProps {
  processingContent: string;
  onContentChange: (content: string) => void;
}

export function ProcessingContent({
  processingContent,
  onContentChange,
}: ProcessingContentProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Label
        htmlFor="processingContent"
        className="text-sm font-semibold text-gray-900 mb-3 block"
      >
        Nội dung xử lý
      </Label>
      <Textarea
        id="processingContent"
        placeholder="Nhập nội dung xử lý..."
        value={processingContent}
        onChange={(e) => onContentChange(e.target.value)}
        className="min-h-[120px] resize-none"
      />
    </div>
  );
}
