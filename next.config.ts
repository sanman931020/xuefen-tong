import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "tesseract.js", "@prisma/client", "bcryptjs"],
};

export default nextConfig;
