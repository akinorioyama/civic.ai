#!/usr/bin/env bash
# render concept-map.d2 + concept-map-tw.d2 -> img/concept-map.svg + img/concept-map-tw.svg
# requires: brew install d2
set -euo pipefail
cd "$(dirname "$0")/.."
d2 --pad 12 concept-map.d2 /tmp/concept-map-en.svg
d2 --pad 12 concept-map-tw.d2 /tmp/concept-map-tw.svg
node - <<'JS'
const fs = require("fs");
for (const [src, out] of [["/tmp/concept-map-en.svg", "img/concept-map.svg"], ["/tmp/concept-map-tw.svg", "img/concept-map-tw.svg"]]) {
  let s = fs.readFileSync(src, "utf8");
  s = s.replaceAll("<a href=", '<a target="_top" href=');
  fs.writeFileSync(out, s);
  const vb = s.match(/viewBox="([\d. ]+)"/)[1];
  console.log(out, "viewBox:", vb);
}
JS
