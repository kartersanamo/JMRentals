import { db } from "@/lib/db";
import { getStripeClient } from "@/lib/stripe";
import { portalLink } from "@/lib/notifications/mail";

function formatAmountForStripe(amount: number): number {
  return Math.round(amount * 100);
}

export async function createRentCheckoutSession(
  residentId: string,
  paymentIds: string[]
): Promise<{ url: string } | { error: string }> {
  const stripe = getStripeClient();
  if (!stripe) {
    return { error: "Online payments are not configured yet." };
  }

  const payments = await db.paymentRecord.findMany({
    where: {
      id: { in: paymentIds },
      residentId,
      paidAt: null,
    },
    orderBy: { dueDate: "asc" },
  });

  if (payments.length === 0) {
    return { error: "No unpaid charges selected." };
  }

  if (payments.length !== paymentIds.length) {
    return { error: "One or more selected charges are invalid or already paid." };
  }

  const lineItems = payments.map((payment) => ({
    price_data: {
      currency: "usd",
      unit_amount: formatAmountForStripe(Number(payment.amount)),
      product_data: {
        name: payment.description,
        description: `Due ${payment.dueDate.toLocaleDateString()}`,
      },
    },
    quantity: 1,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: lineItems,
    success_url: `${portalLink("/portal/resident/payments")}?paid=success`,
    cancel_url: `${portalLink("/portal/resident/payments")}?paid=cancelled`,
    metadata: {
      residentId,
      paymentIds: payments.map((payment) => payment.id).join(","),
    },
  });

  if (!session.url) {
    return { error: "Could not start checkout." };
  }

  await db.paymentRecord.updateMany({
    where: { id: { in: payments.map((payment) => payment.id) } },
    data: { stripeCheckoutSessionId: session.id },
  });

  return { url: session.url };
}

export async function markPaymentsPaidFromCheckoutSession(
  sessionId: string,
  paymentIntentId: string | null
): Promise<void> {
  const sessionPayments = await db.paymentRecord.findMany({
    where: { stripeCheckoutSessionId: sessionId },
  });

  if (sessionPayments.length > 0) {
    await db.paymentRecord.updateMany({
      where: { stripeCheckoutSessionId: sessionId, paidAt: null },
      data: {
        paidAt: new Date(),
        stripePaymentId: paymentIntentId ?? undefined,
      },
    });
    return;
  }

  const stripe = getStripeClient();
  if (!stripe) return;

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const paymentIds = session.metadata?.paymentIds?.split(",").filter(Boolean) ?? [];
  if (paymentIds.length === 0) return;

  await db.paymentRecord.updateMany({
    where: { id: { in: paymentIds }, paidAt: null },
    data: {
      paidAt: new Date(),
      stripePaymentId: paymentIntentId ?? undefined,
      stripeCheckoutSessionId: sessionId,
    },
  });
}
