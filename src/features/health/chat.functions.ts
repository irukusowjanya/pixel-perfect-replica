import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { HEALTH_INSTRUCTIONS, hasEmergencySymptoms, EMERGENCY_MESSAGE } from "@/lib/health-safety";

export const sendHealthMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({ threadId: z.string().uuid(), text: z.string().trim().min(1).max(12000) }),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: thread, error: threadError } = await supabase
      .from("health_threads")
      .select("id")
      .eq("id", data.threadId)
      .eq("user_id", userId)
      .single();
    if (threadError || !thread) throw new Error("Conversation unavailable.");
    const { error: saveError } = await supabase
      .from("health_messages")
      .insert({ thread_id: data.threadId, user_id: userId, role: "user", content: data.text });
    if (saveError) throw new Error("Your message could not be saved. Please try again.");
    const { data: history, error: historyError } = await supabase
      .from("health_messages")
      .select("role,content")
      .eq("thread_id", data.threadId)
      .order("created_at");
    if (historyError || !history) throw new Error("Conversation history unavailable.");
    const { streamResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    const request = getRequest();
    const encoder = new TextEncoder();
    const emergency = hasEmergencySymptoms(data.text);
    const body = new ReadableStream({
      async start(controller) {
        const emit = (event: object) =>
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        let answer = "";
        let completed = false;
        try {
          if (emergency) {
            answer = EMERGENCY_MESSAGE;
            emit({ delta: answer });
            completed = true;
          } else {
            const stream = await streamResponse(
              {
                model: "openai/gpt-6-astra",
                instructions: HEALTH_INSTRUCTIONS,
                input: history.map((m) =>
                  m.role === "assistant"
                    ? {
                        role: "assistant" as const,
                        content: [{ type: "output_text" as const, text: m.content }],
                      }
                    : { role: "user" as const, content: m.content },
                ),
              },
              { signal: request.signal },
            );
            for await (const event of stream) {
              if (
                event.type === "response.output_text.delta" ||
                event.type === "response.refusal.delta"
              ) {
                answer += event.delta;
                emit({ delta: event.delta });
              }
              if (event.type === "response.completed") completed = true;
              if (event.type === "response.incomplete")
                throw new Error("The response was interrupted. Your message is saved.");
            }
          }
          if (!completed || !answer)
            throw new Error("No complete response was received. Your message is saved.");
          const { error } = await supabase.from("health_messages").insert({
            thread_id: data.threadId,
            user_id: userId,
            role: "assistant",
            content: answer,
          });
          if (error) throw new Error("The response could not be saved. Keep this page open.");
          emit({ done: true });
        } catch (error) {
          if (error instanceof GatewayError) {
            console.error("Health assistant request failed", { code: error.code, ids: error.ids });
            emit({
              error:
                error.httpStatus === 402
                  ? "AI credits are unavailable. The app owner needs to add credits."
                  : "The assistant could not finish. Your message is saved; please try again later.",
            });
          } else
            emit({
              error: error instanceof Error ? error.message : "The assistant is unavailable.",
            });
        } finally {
          controller.close();
        }
      },
    });
    return new Response(body, {
      headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store" },
    });
  });
