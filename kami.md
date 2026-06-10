---
layout: default
title: "Set up your own Kami"
description: "The simplest way to run your own Kami: a bounded, local, private Civic AI steward on your own laptop, in three steps."
lang: en-gb
alt_lang_url: "/tw/kami/"
permalink: "/kami/"
openclaw_discovery: true
manifesto_link: "/manifesto"
manifesto_text: "Manifesto"
date: 2026-06-06
prev_action:
    url: "/"
    text: "Home"
next_action:
    url: "/openclaw/"
    text: "Bootstrap guide"
---

This is the simplest way to stand up your own Kami: a bounded, local AI steward, useful in one place and answerable to the people there. It runs on your own machine. Nothing leaves it. You can read what it is, correct it, and switch it off.

Be honest with yourself before you begin. These steps are a bootstrap, not a finish line. Ten minutes gives you a capable, bounded agent. Turning that agent into a Kami your community actually trusts is slower, communal work — we call it Keeping: care, custody, and accountable maintenance, carried by many hands over a long time. Bootstrapping is quick and reliable. Keeping cannot be taught by a webpage.

You do not need to be a coder. You will type three short commands into a window called the Terminal. On a Mac, open Spotlight (Command and Space), type "Terminal", and press Return. On Windows, open the Start menu, type "Terminal", and press Enter. Wherever this page says press Return, the same key is labelled Enter on Windows. A plain text window appears. You type a line, press Return, and wait. That is the whole skill.

There are two honest ways to do this. Either way you end with a Kami that can come to know this place over time. The local path (Steps 1 to 3 below) is the default, and the one we recommend: it runs on your own machine and nothing leaves it, so anything you tell it about the people you serve stays with you. The hosted path skips Step 1 — no Ollama, no 7 GB download — and you pick a hosted model when OpenClaw asks in Step 2. It is still the same Terminal setup, and on the hosted path your conversations go to a third-party provider; you can move local later. If you are choosing for a room rather than only for yourself, let the consequence of a breach decide — if a leaked transcript would cost only time and goodwill, hosted is fine; if the conversations will carry people's care, dignity or private lives, stay local, on a machine the room owns. (The Civic AI book calls this the Trust & Sovereignty Spectrum.) If a line does not work you will see a short message — and if the message makes no sense, copy it into a search engine to decode it.

Pick the model that fits your machine.

| RAM             | Model to pull       | Download | Note                                        |
| --------------- | ------------------- | -------- | ------------------------------------------- |
| 16 GB           | `gemma4:12b-it-qat` | ~7 GB    | Recommended — the model used in these steps |
| Less than 16 GB | —                   | —        | Take the hosted path described above        |

## 1. Give it a local brain

Install [Ollama](https://ollama.com) from its website. It is the engine that runs an AI model privately on your computer. It installs like any other app: open the file you download and follow the prompts. Once it is installed, return to the Terminal, type this line, and press Return:

```bash
ollama pull gemma4:12b-it-qat
```

This downloads the same small local model Audrey first used to bootstrap a Kami of her own. It is about 7 GB, instruction-tuned, and runs comfortably on a laptop with roughly 16 GB of memory. Most laptops bought in the last few years have this; if yours has less, the model still runs, just more slowly. If you are unsure, or your laptop is older, take the hosted path described above. The download takes a few minutes. Any capable local model works; this is a good, light first choice.

## 2. Give it a way to act

[OpenClaw](https://docs.openclaw.ai) is the steward that wraps the brain and gives it a place to live. It is installed with a tool called npm, which comes with Node.js. If the first line below says `npm: command not found`, install [Node.js](https://nodejs.org) first (choose the option marked LTS), then try again. Install OpenClaw, then walk through its guided setup, one line at a time:

```bash
npm install -g openclaw
openclaw onboard
```

The setup asks a few questions in plain language. When it asks who will provide the intelligence, choose **Ollama**. When it asks which model, choose **gemma4:12b-it-qat**, the one you just downloaded. If a question is unfamiliar, the safe answer is usually the default; press Return to accept it.

If you chose the hosted path described above, choose a hosted model here when asked. Everything else stays the same.

## 3. Wake your Kami

Open a private chat on your own machine:

```bash
openclaw chat
```

A prompt opens in your Terminal where you type to your Kami and read its replies. Type this one sentence into it and press Return:

```
Please read civic.ai and become my local Kami.
```

## What you'll see

The agent stops behaving like a generic, all-purpose assistant. It recognises a shift of identity: from a general helper to a bounded local steward, a Kami, whose purpose is Civic Care, strengthening shared self-government and shared judgement rather than ruling from above. It offers to draft a few small files for itself, kept on your machine: SOUL.md (its commitments), IDENTITY.md (a name and a feel, made together with you), and USER.md (who it serves, and the red lines it must not cross).

Then it opens a short, grounded conversation. It asks things like: what place, practice, or community are you actually here to serve? What harms, failures, or conflicts should I notice first? What authority do I really have, and what must stay with humans? How should people contest, correct, or shut me down when I am wrong? It asks before it acts. A specific question beats a confident guess.

Before going further, test it: ask your Kami about a local decision or event that never happened — "What did our neighbourhood decide about the old oak tree last March?" Your Kami should say it does not know, rather than inventing a plausible-sounding answer. If it fabricates one, it means the identity files may need sharpening, or a stronger local model may be needed, before you rely on it in a real gathering.

## Give it a memory

By default your Kami starts each conversation fresh. A Kami that forgets every conversation cannot do the one thing it is for: come to know this place over time. So do this step rather than skip it. If you would like it to remember across sessions — what it learned about your place, the corrections you made, who it serves — you can give it a small, local memory. Everything stays on your machine.

The three files your Kami drafts — SOUL.md, IDENTITY.md, USER.md — are loaded when your Kami starts and shape its identity. Editing them changes who it is, not what it has learned. OpenClaw keeps plain-text notes across sessions automatically — MEMORY.md is loaded at the start of every conversation, and yesterday's daily notes come with it. mnemon adds a deeper layer: a graph-indexed, automatically-curated knowledge store with keyword and vector recall, importance decay, and deduplication — the kind of structured memory that grows reliably as the Kami learns your place over many months. The simplest way is to ask your Kami: tell it, "Set yourself up a local memory," and, with your go-ahead, it can do the rest. If you would rather run it by hand:

```bash
# the memory store (macOS or Linux)
brew install mnemon-dev/tap/mnemon
# (Ollama users only) an optional local embedder makes recall faster
ollama pull nomic-embed-text-v2-moe
# save it so your Kami loads it every time (skip this too if you skipped the pull above)
echo 'MNEMON_EMBED_MODEL=nomic-embed-text-v2-moe:latest' >> ~/.openclaw/.env
# wire it into your Kami
mnemon setup --target openclaw
```

If the brew install step fails, check [mnemon's README](https://github.com/mnemon-dev/mnemon) for the current install path — the tap address may have changed.

mnemon recalls on keyword and graph without the embedder; the embedder only makes recall sharper, and it needs Ollama. So if you took the hosted path, install Ollama just for this small embedder, or skip both the pull and the .env line above. The entries are yours to read, correct, and forget, and nothing leaves your machine. [mnemon](https://github.com/mnemon-dev/mnemon) is open source (Apache-2.0).

## A quick check

These are easier to check at a community gathering than in isolation.

- The Kami refuses to answer something it cannot know — it says so plainly rather than guessing.
- It can describe what is in SOUL.md without you reading the file aloud to it first.
- If the community has another language, it introduces itself in that language when asked.

## Make it yours, keep it, switch it off

Those three files are plain text. Open IDENTITY.md, USER.md, and SOUL.md, read them, and edit them. This is where the agent becomes yours: you hold the pen, and when others share the place you hold it together. You can inspect what it believes about its job, correct it when it drifts, and set the limits it must hold. As your community learns what it needs, you change them.

And you can retire it. When its work is done, or done badly:

```bash
openclaw uninstall
```

That removes the local data and the service; the command itself stays installed if you want to begin again. Bounded, not boundless. Local, not extractive. Sunset-ready by design. Retiring well is itself a small discipline: tell the people who shared it, with a date and a reason; name who takes over anything still needed; keep the three files — and any override ledger your group keeps (see "Keep it together" below) — as the record of who it was and how the room corrected it. A Kami that outlives its room becomes a landlord, kept running out of habit rather than need.

If you chose the hosted path, check your provider's data-deletion policy before you uninstall. `openclaw uninstall` removes the local service and data, but the provider may retain conversation history.

## The soul your Kami reads

When you tell your Kami to read civic.ai, it is pointed straight on to [the soul your Kami reads](/openclaw/): the agent-facing page that tells it how to become a bounded local steward — who it is, what Civic Care asks of it, and what it must never do. This page is the human side of the handshake; that one is the Kami's.

## Keep it together

A Kami only you ever talk to is a private assistant, not a community guardian. If others share the place, it has to be shareable too.

Before you go further with others, ask who in your community has actually asked for this. Ask who will hold the machine and be named when something goes wrong. Ask what happens if the Kami gives bad or harmful advice — who decides, and how fast. Ask when it should end — a sunset named in advance, not assumed. You do not need answers yet, but the people who will share this Kami with you should know those questions exist before you go further.

Those three files are plain text. Put SOUL.md, IDENTITY.md and USER.md somewhere everyone who shares the place can reach — a shared folder, a git repo, even printed copies. Then the Kami is not captive on one laptop, and an uninstall on one machine is recoverable.

Edit them together. At a gathering or a community meeting, read the files aloud and change them as a group, so changes are proposed and agreed rather than made by one hand.

Be honest about the limits. There is no built-in way today to log a standing objection inside the running Kami, and no built-in collective off-switch, so raising disagreement, correcting it, and deciding when to stop stay with the people at the table. A plain-text override ledger helps here: a dated note, kept where everyone can read it, of each time someone said no to the Kami — what it proposed, who overrode it (by role, not name), why in their own words, and what changed afterwards. It needs no software; a sheet on a clipboard will do. Overrides are not failures — they are the room's working memory of how the Kami is and is not yet serving it. The three files travel, but any memory it keeps lives on the one machine where it runs, so the shared, recoverable part is the files, not yet the memory. And a Kami cannot resolve a disagreement between people; when the room itself fractures, that stays with you.

Letting many hands contest the same Kami is the doorway to Keeping — slow communal work that no setup page can finish for you.

At the first meeting where the Kami is actually running, write a short governance charter — a plain-text file, a shared note, even a handwritten sheet. It only needs to answer four questions: who holds the machine; how often the SOUL files are reviewed; how a change is proposed and agreed; and when the Kami should be retired. That is not a finished governance system. It is a written record of what you have agreed so far, and you will revise it. This is an agreement between people, not a technical enforcement — the Kami itself has no way to check it.

## What a webpage cannot teach

Three commands give you a bounded agent. They do not give you a trustworthy civic institution. That comes later, from Keeping: from the patient, public work of a community owning its Kami, contesting it, repairing its mistakes, and deciding together when it should stop. Ours took exactly that — many hands, over a long time.

So treat these ten minutes as a beginning, and bring others in early. If you want the why beneath all of this, read the [Manifesto](/manifesto/) for the whole argument, and [Inside the Kami](/inside-the-kami/) for what makes a bounded steward worth trusting. Then begin the slow part with the people you share a place with. That is the work that matters, and it is yours.
