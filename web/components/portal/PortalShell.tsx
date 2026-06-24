import { Footer } from "@/components/layout/Footer";
import { auth, signOut } from "@/lib/auth";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { db } from "@/lib/db";
import { getPortalNav } from "@/lib/portal-nav";
import { getSystemConfig, isFeatureEnabled } from "@/lib/settings/store";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { PortalSidebar } from "./PortalSidebar";

export async function PortalShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dbUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, status: true },
  });

  if (!dbUser || dbUser.status !== "ACTIVE") {
    redirect("/login");
  }

  if (dbUser.role !== session.user.role) {
    redirect("/login?reason=role_updated");
  }

  const [config, messagesEnabled] = await Promise.all([
    getSystemConfig(),
    isFeatureEnabled("portalMessages"),
  ]);

  const nav = getPortalNav(session.user.role).filter((item) => {
    if (item.href.includes("/messages") && !messagesEnabled) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200] focus:bg-gold focus:text-navy focus:px-4 focus:py-2"
      >
        Skip to portal content
      </a>
      <div className="flex flex-1 min-h-0">
        <PortalSidebar nav={nav} user={session.user} />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="bg-navy text-cream px-4 py-4 md:px-8 flex items-center justify-between border-b border-gold/20 shrink-0">
            <div className="flex items-center gap-3 pl-12 md:pl-0">
              <SiteLogo size="sm" linked />
              <div>
                <p className="text-xs uppercase tracking-widest text-gold/80">Portal</p>
              </div>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="inline-flex items-center gap-2 text-sm uppercase tracking-wider text-cream/80 hover:text-gold transition-colors"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign Out
              </button>
            </form>
          </header>
          <div id="portal-main" className="flex-1 p-4 md:p-8 overflow-auto">
            {children}
          </div>
        </div>
      </div>
      <Footer showBooking={config.features.onlineBookingPage} />
    </div>
  );
}
