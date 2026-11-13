export const healthHead = (title: string, description: string) => ({
  meta: [
    { title: `${title} · Carewise` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} · Carewise` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ],
});
