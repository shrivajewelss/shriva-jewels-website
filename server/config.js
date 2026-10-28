const env = process.env;
export const config = {
  port: Number(env.PORT || 8787),
  databasePath: env.DATABASE_PATH || "./data/shriva.db",
  siteUrl: env.VITE_SITE_URL || "",
  whatsapp: {
    provider: env.WHATSAPP_PROVIDER || "mock", // "cloud" | "mock"
    businessNumber: env.WHATSAPP_BUSINESS_NUMBER || "",
    accessToken: env.WHATSAPP_ACCESS_TOKEN || "",
    phoneNumberId: env.WHATSAPP_PHONE_NUMBER_ID || "",
    templateName: env.WHATSAPP_BOOKING_TEMPLATE_NAME || "",
    templateLang: env.WHATSAPP_TEMPLATE_LANGUAGE || "en",
    apiVersion: env.WHATSAPP_API_VERSION || "v21.0",
  },
  rateLimit: { windowMs: 60 * 60 * 1000, max: Number(env.BOOKING_RATE_LIMIT || 10) },
};
