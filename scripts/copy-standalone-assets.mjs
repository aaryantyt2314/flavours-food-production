import { cpSync, existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

if (!existsSync(standaloneDir)) {
  throw new Error("Missing .next/standalone. Run the Next.js build first.");
}

mkdirSync(path.join(standaloneDir, ".next"), { recursive: true });

cpSync(path.join(root, ".next", "static"), path.join(standaloneDir, ".next", "static"), {
  recursive: true,
});

if (existsSync(path.join(root, "public"))) {
  cpSync(path.join(root, "public"), path.join(standaloneDir, "public"), {
    recursive: true,
  });
}
