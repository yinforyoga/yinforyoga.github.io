/** @type {import('next').NextConfig} */
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: isGithubPages ? "/yinforyoga" : undefined,
  assetPrefix: isGithubPages ? "/yinforyoga/" : undefined
};

export default nextConfig;
