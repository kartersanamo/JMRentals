import { ActionForm } from "@/components/portal/ActionForm";
import { EmptyState } from "@/components/portal/PortalCard";
import { sendMessage } from "@/lib/actions/portal";

type MessageSender = {
  firstName: string;
  lastName: string;
  role: string;
};

type ThreadMessage = {
  id: string;
  body: string;
  createdAt: Date;
  sender: MessageSender;
};

export type MessageThreadItem = {
  id: string;
  subject: string;
  messages: ThreadMessage[];
};

type MessageThreadListProps = {
  threads: MessageThreadItem[];
  emptyMessage?: string;
  showNewMessage?: boolean;
  newMessageTitle?: string;
};

export function MessageThreadList({
  threads,
  emptyMessage = "No messages yet.",
  showNewMessage = true,
  newMessageTitle = "New Message",
}: MessageThreadListProps) {
  return (
    <>
      {showNewMessage && (
        <div className="mb-8 border border-navy/10 p-6 bg-white">
          <h3 className="font-display text-xl text-navy mb-4">{newMessageTitle}</h3>
          <ActionForm action={sendMessage} successMessage="Message sent." className="space-y-3">
            <div>
              <label htmlFor="message-subject" className="sr-only">
                Subject
              </label>
              <input
                id="message-subject"
                name="subject"
                placeholder="Subject"
                className="w-full border border-navy/20 px-4 py-3 text-navy bg-white"
              />
            </div>
            <div>
              <label htmlFor="message-body" className="sr-only">
                Message
              </label>
              <textarea
                id="message-body"
                name="body"
                rows={4}
                required
                placeholder="Your message…"
                className="w-full border border-navy/20 px-4 py-3 text-navy bg-white resize-y"
              />
            </div>
          </ActionForm>
        </div>
      )}

      {threads.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <ul className="space-y-6">
          {threads.map((thread) => (
            <li key={thread.id} className="border border-navy/10 p-4 bg-white">
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
              <ActionForm
                action={sendMessage}
                successMessage="Reply sent."
                className="mt-4 space-y-2"
              >
                <input type="hidden" name="threadId" value={thread.id} />
                <label htmlFor={`reply-${thread.id}`} className="sr-only">
                  Reply
                </label>
                <textarea
                  id={`reply-${thread.id}`}
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
    </>
  );
}
