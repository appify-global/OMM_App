import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import MobileBottomNav from "./components/MobileBottomNav";

export const metadata: Metadata = {
  title: "PreMarket",
  description: "Off-market property, before it reaches the listings.",
  icons: {
    icon: [
      { url: "/favicon-16.png?v=2", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon.svg?v=2", type: "image/svg+xml", sizes: "any" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.png?v=2", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#fcfaf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#1c1c1c",
          colorBackground: "#fcfaf6",
          colorText: "#1c1c1c",
          fontFamily: "var(--font-fraunces, 'Fraunces'), Georgia, serif",
          borderRadius: "2px",
        },
      }}
    >
      <html lang="en">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Inter:wght@400;500;600;700&display=swap"
          />
        </head>
        <body>
          {children}
          <MobileBottomNav />
        </body>
      </html>
    </ClerkProvider>
  );
}
