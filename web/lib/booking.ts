export const BOOKING_UNITS_PATH = "/portal/guest/units";

export function getBookingLoginUrl(): string {
  return `/login?callbackUrl=${encodeURIComponent(BOOKING_UNITS_PATH)}`;
}
