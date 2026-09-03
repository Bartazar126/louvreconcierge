import type { Metadata } from "next";
import { HomeContent } from "@/app/page";

export const metadata: Metadata = {
  title: "Louvre Tickets mit E-Guide",
  alternates: { canonical: "/de" },
};

export default function GermanPage() {
  return <HomeContent locale="de" />;
}
