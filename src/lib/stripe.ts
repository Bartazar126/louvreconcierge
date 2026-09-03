import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export function getStripeClient() {
  if (!stripeSecretKey) {
    return null;
  }

  return new Stripe(stripeSecretKey, {
    apiVersion: "2026-04-22.dahlia",
  });
}
