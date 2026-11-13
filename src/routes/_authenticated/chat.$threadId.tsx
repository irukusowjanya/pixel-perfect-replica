import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { UIMessage } from "ai";
import { ArrowLeft } from "lucide-react";
import { Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import { messagesQuery } from "@/features/health/thread-queries";
import { ChatWindow } from "@/features/health/chat-window";
export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  head: () =>
    healthHead(
      "Health conversation",
      "Talk with your Carewise health education assistant in a private saved conversation.",
    ),
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(messagesQuery(params.threadId)),
  component: Chat,
});
function Chat() {
  const { threadId } = Route.useParams();
  const { data } = useSuspenseQuery(messagesQuery(threadId));
  const initial: UIMessage[] = data.messages.map((m) => ({
    id: m.id,
    role: m.role === "assistant" ? "assistant" : "user",
    parts: [{ type: "text", text: m.content }],
  }));
  return (
    <Shell>
      <Link
        to="/conversations"
        className="inline-flex items-center gap-2 text-xs text-primary mb-3"
      >
        <ArrowLeft size={14} />
        All conversations
      </Link>
      <h1 className="page-heading">Your health assistant</h1>
      <ChatWindow key={threadId} threadId={threadId} initial={initial} />
    </Shell>
  );
}
