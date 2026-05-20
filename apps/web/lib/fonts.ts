import localFont from "next/font/local";

/** Matches mobile `Fonts.regular` / `Fonts.medium` - single family, two weights. */
export const satoshi = localFont({
  src: [
    {
      path: "../public/fonts/Satoshi-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Satoshi-Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});
