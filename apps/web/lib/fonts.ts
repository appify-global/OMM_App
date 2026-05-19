import localFont from "next/font/local";

/** Matches mobile `Fonts.regular` / `Fonts.medium` — single family, two weights. */
export const satoshi = localFont({
  src: [
    {
      path: "../../../assets/fonts/Satoshi-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../assets/fonts/Satoshi-Medium.ttf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});
