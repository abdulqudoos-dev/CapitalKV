/** @type {import('next').NextConfig} */
import nextPwa from "next-pwa";

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["backend.capitalkv.com", "localhost"], // Add other domains as needed
  },
  pwa: {
    dest: "public",
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === "development",
  },
};

export default nextConfig;
