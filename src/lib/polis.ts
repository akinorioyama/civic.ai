import loadPolisCareDeliberation from "../../_data/polis_care_deliberation.js";
import polisCareUi from "../../_data/polis_care_ui.js";

export { polisCareUi };

export async function getPolisCareDeliberation() {
    return await loadPolisCareDeliberation();
}
