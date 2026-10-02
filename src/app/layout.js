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
  metadataBase: new URL("https://elevatemarketingco.vercel.app"),
  title: "Elevate Marketing Co. | Done-for-You Social Media & Marketing",
  description:
    "Done-for-you social media and custom branded content that keeps your business visible — with branding and websites coming soon.",
  openGraph: {
    title: "Elevate Marketing Co.",
    description: "Your marketing. Elevated. Done-for-you social media and custom branded content.",
    siteName: "Elevate Marketing Co.",
    type: "website",
  },
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
