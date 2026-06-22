import { markPaymentsPaidFromCheckoutSession } from "@/lib/payments/stripe-checkout";
import { getStripeClient } from "@/lib/stripe";
import { db } from "@/lib/db";
import {
  dispatchPortalNotification,
  notifyPaymentReceived,
} from "@/lib/notifications/dispatch";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature error:", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status !== "paid") {
        return NextResponse.json({ received: true });
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      await markPaymentsPaidFromCheckoutSession(session.id, paymentIntentId);

      const paymentIds =
        session.metadata?.paymentIds?.split(",").filter(Boolean) ?? [];
      const payments =
        paymentIds.length > 0
          ? await db.paymentRecord.findMany({
              where: { id: { in: paymentIds } },
              select: { id: true },
            })
          : await db.paymentRecord.findMany({
              where: { stripeCheckoutSessionId: session.id },
              select: { id: true },
            });

      await Promise.allSettled(
        payments.map((payment) =>
          dispatchPortalNotification(() => notifyPaymentReceived(payment.id))
        )
      );
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
