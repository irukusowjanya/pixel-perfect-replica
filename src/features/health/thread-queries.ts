import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export const threadsQuery = () =>
  queryOptions({
    queryKey: ["health-threads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("health_threads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
export const messagesQuery = (id: string) =>
  queryOptions({
    queryKey: ["health-messages", id],
    queryFn: async () => {
      const { data: thread, error: te } = await supabase
        .from("health_threads")
        .select("id,title")
        .eq("id", id)
        .single();
      if (te || !thread) throw new Error("Conversation not found.");
      const { data, error } = await supabase
        .from("health_messages")
        .select("*")
        .eq("thread_id", id)
        .order("created_at");
      if (error) throw error;
      return { thread, messages: data };
    },
  });
