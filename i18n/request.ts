import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const locale = cookies().get("locale")?.value ?? "en";
  let messages;
  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    console.error(
      `Could not load translations for ${locale}, falling back to default.`,
      error
    );
    messages = (await import(`../messages/en.json`)).default; // fallback to English or default language
  }
  return {
    locale,
    messages,
  };
});
