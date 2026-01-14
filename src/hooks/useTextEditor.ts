import { useState, useCallback } from "react";

interface UseTextEditorOptions {
  initialValue?: string;
  onContentChange?: (content: string) => void;
}

export const useTextEditor = (options: UseTextEditorOptions = {}) => {
  const { initialValue = "", onContentChange } = options;

  const [content, setContent] = useState<string>(initialValue);
  const [isLoading, setIsLoading] = useState(false);

  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      onContentChange?.(value);
    },
    [onContentChange]
  );

  const setContentValue = useCallback((value: string) => {
    setContent(value);
  }, []);

  const clearContent = useCallback(() => {
    setContent("");
  }, []);

  const getPlainText = useCallback(() => {
    // Remove HTML tags to get plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;
    return tempDiv.textContent || tempDiv.innerText || "";
  }, [content]);

  const getWordCount = useCallback(() => {
    const plainText = getPlainText();
    return plainText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }, [getPlainText]);

  const getCharacterCount = useCallback(() => {
    return getPlainText().length;
  }, [getPlainText]);

  return {
    content,
    setContent,
    handleContentChange,
    setContentValue,
    clearContent,
    getPlainText,
    getWordCount,
    getCharacterCount,
    isLoading,
    setIsLoading,
  };
};
