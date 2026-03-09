import { Playfair_Display, DM_Sans } from "next/font/google";
import { SanityLive } from "@/sanity/lib/live";
import "./globals.css";
import Toast from "./components/Toast";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "The Listing Look | Real Estate Marketing Concierge",
  description:
    "Beautiful social media graphics, postcards, and custom marketing materials — designed just for real estate agents.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} antialiased`}>
        {children}
        <Toast />
        <SanityLive />
      </body>
    </html>
  );
}
