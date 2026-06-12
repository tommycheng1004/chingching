/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // 把這些重套件外部化，避免被打包進 Netlify Function bundle 造成上傳爆炸
  experimental: {
    serverComponentsExternalPackages: [
      "firebase-admin",
      "@react-pdf/renderer",
      "@google-cloud/storage",
      "@google-cloud/firestore",
      "nodemailer",
    ],
  },
};
module.exports = nextConfig;
