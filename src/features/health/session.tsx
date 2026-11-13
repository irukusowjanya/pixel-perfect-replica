import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
const SessionContext = createContext<{ user: User | null; ready: boolean; recovery: boolean; finishRecovery: () => void }>({
  user: null,
  ready: false,
  recovery: false,
  finishRecovery: () => {},
});
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let alive = true;
    let authChanged = false;
    setRecovery(new URLSearchParams(window.location.hash.slice(1)).get("type") === "recovery" || new URLSearchParams(window.location.search).get("type") === "recovery");
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      authChanged = true;
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      if (event === "SIGNED_OUT") {
        setRecovery(false);
        void queryClient.cancelQueries().then(() => queryClient.clear());
      }
      setUser(session?.user ?? null);
      setReady(true);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    supabase.auth.getUser().then(({ data }) => {
      if (alive && !authChanged) {
        setUser(data.user);
        setReady(true);
      }
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [router, queryClient]);
  return <SessionContext.Provider value={{ user, ready, recovery, finishRecovery: () => setRecovery(false) }}>{children}</SessionContext.Provider>;
}
export const useSession = () => useContext(SessionContext);
