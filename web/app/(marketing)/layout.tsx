import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { getSystemConfig } from "@/lib/settings/store";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSystemConfig();
  const showBooking = config.features.onlineBookingPage;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-gold focus:text-navy focus:px-4 focus:py-2"
      >
        Skip to main content
      </a>
      <Navbar showBooking={showBooking} />
      <main id="main-content">{children}</main>
      <Footer showBooking={showBooking} />
    </>
  );
}
