import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorMessage, signIn, register, sendReset, resendConfirmation } from "@/features/health/auth";
import { lovable } from "@/integrations/lovable";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Brand, Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import { useSession } from "@/features/health/session";
export const Route = createFileRoute("/auth")({
  head: () =>
    healthHead(
      "Sign in",
      "Sign in to your private Carewise health conversations and saved information.",
    ),
  component: Auth,
});
function Auth() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [canResend, setCanResend] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { user, ready } = useSession();
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setFeedback("");
    try {
      if (mode === "forgot") {
        await sendReset(email, window.location.origin);
        setFeedback("If an account uses this email, you’ll receive a password reset link. Check your spam folder too.");
      } else if (mode === "signup") {
        const data = await register(name, email, password, window.location.origin);
        if (data.session) await navigate({ to: "/" });
        else {
          setCanResend(true);
          setFeedback("Check your email and spam folder to confirm your account before signing in. If you already registered with this email, sign in or reset your password instead.");
        }
      } else {
        await signIn(email, password);
        await navigate({ to: "/" });
      }
    } catch (e) {
      setFeedback(authErrorMessage(e));
      setCanResend(true);
    } finally {
      setBusy(false);
    }
  }
  async function social(provider: "google" | "lovable") {
    if (busy) return;
    setBusy(true);
    setFeedback("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
      if (result.error) throw result.error;
      if (!result.redirected) await navigate({ to: "/" });
    } catch (error) {
      setFeedback(authErrorMessage(error));
    } finally { setBusy(false); }
  }
  async function resend() {
    if (busy || !email.trim()) return;
    setBusy(true);
    try {
      await resendConfirmation(email, window.location.origin);
      setFeedback("If your account needs verification, a new confirmation email has been sent. Check your inbox and spam folder.");
    } catch (error) { setFeedback(authErrorMessage(error)); }
    finally { setBusy(false); }
  }
  return (
    <Shell>
      <div className="max-w-sm mx-auto py-10">
        <Brand />
        <h1 className="page-heading mt-8">
          {user
            ? "You’re signed in"
            : mode === "signup"
              ? "Your health space, made personal"
              : mode === "forgot"
                ? "Reset your password"
                : "Welcome to your health space"}
        </h1>
        {!ready ? <p role="status" className="page-subtitle">Checking your session…</p> : user ? (
          <Button asChild className="mt-6">
            <Link to="/conversations">Go to my conversations</Link>
          </Button>
        ) : (
          <>
            <p className="page-subtitle mb-6">Private conversations. Clearer next steps.</p>
            <form onSubmit={submit} className="space-y-4">
              {mode === "signup" && (
                <label className="block text-sm">
                  Display name
                  <Input
                    className="mt-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                     maxLength={80}
                    autoComplete="name"
                  />
                </label>
              )}
              <label className="block text-sm">
                Email
                <Input
                  className="mt-2"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>
              {mode !== "forgot" && (
                <label className="block text-sm">
                  Password
                  <Input
                    className="mt-2"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={mode === "signup" ? 8 : undefined}
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  />
                </label>
              )}
              <Button className="w-full" disabled={busy}>
                {busy
                  ? "Please wait..."
                  : mode === "signup"
                    ? "Create account"
                    : mode === "forgot"
                      ? "Send reset link"
                      : "Sign in"}
              </Button>
            </form>
            {mode !== "forgot" && (
              <>
                <div className="text-center text-xs text-muted-foreground my-5">
                  or continue with
                </div>
                <Button variant="outline" disabled={busy} className="google-sign-in w-full h-10" onClick={() => social("google")}>
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18">
                    <path
                      fill="#4285F4"
                      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                    />
                  </svg>
                  Continue with Google
                </Button>
                <Button
                  className="lovable-auth-button w-full mt-3"
                  disabled={busy}
                  onClick={() => social("lovable")}
                >
                  Continue with Lovable
                </Button>
              </>
            )}
            <div className="flex justify-between mt-5">
              <Button
                variant="link"
                size="sm"
                disabled={busy}
                onClick={() => {
                  setMode(mode === "signup" ? "signin" : "signup");
                  setFeedback("");
                }}
              >
                {mode === "signup" ? "Already have an account?" : "Create an account"}
              </Button>
              <Button
                variant="link"
                size="sm"
                disabled={busy}
                onClick={() => {
                  setMode(mode === "forgot" ? "signin" : "forgot");
                  setFeedback("");
                }}
              >
                {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
              </Button>
            </div>
          </>
        )}
        {feedback && (
          <p role="status" className="mt-5 text-sm text-primary">
            {feedback}
          </p>
        )}
        {!user && canResend && mode !== "forgot" && (
          <Button variant="link" className="mt-2" disabled={busy || !email.trim()} onClick={resend}>
            Resend verification email
          </Button>
        )}
      </div>
    </Shell>
  );
}
