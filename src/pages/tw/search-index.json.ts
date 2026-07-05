import { getSearchEntries } from "../../lib/search";

export function GET() {
    return new Response(JSON.stringify(getSearchEntries("zh")), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300",
        },
    });
}
