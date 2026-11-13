import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { UIMessage, ChatStatus } from "ai";
import { HeartPulse, ShieldCheck, TriangleAlert } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { sendHealthMessage } from "./chat.functions";
import { hasEmergencySymptoms, EMERGENCY_MESSAGE } from "@/lib/health-safety";
export function ChatWindow({ threadId, initial }: { threadId: string; initial: UIMessage[] }) {
  const [messages, setMessages] = useState(initial);
  const [status, setStatus] = useState<ChatStatus>("ready");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const abort = useRef<AbortController | null>(null);
  const send = useServerFn(sendHealthMessage);
  useEffect(() => {
    textarea.current?.focus();
    return () => abort.current?.abort();
  }, []);
  async function submit({ text }: { text: string }) {
    if (!text.trim() || status === "submitted" || status === "streaming") return;
    setError("");
    setDraft("");
    setMessages((m) => [
      ...m,
      { id: crypto.randomUUID(), role: "user", parts: [{ type: "text", text }] },
    ]);
    setStatus("submitted");
    textarea.current?.focus();
    const assistantId = crypto.randomUUID();
    const controller = new AbortController();
    abort.current = controller;
    try {
      const response = await send({ data: { threadId, text }, signal: controller.signal });
      if (!response.body) throw new Error("The assistant could not connect.");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let output = "";
      let done = false;
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        buffer += decoder.decode(next.value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event: { delta?: string; error?: string; done?: boolean } = JSON.parse(line);
          if (event.error) throw new Error(event.error);
          if (event.done) done = true;
          if (event.delta) {
            output += event.delta;
            setStatus("streaming");
            setMessages((m) => {
              const existing = m.some((x) => x.id === assistantId);
              const item: UIMessage = {
                id: assistantId,
                role: "assistant",
                parts: [{ type: "text", text: output }],
              };
              return existing ? m.map((x) => (x.id === assistantId ? item : x)) : [...m, item];
            });
          }
        }
      }
      if (!done) throw new Error("The response was interrupted. Your message is saved.");
      setStatus("ready");
    } catch (e) {
      if (controller.signal.aborted) {
        setStatus("ready");
      } else {
        setError(e instanceof Error ? e.message : "The assistant is unavailable.");
        setStatus("error");
      }
    } finally {
      abort.current = null;
      textarea.current?.focus();
    }
  }
  return (
    <div className="chat-window">
      <Conversation>
        <ConversationContent>
          {messages.length === 0 ? (
            <div className="text-center py-14">
              <span className="brand-mark mx-auto size-14">
                <HeartPulse size={33} />
              </span>
              <h2 className="text-2xl font-semibold mt-6">How are you feeling today?</h2>
              <p className="text-muted-foreground text-sm mt-3">
                Tell me about your symptoms or ask a health question.
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, i) =>
                    part.type === "text" ? (
                      message.role === "assistant" ? (
                        <MessageResponse key={i}>{part.text}</MessageResponse>
                      ) : (
                        <p key={i}>{part.text}</p>
                      )
                    ) : null,
                  )}
                </MessageContent>
              </Message>
            ))
          )}
          {status === "submitted" && <Shimmer>Thinking about your health question...</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {hasEmergencySymptoms(draft) && (
        <div role="alert" className="bg-warning-soft text-warning text-xs p-4 mb-3 flex gap-2">
          <TriangleAlert className="shrink-0" size={18} />
          {EMERGENCY_MESSAGE}
        </div>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm mb-3">
          {error}
        </p>
      )}
      <PromptInput onSubmit={submit}>
        <PromptInputTextarea
          ref={textarea}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Share your symptoms or ask a question..."
          aria-label="Health message"
        />
        <PromptInputFooter>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <ShieldCheck size={12} />
            Health education, not a diagnosis
          </span>
          <PromptInputSubmit
            status={status}
            disabled={!draft.trim() && status !== "submitted" && status !== "streaming"}
            onStop={() => abort.current?.abort()}
          />
        </PromptInputFooter>
      </PromptInput>
      <p className="text-[10px] text-muted-foreground mt-3">
        Messages are saved to your account and sent to an AI service. Avoid names, addresses, or
        other identifying details.
      </p>
    </div>
  );
}
