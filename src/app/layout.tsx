import "@/styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ClientLayout } from "@/components/client-layout";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RankPilot - AI-Powered SEO Platform",
  description:
    "RankPilot is an AI-first SEO platform that provides comprehensive site audits, keyword intelligence, and competitor tracking to boost your search rankings.",
  keywords: [
    "SEO",
    "AI",
    "search engine optimization",
    "keyword research",
    "site audit",
    "competitor analysis",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico?v=20250726", sizes: "any" },
      { url: "/favicon.svg?v=20250726", type: "image/svg+xml" },
      {
        url: "/favicon-16x16.png?v=20250726",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png?v=20250726",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#6699CC" },
    ],
  },
  manifest: "/manifest.json",
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: "#6699CC",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased h-full">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
