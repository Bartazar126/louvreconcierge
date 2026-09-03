import type { Metadata } from "next";
import { HomeContent } from "@/app/page";

export const metadata: Metadata = {
  title: "Billets Louvre avec e-guide",
  alternates: { canonical: "/fr" },
};

export default function FrenchPage() {
  return <HomeContent locale="fr" />;
}
