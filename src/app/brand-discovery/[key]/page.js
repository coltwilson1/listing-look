import { notFound } from "next/navigation";
import { checkQuestionnaireKey } from "@/app/lib/adminAuth";
import BrandDiscoveryForm from "../BrandDiscoveryForm";

// Private, invite-only page: only reachable with the secret link from the admin
// dashboard, never linked from the site, and hidden from search engines.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Brand Discovery | Elevate Marketing Co.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
};

export default async function BrandDiscoveryPage({ params }) {
  const { key } = await params;
  if (!checkQuestionnaireKey(key)) notFound();
  return <BrandDiscoveryForm inviteKey={key} />;
}
