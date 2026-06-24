import { jsonOk } from "@/lib/api";
import { db } from "@/lib/db";
import {
  getServerEnv,
  isMailgunConfigured,
  isStripeConfigured,
} from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    getServerEnv();
    await db.$queryRaw`SELECT 1`;

    return jsonOk({
      status: "ok",
      database: true,
      mailgun: isMailgunConfigured(),
      stripe: isStripeConfigured(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return jsonOk(
      {
        status: "error",
        database: false,
        message:
          error instanceof Error ? error.message : "Health check failed",
        timestamp: new Date().toISOString(),
      },
      503
    );
  }
}
