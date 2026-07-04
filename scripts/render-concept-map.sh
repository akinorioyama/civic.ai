#!/usr/bin/env bash
# render concept-map.d2 -> img/concept-map.svg (EN) + img/concept-map-tw.svg (TW)
# requires: brew install d2
set -euo pipefail
cd "$(dirname "$0")/.."
d2 --pad 12 concept-map.d2 /tmp/concept-map-d2.svg
node - <<'JS'
const fs = require("fs");
let s = fs.readFileSync("/tmp/concept-map-d2.svg", "utf8");
s = s.replaceAll("<a href=", '<a target="_top" href=');
let tw = s.replace(/(x?l?i?n?k?:?href=")(\/(?:[1-6]|measures|glossary)\/)/g, "$1/tw$2");
tw = tw.replaceAll("/tw/measures/#named-instruments", "/tw/measures/#\u5177\u540d\u5de5\u5177");
fs.writeFileSync("img/concept-map.svg", s);
fs.writeFileSync("img/concept-map-tw.svg", tw);
console.log("written img/concept-map.svg + img/concept-map-tw.svg");
JS
