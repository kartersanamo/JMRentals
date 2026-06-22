import { db } from "@/lib/db";
import { getStripeClient } from "@/lib/stripe";
import { markPaymentsPaidFromCheckoutSession } from "@/lib/payments/stripe-checkout";

export async function syncStripePaymentStatus(): Promise<number> {
  const stripe = getStripeClient();
  if (!stripe) return 0;

  const unpaidSessions = await db.paymentRecord.findMany({
    where: {
      paidAt: null,
      stripeCheckoutSessionId: { not: null },
    },
    select: { stripeCheckoutSessionId: true },
    distinct: ["stripeCheckoutSessionId"],
  });

  let synced = 0;
  for (const { stripeCheckoutSessionId } of unpaidSessions) {
    if (!stripeCheckoutSessionId) continue;

    const session = await stripe.checkout.sessions.retrieve(stripeCheckoutSessionId);
    if (session.payment_status !== "paid") continue;

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    await markPaymentsPaidFromCheckoutSession(stripeCheckoutSessionId, paymentIntentId);
    synced += 1;
  }

  return synced;
}
