import type { Metadata } from "next";
import { HomeContent } from "@/app/page";

export const metadata: Metadata = {
  title: "Biglietti Louvre con e-guide",
  alternates: { canonical: "/it" },
};

export default function ItalianPage() {
  return <HomeContent locale="it" />;
}
