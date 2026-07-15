import { existsSync } from "node:fs";
import path from "node:path";
import nextEnv from "@next/env";
import { PrismaClient } from "@prisma/client";

const { loadEnvConfig } = nextEnv;
const root = process.cwd();

loadEnvConfig(root);

const required = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
];

const optionalGroups = {
  "image uploads (Cloudinary)": [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ],
  "admin notifications (Telegram)": ["TELEGRAM_BOT_TOKEN", "TELEGRAM_CHAT_ID"],
};

function hasValue(name) {
  return Boolean(process.env[name]?.trim());
}

function validateUrl(name, expectedProtocols) {
  if (!hasValue(name)) return null;

  try {
    const url = new URL(process.env[name]);
    if (!expectedProtocols.includes(url.protocol)) {
      return `${name} must use ${expectedProtocols.join(" or ")}`;
    }
    return null;
  } catch {
    return `${name} must be a valid URL`;
  }
}

function getSafeDatabaseMetadata() {
  if (!hasValue("DATABASE_URL")) return null;

  try {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.host,
      database: url.pathname.replace(/^\//, "") || "(default)",
      params: Array.from(url.searchParams.keys()).sort(),
    };
  } catch {
    return null;
  }
}

function printPass(message) {
  console.log(`[pass] ${message}`);
}

function printWarn(message) {
  console.warn(`[warn] ${message}`);
}

function printFail(message) {
  console.error(`[fail] ${message}`);
}

const failures = [];
const warnings = [];

const missing = required.filter((name) => !hasValue(name));
if (missing.length > 0) {
  failures.push(`Missing required environment variables: ${missing.join(", ")}`);
}

for (const problem of [
  validateUrl("DATABASE_URL", ["postgresql:", "postgres:"]),
  validateUrl("DIRECT_URL", ["postgresql:", "postgres:"]),
  validateUrl("NEXTAUTH_URL", ["http:", "https:"]),
].filter(Boolean)) {
  failures.push(problem);
}

if (hasValue("NEXTAUTH_SECRET") && process.env.NEXTAUTH_SECRET.length < 32) {
  failures.push("NEXTAUTH_SECRET must be at least 32 characters");
}

if (process.env.NEXTAUTH_URL?.startsWith("http://localhost")) {
  failures.push("NEXTAUTH_URL must not point to localhost for deployment");
}

if (hasValue("DATABASE_URL") && !process.env.DATABASE_URL.includes("sslmode=")) {
  warnings.push("DATABASE_URL should include sslmode=require for managed Postgres providers");
}

for (const [feature, vars] of Object.entries(optionalGroups)) {
  const present = vars.filter(hasValue);
  if (present.length > 0 && present.length < vars.length) {
    warnings.push(`Partial config for ${feature}: set all of ${vars.join(", ")} or leave all empty`);
  }
}

const standaloneServer = path.join(root, ".next", "standalone", "server.js");
if (!existsSync(standaloneServer)) {
  failures.push("Missing .next/standalone/server.js; run npm run build before deploy:check");
}

if (failures.length > 0) {
  failures.forEach(printFail);
} else {
  printPass("required deployment environment variables are present and well-formed");
}

warnings.forEach(printWarn);

const canCheckDatabase = hasValue("DATABASE_URL") && !validateUrl("DATABASE_URL", ["postgresql:", "postgres:"]);

if (canCheckDatabase) {
  const metadata = getSafeDatabaseMetadata();
  if (metadata) {
    console.log(`[info] database host: ${metadata.host}`);
    console.log(`[info] database name: ${metadata.database}`);
    console.log(`[info] database query params: ${metadata.params.length > 0 ? metadata.params.join(", ") : "(none)"}`);
  }

  const prisma = new PrismaClient();

  try {
    await prisma.$queryRaw`SELECT 1`;
    printPass("database connection succeeded");
  } catch (error) {
    printFail("database connection failed");
    console.error(error instanceof Error ? error.message : error);
    failures.push("Database connection failed");
  } finally {
    await prisma.$disconnect();
  }
} else {
  printWarn("Skipping database connection check because DATABASE_URL is missing or invalid");
}

if (failures.length > 0) {
  process.exit(1);
}
