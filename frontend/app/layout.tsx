import React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import { metadata, viewport } from "../public/metadata";
import ClientLayout from "@/components/ClientLayout";
import { AssistantProvider } from "@/context/Assistant-context"; // adjust path as needed

const workSans = Inter({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export { metadata, viewport };

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en" className={`overflow-x-hidden ${workSans.className}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/icon-256x256.png" />
        <link rel="icon" type="image/png" sizes="384x384" href="/icon-384x384.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-TileColor" content="#000000" />
      </head>
      <body className="overflow-x-hidden">
        <AssistantProvider><ClientLayout>{children}</ClientLayout></AssistantProvider>
      </body>
    </html>
  );
};

export default RootLayout;
