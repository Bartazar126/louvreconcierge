import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Teszt-környezeti lezárás: ha a SITE_LOCKDOWN env változó "1", minden
// útvonal 404-et ad, kivéve az admin panelt. Ezt a változót csak a teszt
// Vercel projekten állítjuk be — élesben a proxy átenged mindent.
export function proxy(request: NextRequest) {
  if (process.env.SITE_LOCKDOWN !== "1") {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  return new NextResponse("404: This page could not be found.", {
    status: 404,
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-robots-tag": "noindex",
    },
  });
}

export const config = {
  // A statikus buildfájlokat (JS/CSS chunkok, képoptimalizálás, ikonok) nem
  // szűrjük — ezek kellenek az admin panel működéséhez.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png).*)"],
};
