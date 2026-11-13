import { beforeEach, describe, expect, it, vi } from "vitest";
const auth = vi.hoisted(() => ({ signInWithPassword: vi.fn(), signUp: vi.fn(), resetPasswordForEmail: vi.fn(), resend: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth } }));
import { normalizeEmail, signIn, register, sendReset, resendConfirmation, authErrorMessage } from "@/features/health/auth";

describe("Carewise authentication", () => {
  beforeEach(() => vi.resetAllMocks());
  it("passes normalized email and unchanged password to real password authentication", async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: { id: "user" }, session: { access_token: "test" } }, error: null });
    await signIn(" Person@Example.com ", "  ExactPassword!9  ");
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: "person@example.com", password: "  ExactPassword!9  " });
  });
  it("does not accept sign-in without a session", async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: null });
    await expect(signIn("person@example.com", "password")).rejects.toThrow();
  });
  it("registers name, email and password and preserves confirmation-required state", async () => {
    auth.signUp.mockResolvedValue({ data: { user: { id: "new" }, session: null }, error: null });
    const result = await register(" Person ", " Person@Example.com ", "Secure!123", "https://carewise.example");
    expect(auth.signUp).toHaveBeenCalledWith({ email: "person@example.com", password: "Secure!123", options: { emailRedirectTo: "https://carewise.example", data: { display_name: "Person" } } });
    expect(result.session).toBeNull();
  });
  it("does not swallow duplicate registration rejection", async () => {
    auth.signUp.mockResolvedValue({ data: null, error: { code: "user_already_exists" } });
    await expect(register("Person", "person@example.com", "Secure!123", "https://carewise.example")).rejects.toEqual({ code: "user_already_exists" });
  });
  it("directs reset emails to the public reset-password page", async () => {
    auth.resetPasswordForEmail.mockResolvedValue({ error: null });
    await sendReset(" Person@Example.com ", "https://carewise.example");
    expect(auth.resetPasswordForEmail).toHaveBeenCalledWith("person@example.com", { redirectTo: "https://carewise.example/reset-password" });
  });
  it("resends confirmation with the public origin", async () => {
    auth.resend.mockResolvedValue({ error: null });
    await resendConfirmation(" Person@Example.com ", "https://carewise.example");
    expect(auth.resend).toHaveBeenCalledWith({ type: "signup", email: "person@example.com", options: { emailRedirectTo: "https://carewise.example" } });
  });
  it("keeps verification and credential failures distinguishable without revealing membership", () => {
    expect(authErrorMessage({ code: "email_not_confirmed" })).not.toBe(authErrorMessage({ code: "invalid_credentials" }));
    expect(normalizeEmail(" USER@EXAMPLE.COM ")).toBe("user@example.com");
  });
  it("does not leak raw internal errors", () => {
    expect(authErrorMessage({ message: "secret internal connection string" })).not.toContain("secret");
  });
});