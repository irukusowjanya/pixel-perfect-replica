import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
const profileQuery = (id: string) =>
  queryOptions({
    queryKey: ["health-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });
export const Route = createFileRoute("/_authenticated/profile")({
  head: () => healthHead("My profile", "Manage your Carewise display name and preferences."),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery(context.user.id)),
  component: Profile,
});
function Profile() {
  const { user } = Route.useRouteContext();
  const { data } = useSuspenseQuery(profileQuery(user.id));
  const [name, setName] = useState(data.display_name);
  const [preferences, setPreferences] = useState(data.preferences);
  const qc = useQueryClient();
  async function save(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: name, preferences })
      .eq("id", user.id);
    if (error) {
      toast.error("Could not save profile.");
      return;
    }
    const { error: ue } = await supabase.auth.updateUser({ data: { display_name: name } });
    if (ue) toast.error("Profile saved, but account name could not be refreshed.");
    else toast.success("Profile saved.");
    qc.invalidateQueries({ queryKey: ["health-profile"] });
  }
  return (
    <Shell>
      <h1 className="page-heading">My profile</h1>
      <form onSubmit={save} className="max-w-lg space-y-5 mt-8">
        <label className="block text-sm">
          Display name
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2"
            maxLength={80}
          />
        </label>
        <label className="block text-sm">
          Health interests and preferences
          <Textarea
            value={preferences}
            onChange={(e) => setPreferences(e.target.value)}
            className="mt-2"
            maxLength={2000}
          />
        </label>
        <p className="text-xs text-muted-foreground">
          Avoid sensitive identifying information. Preferences are saved here, not used as a medical
          record.
        </p>
        <Button>Save profile</Button>
      </form>
    </Shell>
  );
}
