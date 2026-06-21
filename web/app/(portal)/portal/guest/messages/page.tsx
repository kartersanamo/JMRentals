import { ActionForm } from "@/components/portal/ActionForm";
import { EmptyState, PortalCard, PortalPageHeader } from "@/components/portal/PortalCard";
import { sendMessage } from "@/lib/actions/portal";
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
      <PortalCard title="New Message" className="mb-8">
        <ActionForm action={sendMessage} successMessage="Message sent.">
          <input
            name="subject"
            placeholder="Subject"
            className="w-full border border-navy/20 px-4 py-3 text-navy bg-white"
          />
          <textarea
            name="body"
            rows={4}
            required
            placeholder="Your message…"
            className="w-full border border-navy/20 px-4 py-3 text-navy bg-white resize-y"
          />
        </ActionForm>
      </PortalCard>
      <PortalCard title="Conversation History">
        {threads.length === 0 ? (
          <EmptyState message="No messages yet." />
        ) : (
          <ul className="space-y-6">
            {threads.map((thread) => (
              <li key={thread.id} className="border border-navy/10 p-4">
                <p className="font-medium text-navy mb-3">{thread.subject}</p>
                <div className="space-y-2">
                  {thread.messages.map((msg) => (
                    <div key={msg.id} className="text-sm bg-sage-light/50 p-3">
                      <p className="text-xs text-navy/50 mb-1">
                        {msg.sender.firstName} {msg.sender.lastName} ({msg.sender.role}) ·{" "}
                        {msg.createdAt.toLocaleString()}
                      </p>
                      <p className="text-navy/80 whitespace-pre-wrap">{msg.body}</p>
                    </div>
                  ))}
                </div>
                <ActionForm action={sendMessage} successMessage="Reply sent." className="mt-4 space-y-2">
                  <input type="hidden" name="threadId" value={thread.id} />
                  <textarea
                    name="body"
                    rows={2}
                    required
                    placeholder="Reply…"
                    className="w-full border border-navy/20 px-3 py-2 text-sm text-navy bg-white"
                  />
                </ActionForm>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>
    </div>
  );
}
