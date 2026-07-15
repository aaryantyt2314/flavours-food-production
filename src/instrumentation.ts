// Runs once at server startup (Next.js instrumentation hook).
// Fails fast in production when a required secret is missing, instead of
// surfacing as scattered 500s at request time.

const REQUIRED_IN_PRODUCTION = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
] as const;

const OPTIONAL_FEATURES: Record<string, string[]> = {
  'image uploads (Cloudinary)': ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
  'admin notifications (Telegram)': ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
};

export async function register() {
  const missing = REQUIRED_IN_PRODUCTION.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    const message = `Missing required environment variables: ${missing.join(', ')} (see .env.example)`;
    if (process.env.NODE_ENV === 'production') {
      throw new Error(message);
    }
    console.warn(`[env] ${message} — continuing because NODE_ENV is not production.`);
  }

  for (const [feature, vars] of Object.entries(OPTIONAL_FEATURES)) {
    const missingVars = vars.filter((name) => !process.env[name]);
    if (missingVars.length > 0 && missingVars.length < vars.length) {
      console.warn(`[env] Partial config for ${feature}: missing ${missingVars.join(', ')} — the feature will be disabled.`);
    }
  }
}
