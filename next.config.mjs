/** @type {import('next').NextConfig} */
const nextConfig = {
  // Emits a self-contained server bundle → tiny Docker image for Cloud Run.
  output: "standalone",
  reactStrictMode: true,
  images: {
    // Citizen-uploaded photos live in Cloud Storage.
    remotePatterns: [{ protocol: "https", hostname: "storage.googleapis.com" }],
  },
  experimental: {
    // Keep client JS lean — only ship what a page actually imports.
    optimizePackageImports: ["firebase"],
  },
};

export default nextConfig;
