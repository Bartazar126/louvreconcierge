import Link from "next/link";
import { business, nonAffiliation } from "@/data/site";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link href="/" className="footer-brand">
            LOUVRE<span>TICKETS</span>
            <small>
              by<span>TOUR</span>CIERGE
            </small>
          </Link>
          <p>
            Operated by {business.legalName}. Karpatské námestie 10A, 831 06
            Bratislava, Slovak Republic,<br /> Company ID:{" "}
            <a href="https://finstat.sk/57383898" target="_blank" rel="noopener noreferrer">
              {business.ico}
            </a>
            .
          </p>
          <p>
            Support Email: <a href={`mailto:${business.email}`}>{business.email}</a>
          </p>
          {business.phoneDisplay ? <p>Support Phone: {business.phoneDisplay}</p> : null}
          <p>Customer service hours: {business.supportHours}</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/#tickets">Buy Tickets</Link>
          <Link href="/#blog">Travel Blog</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/about">About Us</Link>
          <a href="https://www.facebook.com/profile.php?id=61585921262449">Facebook</a>
        </div>
        <div>
          <h3>Support</h3>
          <Link href="/contact">Contact Us</Link>
          <Link href="/terms-of-service">Terms of Service</Link>
          <Link href="/refund-policy">Refund Policy</Link>
          <Link href="/payment-policy">Payment Policy</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/cookie">Cookie Policy</Link>
          <Link href="/disclaimer">Disclaimer</Link>
        </div>
        <div>
          <h3>Secure Payment</h3>
          <p>We accept all major credit cards. Encrypted by Stripe.</p>
          <div className="payment-methods" aria-label="Payment methods">
            <span>VISA</span>
            <span>MC</span>
            <span>AMEX</span>
            <span>Apple Pay</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
      <div className="container footer-bottom">
        <p>©2026 {business.brandName}, operated by {business.legalName}. All rights reserved.</p>
        <p className="disclaimer-text">
          <strong>Disclaimer:</strong> {nonAffiliation} Our listed prices may
          incorporate additional costs covering management fees, early
          availability access, customer service, and digital materials.
        </p>
      </div>
    </footer>
  );
}
