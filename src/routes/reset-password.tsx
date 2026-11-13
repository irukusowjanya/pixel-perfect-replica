import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
export const Route = createFileRoute("/reset-password")({
  head: () => healthHead("Reset password", "Set a new password for your Carewise account."),
  component: Reset,
});
function Reset() {
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    setRecovery(
      window.location.hash.includes("type=recovery") ||
        window.location.search.includes("type=recovery"),
    );
  }, []);
  async function submit(e: FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? error.message : "Your password has been updated.");
  }
  return (
    <Shell>
      <form onSubmit={submit} className="max-w-sm mx-auto py-10">
        <h1 className="page-heading">Set a new password</h1>
        {recovery ? (
          <>
            <label className="block mt-6 text-sm">
              New password
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                minLength={8}
                required
                autoComplete="new-password"
                className="mt-2"
              />
            </label>
            <Button className="mt-5">Update password</Button>
          </>
        ) : (
          <p className="page-subtitle">Open the password reset link from your email to continue.</p>
        )}
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      </form>
    </Shell>
  );
}
