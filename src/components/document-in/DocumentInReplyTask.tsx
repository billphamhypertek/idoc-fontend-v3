import { Draft } from "@/definitions/types/document.type";
import ReplyTaskSelection from "./ReplyTaskSelection";

interface Props {
  draft: Draft;
}

export const DocumentInReplyTask: React.FC<Props> = ({ draft }) => {
  return (
    <>
      {draft.listReplyTask?.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center space-x-2 mt-1  min-h-[28px]">
            <ReplyTaskSelection editable={false} data={draft.listReplyTask} />
          </div>
        </div>
      )}
    </>
  );
};
