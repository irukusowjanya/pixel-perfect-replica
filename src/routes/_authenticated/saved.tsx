import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import { conditions } from "@/features/health/conditions";
import { Button } from "@/components/ui/button";
const savedQuery = () =>
  queryOptions({
    queryKey: ["saved-conditions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_conditions")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
export const Route = createFileRoute("/_authenticated/saved")({
  head: () =>
    healthHead(
      "Saved information",
      "Your personal collection of saved health condition information.",
    ),
  loader: ({ context }) => context.queryClient.ensureQueryData(savedQuery()),
  component: Saved,
});
function Saved() {
  const { data } = useSuspenseQuery(savedQuery());
  const qc = useQueryClient();
  async function remove(id: string) {
    const { error } = await supabase.from("saved_conditions").delete().eq("id", id);
    if (error) toast.error("Could not remove saved information.");
    else qc.invalidateQueries({ queryKey: ["saved-conditions"] });
  }
  return (
    <Shell>
      <h1 className="page-heading">Saved health information</h1>
      <p className="page-subtitle">Keep useful information close by.</p>
      <div className="mt-8 space-y-3">
        {data.map((s) => {
          const c = conditions.find((c) => c.slug === s.condition_slug);
          if (!c) return null;
          return (
            <div className="flex border rounded-md bg-card" key={s.id}>
              <Link
                to="/conditions/$slug"
                params={{ slug: c.slug }}
                className="flex-1 p-5 flex gap-3 items-center"
              >
                <Bookmark size={18} className="text-primary" />
                <span className="text-sm font-medium">{c.name}</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="m-3"
                title="Remove saved condition"
                aria-label="Remove saved condition"
                onClick={() => remove(s.id)}
              >
                <Trash2 />
              </Button>
            </div>
          );
        })}
        {!data.length && (
          <p className="text-muted-foreground py-10">
            No saved conditions yet.{" "}
            <Link to="/conditions" className="text-primary">
              Explore conditions
            </Link>
          </p>
        )}
      </div>
    </Shell>
  );
}
