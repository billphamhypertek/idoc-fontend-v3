declare module "docx-preview" {
  export function renderAsync(
    blob: Blob,
    container: HTMLElement,
    style?: unknown,
    options?: Record<string, unknown>
  ): Promise<void>;
}
