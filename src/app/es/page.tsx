import type { Metadata } from "next";
import { HomeContent } from "@/app/page";

export const metadata: Metadata = {
  title: "Entradas Louvre con e-guide",
  alternates: { canonical: "/es" },
};

export default function SpanishPage() {
  return <HomeContent locale="es" />;
}
