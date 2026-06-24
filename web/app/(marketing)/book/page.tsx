import { auth } from "@/lib/auth";
import { BOOKING_UNITS_PATH, getBookingLoginUrl } from "@/lib/booking";
import { getRoleHome } from "@/lib/rbac";
import { isFeatureEnabled } from "@/lib/settings/store";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Browse Units & Apply",
  description:
    "Browse available units and apply online at J&M Rentals in Larose, LA.",
};

export default async function BookPage() {
  if (!(await isFeatureEnabled("onlineBookingPage"))) {
    notFound();
  }

  const session = await auth();

  if (session?.user && session.user.role !== "GUEST") {
    redirect(getRoleHome(session.user.role));
  }

  if (!session?.user) {
    redirect(getBookingLoginUrl());
  }

  redirect(BOOKING_UNITS_PATH);
}
