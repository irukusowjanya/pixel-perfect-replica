import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MessageCircle, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import { threadsQuery } from "@/features/health/thread-queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/_authenticated/conversations")({
  head: () =>
    healthHead(
      "Your conversations",
      "Private health conversations, saved to your Carewise account.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(threadsQuery()),
  component: Threads,
});
function Threads() {
  const { data } = useSuspenseQuery(threadsQuery());
  const { user } = Route.useRouteContext();
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function create() {
    const { data: thread, error } = await supabase
      .from("health_threads")
      .insert({ user_id: user.id })
      .select()
      .single();
    if (error || !thread) {
      toast.error("Could not start a conversation.");
      return;
    }
    await qc.invalidateQueries({ queryKey: ["health-threads"] });
    await navigate({ to: "/chat/$threadId", params: { threadId: thread.id } });
  }
  async function remove(id: string) {
    if (!window.confirm("Delete this conversation and all its messages?")) return;
    const { error } = await supabase.from("health_threads").delete().eq("id", id);
    if (error) toast.error("Could not delete conversation.");
    else qc.invalidateQueries({ queryKey: ["health-threads"] });
  }
  return (
    <Shell>
      <div className="flex justify-between gap-4">
        <div>
          <h1 className="page-heading">Your conversations</h1>
          <p className="page-subtitle">
            Your questions. Your space. A fresh start whenever you need.
          </p>
        </div>
        <Button onClick={create}>
          <Plus />
          New conversation
        </Button>
      </div>
      {data.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle className="text-primary mx-auto" size={40} />
          <h2 className="text-xl font-semibold mt-5">Let’s talk about how you feel</h2>
          <Button onClick={create} className="mt-6">
            Start a conversation
            <ArrowRight />
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {data.map((t) => (
            <div key={t.id} className="flex items-center border border-border bg-card rounded-md">
              <Link className="p-5 flex-1 min-w-0" to="/chat/$threadId" params={{ threadId: t.id }}>
                <h2 className="font-semibold text-sm">{t.title}</h2>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(t.created_at).toLocaleDateString()}
                </p>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete conversation"
                title="Delete conversation"
                className="mr-4"
                onClick={() => remove(t.id)}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
