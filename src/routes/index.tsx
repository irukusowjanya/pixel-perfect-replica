import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/features/health/dashboard";
import { healthHead } from "@/features/health/meta";
export const Route = createFileRoute("/")({
  head: () =>
    healthHead(
      "Your health companion",
      "Understand your symptoms, explore health conditions, and find safe educational guidance with Carewise.",
    ),
  component: Dashboard,
});
