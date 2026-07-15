import { createWriteStream } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const serverPath = path.join(process.cwd(), ".next", "standalone", "server.js");
const log = createWriteStream(path.join(process.cwd(), "server.log"), { flags: "a" });

const child = spawn(process.execPath, [serverPath], {
  env: {
    ...process.env,
    NODE_ENV: "production",
  },
  stdio: ["inherit", "pipe", "pipe"],
});

child.stdout.pipe(process.stdout);
child.stdout.pipe(log);
child.stderr.pipe(process.stderr);
child.stderr.pipe(log);

child.on("exit", (code, signal) => {
  log.end();
  if (signal) {
    process.kill(process.pid, signal);
  }
  process.exit(code ?? 1);
});
