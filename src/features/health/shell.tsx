import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  HeartPulse,
  LayoutDashboard,
  MessageCircle,
  Stethoscope,
  BookOpen,
  Bookmark,
  History,
  Settings,
  ShieldCheck,
  Search,
  LogOut,
  ChevronDown,
  ArrowUpRight,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { authErrorMessage } from "./auth";
import { Button } from "@/components/ui/button";
import { useSession } from "./session";
import { supabase } from "@/integrations/supabase/client";
const navigation = [
  { to: "/" as const, label: "Overview", icon: LayoutDashboard },
  { to: "/conversations" as const, label: "AI health assistant", icon: MessageCircle },
  { to: "/symptom-checker" as const, label: "Symptom checker", icon: Stethoscope },
  { to: "/conditions" as const, label: "Health conditions", icon: BookOpen },
  { to: "/saved" as const, label: "Saved information", icon: Bookmark },
];
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">
        <HeartPulse size={25} />
      </span>
      carewise<span className="text-primary">.</span>
    </span>
  );
}
export function Shell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [signingOut, setSigningOut] = useState(false);
  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;
      await qc.cancelQueries();
      qc.clear();
      await navigate({ to: "/auth", replace: true });
    } catch (error) { toast.error(authErrorMessage(error)); }
    finally { setSigningOut(false); }
  }
  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link to="/" aria-label="Carewise home">
          <Brand />
        </Link>
        <p className="text-[11px] text-muted-foreground mt-3 ml-1">
          A little clarity. A healthier you.
        </p>
        <p className="nav-label">YOUR HEALTH SPACE</p>
        <nav>
          {navigation.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`nav-item ${location.pathname === n.to ? "active" : ""}`}
            >
              <n.icon />
              {n.label}
            </Link>
          ))}
        </nav>
        <p className="nav-label">PERSONAL</p>
        <Link to="/conversations" className="nav-item">
          <History />
          Previous conversations
        </Link>
        <Link to="/profile" className="nav-item">
          <Settings />
          My profile
        </Link>
        <div className="mt-auto border-t pt-5">
          <div className="flex items-center gap-2 text-success text-xs font-medium">
            <ShieldCheck size={16} />
            Your health, your privacy
          </div>
          <p className="text-[10px] text-muted-foreground leading-5 mt-2">
            Your saved conversations are private to your account.
          </p>
          <Link to="/articles" className="nav-item mt-4">
            <BookOpen />
            Health awareness
            <ArrowUpRight className="ml-auto" />
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="app-topbar">
          <div className="hidden max-sm:block">
            <Link to="/">
              <Brand />
            </Link>
          </div>
          <Link to="/conditions" className="top-search">
            <Search size={17} />
            <span>Search symptoms, conditions, and more...</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:flex text-success bg-success-soft px-3 py-1.5 rounded-full text-[10px] items-center gap-1.5">
              <ShieldCheck size={13} />
              Private & secure
            </span>
            {user ? (
              <>
                <Link to="/profile" className="flex items-center gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-secondary text-primary size-8 grid place-items-center">
                    {(user.user_metadata?.["display_name"] || user.email || "U")
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">
                    {user.user_metadata?.["display_name"] || "My account"}
                  </span>
                  <ChevronDown size={13} />
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Sign out"
                  aria-label="Sign out"
                  disabled={signingOut}
                  onClick={signOut}
                >
                  <LogOut />
                </Button>
              </>
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </header>
        <main className="page-content">
          {children}
          <p className="safety-note">
            <ShieldCheck size={14} className="shrink-0 mt-0.5" />
            Carewise provides health education, not a diagnosis or a replacement for professional
            medical advice.
          </p>
          <nav className="flex sm:hidden justify-center gap-4 mt-5 text-xs text-primary">
            <Link to="/">Overview</Link>
            <Link to="/conditions">Conditions</Link>
            <Link to="/conversations">Chats</Link>
            <Link to="/profile">Profile</Link>
          </nav>
        </main>
      </div>
    </div>
  );
}
