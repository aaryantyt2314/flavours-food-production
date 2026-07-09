import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  turbopack: {
    root: repoRoot,
  },
};

export default nextConfig;
