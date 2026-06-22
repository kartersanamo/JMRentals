import { auth } from "@/lib/auth";
import { BOOKING_UNITS_PATH, getBookingLoginUrl } from "@/lib/booking";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Now",
  description:
    "Browse available units and apply online at J&M Rentals in Larose, LA.",
};

export default async function BookPage() {
  const session = await auth();

  if (!session?.user) {
    redirect(getBookingLoginUrl());
  }

  redirect(BOOKING_UNITS_PATH);
}
