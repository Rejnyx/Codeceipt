import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The engine is a workspace TS package; let Next transpile it in-process.
  transpilePackages: ["@codeceipt/engine"],
};

export default nextConfig;
