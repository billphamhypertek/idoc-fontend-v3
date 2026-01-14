import { sendPost } from "@/api";

const CHAT_RESUME_URL_KEY = "CHAT_RESUME_URL";

export const getSavedResumeUrl = (): string | null =>
  typeof window === "undefined"
    ? null
    : sessionStorage.getItem(CHAT_RESUME_URL_KEY);

export const saveResumeUrl = (url: string): void => {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CHAT_RESUME_URL_KEY, url);
};

function isSafeUrl(u: string) {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export const getChatResumeUrl = (): string | null => {
  const savedUrl = getSavedResumeUrl();
  if (savedUrl && isSafeUrl(savedUrl)) {
    return savedUrl;
  }
  return null;
};
export class ChatService {
  static async getResumeEndpoint() {
    const response = await sendPost(`/chat/resume-endpoint`);
    return response.data;
  }
}
