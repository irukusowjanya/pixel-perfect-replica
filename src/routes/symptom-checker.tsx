import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ArrowLeft, TriangleAlert, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import { hasEmergencySymptoms, EMERGENCY_MESSAGE } from "@/lib/health-safety";
import { useSession } from "@/features/health/session";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
export const Route = createFileRoute("/symptom-checker")({
  head: () =>
    healthHead(
      "Symptom checker",
      "Step through your symptoms, check urgent warning signs and prepare for safe health guidance.",
    ),
  component: Checker,
});
const questions = [
  "What symptoms are you experiencing?",
  "When did the symptoms start?",
  "How severe are they?",
  "Are your symptoms changing?",
  "Do you have any other symptoms?",
  "Have you experienced this before?",
  "What is your age?",
];
function Checker() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(7).fill(""));
  const [busy, setBusy] = useState(false);
  const { user } = useSession();
  const navigate = useNavigate();
  const emergency = hasEmergencySymptoms(answers.join(" "));
  const done = step === 7;
  function answer(value: string) {
    setAnswers((a) => a.map((s, i) => (i === step ? value : s)));
  }
  async function review() {
    if (!user) return;
    setBusy(true);
    const { data, error } = await supabase
      .from("health_threads")
      .insert({ user_id: user.id, title: "Symptom assessment" })
      .select()
      .single();
    if (error || !data) {
      toast.error("Could not save assessment.");
      setBusy(false);
      return;
    }
    const { error: me } = await supabase.from("health_messages").insert({
      user_id: user.id,
      thread_id: data.id,
      role: "user",
      content:
        "Please help me understand my symptoms and safe next steps. This is not a request for a diagnosis.\n" +
        questions.map((q, i) => `${q} ${answers[i]}`).join("\n"),
    });
    if (me) {
      toast.error("Could not save your answers.");
      setBusy(false);
      return;
    }
    await navigate({ to: "/chat/$threadId", params: { threadId: data.id } });
  }
  return (
    <Shell>
      <h1 className="page-heading">Let’s understand your symptoms</h1>
      <p className="page-subtitle">A thoughtful first step, not a medical diagnosis.</p>
      <div className="assessment">
        <div className="flex gap-2">
          {questions.map((q, i) => (
            <span
              key={q}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>
        {emergency && (
          <div role="alert" className="bg-warning-soft text-warning p-5 mt-6 rounded-md">
            <h2 className="flex gap-2 items-center text-lg my-0">
              <TriangleAlert />
              Seek emergency help now
            </h2>
            <p className="text-sm leading-7 mt-3">{EMERGENCY_MESSAGE}</p>
            <Button asChild className="mt-4">
              <a href="tel:112">Call 112 (India)</a>
            </Button>
          </div>
        )}
        {done ? (
          <>
            <h2>Your symptom summary</h2>
            <dl className="space-y-4">
              {questions.map((q, i) => (
                <div key={q}>
                  <dt className="text-xs text-muted-foreground">{q}</dt>
                  <dd className="text-sm mt-1">{answers[i]}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-muted-foreground my-6">
              These answers cannot confirm a condition. Seek medical assessment for severe,
              persistent or worsening symptoms. Your assistant can explain possible causes and
              discuss safe next steps.
            </p>
            {user ? (
              <Button disabled={busy || emergency} onClick={review}>
                <Stethoscope />
                {busy ? "Saving..." : "Discuss this with my assistant"}
              </Button>
            ) : (
              <Button asChild>
                <Link to="/auth">Sign in to discuss your assessment</Link>
              </Button>
            )}
            <Button variant="ghost" className="ml-3" onClick={() => setStep(0)}>
              Review answers
            </Button>
          </>
        ) : (
          <>
            <p className="text-xs text-primary mt-7">STEP {step + 1} OF 7</p>
            <h2>{questions[step]}</h2>
            {step === 2 || step === 3 || step === 5 ? (
              <div className="flex flex-wrap gap-3">
                {(step === 2
                  ? ["Mild", "Moderate", "Severe"]
                  : step === 3
                    ? ["Improving", "About the same", "Getting worse"]
                    : ["No", "Yes", "Not sure"]
                ).map((v) => (
                  <Button
                    key={v}
                    variant={answers[step] === v ? "default" : "outline"}
                    onClick={() => answer(v)}
                  >
                    {v}
                  </Button>
                ))}
              </div>
            ) : step === 6 ? (
              <Input
                aria-label="Age"
                type="number"
                min={0}
                max={120}
                value={answers[step]}
                onChange={(e) => answer(e.target.value)}
                placeholder="Age in years"
              />
            ) : (
              <Textarea
                aria-label="Symptom answer"
                value={answers[step]}
                onChange={(e) => answer(e.target.value)}
                placeholder={
                  step === 0
                    ? "For example: a headache and a runny nose"
                    : step === 1
                      ? "For example: two days ago"
                      : "Include anything else you noticed, or say none"
                }
                className="min-h-32"
              />
            )}
            <div className="flex justify-between mt-8">
              <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft />
                Back
              </Button>
              <Button
                disabled={!answers[step]?.trim() || emergency}
                onClick={() => setStep((s) => s + 1)}
              >
                {step === 6 ? "See summary" : "Continue"}
                <ArrowRight />
              </Button>
            </div>
          </>
        )}
      </div>
    </Shell>
  );
}
