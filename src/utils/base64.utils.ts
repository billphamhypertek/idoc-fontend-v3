// Base64 decode with Unicode support
export const b64DecodeUnicode = (str: string): string => {
  try {
    // First decode base64
    const decoded = atob(str);
    // Then decode URI component to handle Unicode
    return decodeURIComponent(escape(decoded));
  } catch (error) {
    console.error("Error decoding base64:", error);
    return str;
  }
};

// Base64 encode with Unicode support
export const b64EncodeUnicode = (str: string): string => {
  try {
    // First encode URI component to handle Unicode
    const encoded = unescape(encodeURIComponent(str));
    // Then encode base64
    return btoa(encoded);
  } catch (error) {
    console.error("Error encoding base64:", error);
    return str;
  }
};
