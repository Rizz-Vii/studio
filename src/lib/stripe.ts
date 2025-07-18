import { loadStripe, Stripe } from "@stripe/stripe-js";

let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      throw new Error("Stripe publishable key is not configured");
    }

    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export default getStripe;

// Stripe pricing configuration
export const STRIPE_PLANS = {
  starter: {
    name: "Starter",
    priceId: {
      monthly: "price_starter_monthly", // Replace with actual Stripe Price IDs
      yearly: "price_starter_yearly",
    },
    price: {
      monthly: 29,
      yearly: 290,
    },
  },
  professional: {
    name: "Professional",
    priceId: {
      monthly: "price_professional_monthly",
      yearly: "price_professional_yearly",
    },
    price: {
      monthly: 79,
      yearly: 790,
    },
  },
  enterprise: {
    name: "Enterprise",
    priceId: {
      monthly: "price_enterprise_monthly",
      yearly: "price_enterprise_yearly",
    },
    price: {
      monthly: 199,
      yearly: 1990,
    },
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;
export type BillingInterval = "monthly" | "yearly";
