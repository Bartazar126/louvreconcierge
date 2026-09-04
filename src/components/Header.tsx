"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { getLocaleFromPath, localeMeta, locales, localizePath, ui } from "@/data/i18n";

export function Header() {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const t = ui[locale];
  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="header-shell">
      <div className="top-disclaimer">
        <div className="container">{t.nonAffiliation}</div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Link href={prefix || "/"} className="brand" aria-label="LouvreTickets homepage">
            <span className="brand-text">
              <strong>LOUVRETICKETS</strong>
              <span className="brand-byline">by Tourcierge</span>
            </span>
            <Image
              src="/images/logoLTGnew.png"
              alt="LouvreTickets logo"
              width={50}
              height={50}
              className="brand-logo"
              priority
            />
          </Link>
          <nav className="nav-links" aria-label="Main navigation">
            <Link href={`${prefix}/#tickets`}>{t.header.tickets}</Link>
            <Link href={`${prefix}/#booking`}>{t.header.booking}</Link>
            <Link href={`${prefix}/#blog`}>{t.header.blog}</Link>
            <Link href="/faq">{t.header.faq}</Link>
            <Link href="/contact">{t.header.contact}</Link>
          </nav>
          <details className="language-dropdown">
            <summary aria-label="Choose language">
              <span className="lang-dot" />
              {locale.toUpperCase()}
            </summary>
            <div className="language-menu">
              {locales.map((item) => (
                <Link key={item} href={localizePath(pathname, item)} lang={localeMeta[item].htmlLang}>
                  {localeMeta[item].flag} {localeMeta[item].label}
                </Link>
              ))}
            </div>
          </details>
        </div>
      </header>
    </div>
  );
}
