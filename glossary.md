---
layout: chapter
title: "Glossary"
lang: en-gb
alt_lang_url: "/tw/glossary"
permalink: "/glossary/"
summary: "Plain-language definitions of the key terms used across Civic AI and the 6-Pack of Care."
nav_prev:
    url: "/faq/"
    text: "FAQ"
nav_next:
    url: "/"
    text: "Home"
---

<dl class="glossary-list">
{% for t in glossary %}
<dt id="{{ t.id }}">{{ t.term_en }}</dt>
<dd>{{ t.def_en }}</dd>
{% endfor %}
</dl>
