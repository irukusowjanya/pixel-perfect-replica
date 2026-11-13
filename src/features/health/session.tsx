import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
const SessionContext = createContext<{ user: User | null; ready: boolean }>({
  user: null,
  ready: false,
});
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    let alive = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!alive) return;
      setUser(session?.user ?? null);
      setReady(true);
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    supabase.auth.getUser().then(({ data }) => {
      if (alive) {
        setUser(data.user);
        setReady(true);
      }
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [router, queryClient]);
  return <SessionContext.Provider value={{ user, ready }}>{children}</SessionContext.Provider>;
}
export const useSession = () => useContext(SessionContext);
