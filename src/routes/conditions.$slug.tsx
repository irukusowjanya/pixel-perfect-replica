import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bookmark, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import { conditions } from "@/features/health/conditions";
import { useSession } from "@/features/health/session";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/conditions/$slug")({
  loader: ({ params }) => {
    const c = conditions.find((c) => c.slug === params.slug);
    if (!c) throw notFound();
    return c;
  },
  head: ({ loaderData }) =>
    healthHead(
      loaderData?.name ?? "Health condition",
      loaderData?.overview ?? "Explore safe health information with Carewise.",
    ),
  component: Detail,
});
function Detail() {
  const c = Route.useLoaderData();
  const { user } = useSession();
  async function save() {
    if (!user) return;
    const { error } = await supabase
      .from("saved_conditions")
      .upsert(
        { user_id: user.id, condition_slug: c.slug },
        { onConflict: "user_id,condition_slug" },
      );
    if (error) toast.error("Unable to save condition.");
    else toast.success("Saved to your health information.");
  }
  return (
    <Shell>
      <div className="condition-detail">
        <Link to="/conditions" className="text-primary text-xs flex gap-2 items-center">
          <ArrowLeft size={14} />
          All conditions
        </Link>
        <p className="text-primary text-xs mt-7">{c.category}</p>
        <div className="flex justify-between gap-4 mt-3">
          <h1 className="page-heading">{c.name}</h1>
          {user ? (
            <Button variant="outline" onClick={save}>
              <Bookmark />
              Save
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link to="/auth">Sign in to save</Link>
            </Button>
          )}
        </div>
        <h2>Overview</h2>
        <p>{c.overview}</p>
        <h2>Common signs and symptoms</h2>
        <ul>
          {c.symptoms.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        <h2>Causes and risk factors</h2>
        <p>{c.causes}</p>
        <h2>Diagnosis, types and stages</h2>
        <p>
          A clinician assesses symptoms, medical history and examination findings. Tests and
          classification depend on the condition; symptoms alone cannot confirm a diagnosis. See the
          source below for condition-specific details.
        </p>
        <h2>Treatment and medication information</h2>
        <p>{c.care}</p>
        <p>
          Prescription treatment is individualized. Ask a clinician or pharmacist about benefits,
          interactions and side effects; do not start, stop or change a prescription based on this
          page.
        </p>
        <h2>Home care, food and prevention</h2>
        <p>
          Keep regular sleep, meals and activity suited to your health. A varied diet supports
          overall health, but no food is a cure. Condition-specific dietary restrictions should be
          discussed with your clinician.
        </p>
        <h2>Warning signs and when to seek care</h2>
        <p>{c.warning}</p>
        <h2>Complications and next steps</h2>
        <p>
          Complications vary with the cause and severity. Timely assessment and follow-up can reduce
          risks. Arrange a medical visit if symptoms interfere with daily life or do not improve.
        </p>
        <h2>Frequently asked questions</h2>
        <details className="border-b py-4">
          <summary className="text-sm cursor-pointer font-medium">
            Can I diagnose this from my symptoms?
          </summary>
          <p className="mt-3">
            No. Different conditions can share symptoms. A healthcare professional can assess what
            applies to you.
          </p>
        </details>
        <details className="border-b py-4">
          <summary className="text-sm cursor-pointer font-medium">Where can I read more?</summary>
          <p className="mt-3">
            Use the NHS source below for more detailed information, and discuss your personal
            circumstances with a clinician.
          </p>
        </details>
        <h2>Trusted medical source</h2>
        <a
          className="text-primary text-sm inline-flex gap-2 items-center"
          href={c.source}
          target="_blank"
          rel="noreferrer"
        >
          NHS: {c.name}
          <ExternalLink size={14} />
        </a>
        <p className="mt-4 text-xs">
          This is a starter educational summary, not a clinically reviewed or exhaustive disease
          database.
        </p>
      </div>
    </Shell>
  );
}
