import {
    asciifySkill,
    renderOpenClawGuideMarkdown,
} from "../../../lib/shortcodes";
import { openclawBootstrap } from "../../../lib/site";

export function GET() {
    const content = `---\nname: '${openclawBootstrap.skill.name}'\ndescription: '${openclawBootstrap.skill.description}'\n---\n\n${renderOpenClawGuideMarkdown("en")}\n`;
    return new Response(asciifySkill(content), {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
    });
}
