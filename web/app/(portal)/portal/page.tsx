import { auth, getPortalRedirect } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PortalIndexPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(getPortalRedirect(session.user.role));
}
