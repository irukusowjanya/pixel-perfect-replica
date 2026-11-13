import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import nutrition from "@/assets/nutrition.jpg";
export const Route = createFileRoute("/articles")({
  head: () =>
    healthHead(
      "Health awareness",
      "Simple, evidence-informed ideas for everyday nutrition, movement and wellbeing.",
    ),
  component: Articles,
});
function Articles() {
  return (
    <Shell>
      <h1 className="page-heading">Small steps. Better wellbeing.</h1>
      <p className="page-subtitle">A little perspective for your everyday health.</p>
      <article className="condition-detail mt-8">
        <img
          src={nutrition}
          width={1024}
          height={768}
          alt="Fresh fruit, leafy greens and avocado"
          className="w-full max-h-80 object-cover rounded-lg"
        />
        <h2>Everyday foods for a healthier, happier you</h2>
        <p>
          A varied diet provides nutrients your body needs. Include vegetables, fruit, whole grains,
          beans and suitable sources of protein. Choose unsaturated fats and limit foods high in
          salt, free sugars and saturated fats.
        </p>
        <p className="mt-3">
          No single food prevents or cures disease. If you have diabetes, kidney disease, food
          allergies or another condition, a clinician or registered dietitian can help you find an
          appropriate eating pattern.
        </p>
        <a
          href="https://www.nhs.uk/live-well/eat-well/"
          target="_blank"
          rel="noreferrer"
          className="text-primary text-sm block mt-4"
        >
          Source: NHS — Eat well ↗
        </a>
        <h2>Movement that fits your day</h2>
        <p>
          Start with activity that feels achievable and suits your abilities. A walk, gentle
          stretching or a short movement break can be a useful first step. Ask for medical advice
          before a new exercise routine if you have concerning symptoms or an existing health
          condition.
        </p>
        <a
          href="https://www.nhs.uk/live-well/exercise/"
          target="_blank"
          rel="noreferrer"
          className="text-primary text-sm block mt-4"
        >
          Source: NHS — Exercise ↗
        </a>
        <h2>A mindful moment</h2>
        <p>
          Take a quiet pause and breathe comfortably. Regular sleep routines and time with
          supportive people can help wellbeing. Persistent anxiety or low mood deserve professional
          support.
        </p>
        <a
          href="https://www.nhs.uk/every-mind-matters/"
          target="_blank"
          rel="noreferrer"
          className="text-primary text-sm block mt-4"
        >
          Source: NHS — Every Mind Matters ↗
        </a>
      </article>
    </Shell>
  );
}
