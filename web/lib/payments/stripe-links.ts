function stripeDashboardBaseUrl(): string {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  const isTest = secretKey.includes("_test_");
  return isTest
    ? "https://dashboard.stripe.com/test"
    : "https://dashboard.stripe.com";
}

export function stripePaymentDashboardUrl(paymentIntentId: string): string {
  return `${stripeDashboardBaseUrl()}/payments/${paymentIntentId}`;
}

export function stripeCheckoutSessionDashboardUrl(sessionId: string): string {
  return `${stripeDashboardBaseUrl()}/checkout/sessions/${sessionId}`;
}

export function stripePaymentsListUrl(): string {
  return `${stripeDashboardBaseUrl()}/payments`;
}
