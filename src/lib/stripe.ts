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
    features: ["50 audits", "Full Reports", "Competitor Tracking"],
    limits: {
      auditsPerMonth: 50,
      keywords: 500,
      reports: 50,
      competitors: 5,
    },
  },
  agency: {
    name: "Agency",
    priceId: {
      monthly: "price_agency_monthly",
      yearly: "price_agency_yearly",
    },
    price: {
      monthly: 99,
      yearly: 990,
    },
    features: ["Unlimited Everything", "White Label", "Priority Support"],
    limits: {
      auditsPerMonth: -1, // unlimited
      keywords: -1,
      reports: -1,
      competitors: -1,
    },
  },
} as const;

export const FREE_PLAN = {
  name: "Free",
  price: {
    monthly: 0,
    yearly: 0,
  },
  features: ["5 audits/month", "Basic Reports", "Limited Keywords"],
  limits: {
    auditsPerMonth: 5,
    keywords: 50,
    reports: 5,
    competitors: 1,
  },
} as const;

export type PlanType = keyof typeof STRIPE_PLANS;
export type BillingInterval = "monthly" | "yearly";
