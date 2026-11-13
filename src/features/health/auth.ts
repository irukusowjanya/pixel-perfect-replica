import { supabase } from "@/integrations/supabase/client";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function authErrorMessage(error: unknown): string {
  const value = error as { code?: string; status?: number; message?: string } | null;
  const code = value?.code;
  if (code === "invalid_credentials") return "The email or password is incorrect. If you have not registered, create an account first. If you registered with Google, continue with Google or reset your password to set one.";
  if (code === "email_not_confirmed") return "Please verify your email before signing in. Open the confirmation email or request a new one below.";
  if (code === "user_already_exists" || code === "email_exists") return "An account already exists with this email. Sign in or reset your password.";
  if (code === "weak_password") return "Choose a stronger password with at least 8 characters, including uppercase and lowercase letters, a number, and a symbol.";
  if (code === "signup_disabled" || code === "email_provider_disabled" || code === "provider_disabled") return "This sign-in method is currently unavailable. Please try another sign-in option.";
  if (code === "refresh_token_already_used" || code === "refresh_token_not_found" || code === "session_not_found") return "Your session has expired. Please sign in again.";
  if (value?.status === 429) return "Too many requests. Please wait before trying again.";
  if (value?.status && value.status >= 500) return "The sign-in service is temporarily unavailable. Please try again shortly.";
  if (error instanceof TypeError || /fetch|network/i.test(value?.message ?? "")) return "Could not connect. Check your internet connection and try again.";
  if (code === "otp_expired") return "This email link has expired or was already used. Request a new link.";
  return "Unable to complete this request. Please try again" + (code && /^[a-z_]+$/.test(code) ? ` (${code}).` : ".");
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: normalizeEmail(email), password });
  if (error) throw error;
  if (!data.session || !data.user) throw new Error("Missing session");
  return data;
}

export async function register(name: string, email: string, password: string, origin: string) {
  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(email), password,
    options: { emailRedirectTo: origin, data: { display_name: name.trim() } },
  });
  if (error) throw error;
  return data;
}

export async function sendReset(email: string, origin: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), { redirectTo: `${origin}/reset-password` });
  if (error) throw error;
}

export async function resendConfirmation(email: string, origin: string) {
  const { error } = await supabase.auth.resend({ type: "signup", email: normalizeEmail(email), options: { emailRedirectTo: origin } });
  if (error) throw error;
}