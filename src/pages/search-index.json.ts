import { getSearchEntries } from "../lib/search";

export function GET() {
    return new Response(JSON.stringify(getSearchEntries("en")), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300",
        },
    });
}
