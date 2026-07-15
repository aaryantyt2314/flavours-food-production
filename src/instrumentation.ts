import { assertProductionEnv, getEnvReport } from '@/lib/env';

export async function register() {
  if (process.env.NODE_ENV === 'production') {
    const report = assertProductionEnv();
    for (const warning of report.warnings) {
      console.warn(`[env] ${warning}`);
    }
    return;
  }

  const report = getEnvReport();
  if (!report.ok) {
    const missing = report.missingRequired.length > 0
      ? `missing ${report.missingRequired.join(', ')}`
      : null;
    const invalid = report.invalid.length > 0
      ? `invalid ${report.invalid.join('; ')}`
      : null;
    console.warn(`[env] ${[missing, invalid].filter(Boolean).join('; ')} — continuing because NODE_ENV is not production.`);
  }

  for (const warning of report.warnings) {
    console.warn(`[env] ${warning}`);
  }
}
