import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "./find.css";
import { clerkAuthAppearance } from "../lib/clerk-appearance";
import { satoshi } from "../lib/fonts";

export const metadata: Metadata = {
  title: "MATCH - Private property search",
  description: "Search off-market property across Victoria before it reaches the portals.",
  icons: {
    icon: [
      { url: "/favicon-16.png?v=3", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png?v=3", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg?v=3", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.ico?v=3", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=3", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#5fa8de",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={clerkAuthAppearance}>
      <html lang="en" className={satoshi.variable}>
        <body className={satoshi.className} suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
