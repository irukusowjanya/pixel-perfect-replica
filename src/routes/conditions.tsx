import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useState } from "react";
import { Search, ArrowRight, BookOpen } from "lucide-react";
import { Shell } from "@/features/health/shell";
import { healthHead } from "@/features/health/meta";
import { conditions, categories } from "@/features/health/conditions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/conditions")({
  validateSearch: (s: Record<string, unknown>): { category?: string | undefined } => ({
    category: typeof s["category"] === "string" ? s["category"] : undefined,
  }),
  head: () =>
    healthHead(
      "Health conditions",
      "Explore understandable information across heart, respiratory, digestive, mental health and other health categories.",
    ),
  component: Conditions,
});
function Conditions() {
  const location = useLocation();
  const search = Route.useSearch();
  const [query, setQuery] = useState("");
  const category = search.category;
  const filtered = conditions.filter(
    (c) =>
      (!category || c.category === category) &&
      `${c.name} ${c.symptoms.join(" ")}`.toLowerCase().includes(query.toLowerCase()),
  );
  if (location.pathname !== "/conditions" && location.pathname !== "/conditions/") return <Outlet />;
  return (
    <Shell>
      <h1 className="page-heading">A little knowledge. A little clarity.</h1>
      <p className="page-subtitle">
        Explore our starter library of health conditions, with links to trusted sources.
      </p>
      <div className="relative mt-7 max-w-xl">
        <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
        <Input
          className="pl-10 h-11"
          placeholder="Search conditions or symptoms"
          aria-label="Search conditions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2 my-6">
        <Button asChild variant={!category ? "default" : "outline"} size="sm">
          <Link to="/conditions" search={{ category: undefined }}>
            All categories
          </Link>
        </Button>
        {categories.map((c) => (
          <Button asChild key={c} variant={category === c ? "default" : "outline"} size="sm">
            <Link to="/conditions" search={{ category: c }}>
              {c}
            </Link>
          </Button>
        ))}
      </div>
      <div className="condition-grid">
        {filtered.map((c) => (
          <Link
            to="/conditions/$slug"
            params={{ slug: c.slug }}
            key={c.slug}
            className="action-card"
          >
            <span className="icon-tile">
              <BookOpen size={18} />
            </span>
            <p>{c.category}</p>
            <strong className="text-base">{c.name}</strong>
            <p>{c.overview}</p>
            <span className="flex text-primary text-xs gap-2 mt-4">
              Learn more
              <ArrowRight size={14} />
            </span>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-muted-foreground py-8">No conditions match your search.</p>
      )}
    </Shell>
  );
}
