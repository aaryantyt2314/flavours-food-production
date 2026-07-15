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

function hasValue(name: string) {
  return Boolean(process.env[name]?.trim());
}

function isAbsoluteHttpUrl(value: string | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isPostgresUrl(value: string | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'postgresql:' || url.protocol === 'postgres:';
  } catch {
    return false;
  }
}

export function getEnvReport() {
  const missingRequired = REQUIRED_IN_PRODUCTION.filter((name) => !hasValue(name));
  const invalid: string[] = [];
  const warnings: string[] = [];

  if (hasValue('DATABASE_URL') && !isPostgresUrl(process.env.DATABASE_URL)) {
    invalid.push('DATABASE_URL must be a valid Postgres connection string');
  }

  if (hasValue('DIRECT_URL') && !isPostgresUrl(process.env.DIRECT_URL)) {
    invalid.push('DIRECT_URL must be a valid Postgres connection string');
  }

  if (hasValue('NEXTAUTH_URL') && !isAbsoluteHttpUrl(process.env.NEXTAUTH_URL)) {
    invalid.push('NEXTAUTH_URL must be an absolute http(s) URL');
  }

  if (process.env.NODE_ENV === 'production' && process.env.NEXTAUTH_URL?.startsWith('http://localhost')) {
    invalid.push('NEXTAUTH_URL must not point to localhost in production');
  }

  if (hasValue('NEXTAUTH_SECRET') && process.env.NEXTAUTH_SECRET!.length < 32) {
    invalid.push('NEXTAUTH_SECRET must be at least 32 characters');
  }

  if (hasValue('DATABASE_URL') && !process.env.DATABASE_URL!.includes('sslmode=')) {
    warnings.push('DATABASE_URL should include sslmode=require for managed Postgres providers');
  }

  for (const [feature, vars] of Object.entries(OPTIONAL_FEATURES)) {
    const present = vars.filter(hasValue);
    if (present.length > 0 && present.length < vars.length) {
      warnings.push(`Partial config for ${feature}: set all of ${vars.join(', ')} or leave all empty`);
    }
  }

  return {
    ok: missingRequired.length === 0 && invalid.length === 0,
    missingRequired,
    invalid,
    warnings,
  };
}

export function assertProductionEnv() {
  const report = getEnvReport();

  if (!report.ok) {
    const problems = [
      report.missingRequired.length > 0
        ? `Missing required environment variables: ${report.missingRequired.join(', ')}`
        : null,
      ...report.invalid,
    ].filter(Boolean);

    throw new Error(`${problems.join('; ')} (see .env.example)`);
  }

  return report;
}
