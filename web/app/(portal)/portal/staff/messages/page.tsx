import { MessageThreadList } from "@/components/portal/MessageThreadList";
import {
  EmptyState,
  PortalCard,
  PortalPageHeader,
} from "@/components/portal/PortalCard";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { isFeatureEnabled } from "@/lib/settings/store";
import { redirect } from "next/navigation";

export default async function StaffMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const messagesEnabled = await isFeatureEnabled("portalMessages");

  const threads = messagesEnabled
    ? await db.messageThread.findMany({
        include: {
          participant: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
          messages: {
            orderBy: { createdAt: "asc" },
            include: {
              sender: { select: { firstName: true, lastName: true, role: true } },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  return (
    <div>
      <PortalPageHeader
        title="Messages"
        subtitle="View and reply to guest and resident conversations."
      />
      {!messagesEnabled ? (
        <PortalCard title="Messaging disabled">
          <EmptyState message="Portal messaging is turned off in System Control." />
        </PortalCard>
      ) : (
        <PortalCard title="All Conversations">
          {threads.length === 0 ? (
            <EmptyState message="No messages yet." />
          ) : (
            <ul className="space-y-8">
              {threads.map((thread) => (
                <li key={thread.id} className="border-b border-navy/10 pb-8 last:border-0">
                  <p className="text-sm text-navy/60 mb-4">
                    {thread.participant.firstName} {thread.participant.lastName} ·{" "}
                    {thread.participant.email} · {thread.participant.role}
                  </p>
                  <MessageThreadList
                    threads={[thread]}
                    showNewMessage={false}
                    emptyMessage="No messages in this thread."
                  />
                </li>
              ))}
            </ul>
          )}
        </PortalCard>
      )}
    </div>
  );
}
