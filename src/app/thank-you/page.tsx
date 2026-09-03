import type { Metadata } from "next";
import Link from "next/link";
import { GoogleAdsConversion } from "@/components/GoogleAdsConversion";
import { business } from "@/data/site";
import type { ConversionData } from "@/lib/orderFulfillment";
import {
  fulfillOrderFromSessionId,
  getConversionDataFromSessionId,
} from "@/lib/orderFulfillment";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Thank You",
  alternates: { canonical: "/thank-you" },
};

type ThankYouPageProps = {
  searchParams?: Promise<{
    session_id?: string;
  }>;
};

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const { session_id: sessionId } = (await searchParams) ?? {};
  let fulfillmentError = "";
  let conversionData: ConversionData | null = null;

  if (!sessionId) {
    return (
      <main className="thank-you-page">
        <section className="container thank-you-wrap">
          <article className="thank-you-card">
            <span className="thank-you-kicker">Booking reference missing</span>
            <h1>We could not confirm your payment.</h1>
            <p>
              This page needs a valid Stripe checkout reference. If you completed payment, please
              contact support with your payment email so we can locate your booking.
            </p>
            <div className="thank-you-actions">
              <Link href="/contact" className="button">
                Contact support
              </Link>
              <Link href="/" className="button muted">
                Back to homepage
              </Link>
            </div>
          </article>
        </section>
      </main>
    );
  }

  try {
    const result = await fulfillOrderFromSessionId(sessionId);

    if (!result.ok) {
      return (
        <main className="thank-you-page">
          <section className="container thank-you-wrap">
            <article className="thank-you-card">
              <span className="thank-you-kicker">Payment not confirmed</span>
              <h1>Your payment has not been completed yet.</h1>
              <p>
                We could not verify a successful payment for this checkout session. If you believe
                payment went through, contact support and include your payment email.
              </p>
              <div className="thank-you-actions">
                <Link href="/#booking" className="button">
                  Try booking again
                </Link>
                <Link href="/contact" className="button muted">
                  Contact support
                </Link>
              </div>
            </article>
          </section>
        </main>
      );
    }

    conversionData = result.conversion;
  } catch (error) {
    fulfillmentError = error instanceof Error ? error.message : "Unable to save order details.";
    conversionData = await getConversionDataFromSessionId(sessionId);
    console.error("Thank-you order fulfillment failed:", error);
  }
  if (fulfillmentError) {
    return (
      <>
        {conversionData ? (
          <GoogleAdsConversion
            transactionId={conversionData.transactionId}
            value={conversionData.value}
            currency={conversionData.currency}
          />
        ) : null}
        <main className="thank-you-page">
        <section className="container thank-you-wrap">
          <article className="thank-you-card">
            <span className="thank-you-kicker">Payment received</span>
            <h1>Thank you for your payment.</h1>
            <p>
              Your payment was successful, but we hit a temporary issue saving the booking details.
              Please contact support with your payment email so we can complete your order manually.
            </p>
            <div className="thank-you-actions">
              <Link href="/contact" className="button">
                Contact support
              </Link>
              <Link href="/" className="button muted">
                Back to homepage
              </Link>
            </div>
            <p className="thank-you-support">
              Support: <a href={`mailto:${business.email}`}>{business.email}</a>
            </p>
          </article>
        </section>
        </main>
      </>
    );
  }

  return (
    <>
      {conversionData ? (
        <GoogleAdsConversion
          transactionId={conversionData.transactionId}
          value={conversionData.value}
          currency={conversionData.currency}
        />
      ) : null}
      <main className="thank-you-page">
      <section className="container thank-you-wrap">
        <article className="thank-you-card">
          <span className="thank-you-kicker">Payment received</span>
          <h1>Thank you for your booking.</h1>
          <p>
            Your payment was successful. We are processing your request and will send your ticket
            details and e-guide information to the email address used during checkout.
          </p>

          <div className="thank-you-note">
            <strong>What happens next?</strong>
            <p>
              Please check your inbox and spam folder. If you have a question about your booking,
              contact our support team and include your Stripe payment email.
            </p>
          </div>

          <div className="thank-you-actions">
            <Link href="/" className="button">
              Back to homepage
            </Link>
            <Link href="/contact" className="button muted">
              Contact support
            </Link>
          </div>

          <p className="thank-you-support">
            Support: <a href={`mailto:${business.email}`}>{business.email}</a>
          </p>
        </article>
      </section>
      </main>
    </>
  );
}
