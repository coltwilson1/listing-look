import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { SanityLive } from "@/sanity/lib/live";
import "./globals.css";
import Toast from "./components/Toast";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "Elevate Marketing Co. | Social Media for Real Estate Agents",
  description:
    "Done-for-you social media, listing marketing, and custom branded content for real estate agents who want to stand out.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${dmSans.variable} antialiased`}>
        {children}
        <Toast />
        <SanityLive />
      </body>
    </html>
  );
}
