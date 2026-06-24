import { Footer } from "@/components/layout/Footer";
import { getSystemConfig } from "@/lib/settings/store";

export const dynamic = "force-dynamic";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const config = await getSystemConfig();

  return (
    <div className="min-h-screen flex flex-col bg-navy">
      <a
        href="#auth-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-gold focus:text-navy focus:px-4 focus:py-2"
      >
        Skip to sign in
      </a>
      <main id="auth-main" className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer showBooking={config.features.onlineBookingPage} />
    </div>
  );
}
