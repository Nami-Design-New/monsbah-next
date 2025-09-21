export const dynamic = "force-dynamic";

export async function GET() {
  const lines = [
    "User-agent: *",
    "Allow: /",
    "Sitemap: https://monsbah.com/sitemap.xml",
  ];

  return new Response(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
    },
  });
}
