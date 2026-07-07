import { searchServer } from "@/lib/search";

export const dynamic = "force-dynamic";

const { GET: searchGET } = searchServer;

/**
 * Canonical Fumadocs search endpoint. Returns `SortedResult[]` — the exact
 * contract the default RootProvider search dialog fetches from `/api/search`.
 * Wrapped only to attach the site-wide Content-Signal header.
 */
export async function GET(request: Request): Promise<Response> {
  const response = await searchGET(request);
  const headers = new Headers(response.headers);
  headers.set("Content-Signal", "search=yes, ai-input=yes, ai-train=no");
  return new Response(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });
}
