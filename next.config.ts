import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? "/pact-ai-prototype" : "",
  assetPrefix: isGitHubPages ? "/pact-ai-prototype/" : "",
};

export default nextConfig;
