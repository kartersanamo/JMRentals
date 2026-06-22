import { auth, signOut } from "@/lib/auth";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { getPortalNav } from "@/lib/portal-nav";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { PortalSidebar } from "./PortalSidebar";

export async function PortalShell({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const nav = getPortalNav(session.user.role);

  return (
    <div className="min-h-screen bg-cream flex">
      <PortalSidebar nav={nav} user={session.user} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-navy text-cream px-4 py-4 md:px-8 flex items-center justify-between border-b border-gold/20">
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
        <div className="flex-1 p-4 md:p-8 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
