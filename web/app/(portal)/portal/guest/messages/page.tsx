import { MessageThreadList } from "@/components/portal/MessageThreadList";
import { PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function GuestMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const threads = await db.messageThread.findMany({
    where: { participantId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { firstName: true, lastName: true, role: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <PortalPageHeader title="Messages" subtitle="Contact our team with questions." />
      <PortalCard title="Conversation History">
        <MessageThreadList threads={threads} />
      </PortalCard>
    </div>
  );
}
