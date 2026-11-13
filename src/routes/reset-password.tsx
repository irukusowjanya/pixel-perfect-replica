import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/features/health/session";
import { authErrorMessage } from "@/features/health/auth";
import { Link } from "@tanstack/react-router";
export const Route = createFileRoute("/reset-password")({
  head: () => healthHead("Reset password", "Set a new password for your Carewise account."),
  component: Reset,
});
function Reset() {
  const { recovery, user, ready, finishRecovery } = useSession();
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy || !recovery || !user) return;
    if (password !== confirmation) { setMessage("The passwords do not match."); return; }
    setBusy(true);
    setMessage("");
    try {
      const { data, error: sessionError } = await supabase.auth.getUser();
      if (sessionError || !data.user) { setMessage("Your reset link is invalid or expired. Request a new link."); return; }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword(""); setConfirmation(""); setComplete(true); finishRecovery();
      setMessage("Your password has been updated.");
    } catch (error) { setMessage(authErrorMessage(error)); }
    finally { setBusy(false); }
  }
  return (
    <Shell>
      <form onSubmit={submit} className="max-w-sm mx-auto py-10">
        <h1 className="page-heading">Set a new password</h1>
        {!ready ? <p role="status" className="page-subtitle">Checking your reset link…</p> : complete ? <Button asChild className="mt-5"><Link to="/">Go to dashboard</Link></Button> : recovery && user ? (
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
            <label className="block mt-4 text-sm">Confirm new password
              <Input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} type="password" minLength={8} required autoComplete="new-password" className="mt-2" />
            </label>
            <Button className="mt-5" disabled={busy}>{busy ? "Updating…" : "Update password"}</Button>
          </>
        ) : (
          <p className="page-subtitle">Open a valid password reset link from your email to continue. <Link to="/auth" className="text-primary">Request a new link</Link></p>
        )}
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      </form>
    </Shell>
  );
}
