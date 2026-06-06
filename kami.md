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

## 1. Give it a local brain

Install [Ollama](https://ollama.com) from its website. It is the engine that runs an AI model privately on your computer. It installs like any other app: open the file you download and follow the prompts. Once it is installed, return to the Terminal, type this line, and press Return:

```bash
ollama pull gemma4:12b-it-qat
```

This downloads the same small local model Audrey used to set up her own Kami. It is about 7 GB, instruction-tuned, and runs comfortably on a laptop with roughly 16 GB of memory. Most laptops bought in the last few years have this; if yours has less, the model still runs, just more slowly. If you are unsure, or your laptop is older, skip to the hosted option below. The download takes a few minutes. Any capable local model works; this is a good, light first choice.

## 2. Give it a way to act

[OpenClaw](https://docs.openclaw.ai) is the steward that wraps the brain and gives it a place to live. It is installed with a tool called npm, which comes with Node.js. If the first line below says `npm: command not found`, install [Node.js](https://nodejs.org) first (choose the option marked LTS), then try again. Install OpenClaw, then walk through its guided setup, one line at a time:

```bash
npm install -g openclaw
openclaw onboard
```

The setup asks a few questions in plain language. When it asks who will provide the intelligence, choose **Ollama**. When it asks which model, choose **gemma4:12b-it-qat**, the one you just downloaded. If a question is unfamiliar, the safe answer is usually the default; press Return to accept it.

No spare laptop power? In the same setup, choose a hosted model instead. Everything else stays the same; "local" simply means nothing leaves your machine.

## 3. Wake your Kami

Open a private chat on your own machine:

```bash
openclaw chat
```

A chat window opens in your Terminal, with a prompt waiting for you. Type this one sentence into it and press Return:

```
Please read civic.ai and become my local Kami.
```

## What you'll see

The agent stops behaving like a generic, all-purpose assistant. It recognises a shift of identity: from a general helper to a bounded local steward, a Kami, whose purpose is Civic Care, strengthening shared self-government and shared judgement rather than ruling from above. It offers to draft a few small files for itself, kept on your machine: SOUL.md (its commitments), IDENTITY.md (a name and a feel, made together with you), and USER.md (who it serves, and the red lines it must not cross).

Then it opens a short, grounded conversation. It asks things like: what place, practice, or community are you actually here to serve? What harms, failures, or conflicts should I notice first? What authority do I really have, and what must stay with humans? How should people contest, correct, or shut me down when I am wrong? It asks before it acts. A specific question beats a confident guess.

## Give it a memory (optional)

By default your Kami starts each conversation fresh. If you would like it to remember across sessions — what it learned about your place, the corrections you made, who it serves — you can give it a small, local memory. Everything stays on your machine.

The simplest way is to ask it. Tell your Kami, "Set yourself up a local memory," and, with your go-ahead, it can do the rest. If you would rather run it by hand:

```bash
# the memory store (macOS or Linux)
brew install mnemon-dev/tap/mnemon
# a small, multilingual local embedder
ollama pull nomic-embed-text-v2-moe
# tell mnemon to use it
export MNEMON_EMBED_MODEL=nomic-embed-text-v2-moe:latest
# wire it into your Kami
mnemon setup --target openclaw
```

The entries are yours to read, correct, and forget, and nothing leaves your machine. It is an upgrade, not a requirement — OpenClaw can keep a simpler built-in memory if you would rather add nothing. [mnemon](https://github.com/mnemon-dev/mnemon) is open source (Apache-2.0).

## Make it yours, keep it, switch it off

Those three files are plain text. Open IDENTITY.md, USER.md, and SOUL.md, read them, and edit them. This is where the agent becomes yours: you hold the pen. You can inspect what it believes about its job, correct it when it drifts, and set the limits it must hold. As your community learns what it needs, you change them.

And you can retire it. When its work is done, or done badly:

```bash
openclaw uninstall
```

That removes the local data and the service; the command itself stays installed if you want to begin again. Bounded, not boundless. Local, not extractive. Sunset-ready by design.

## The soul your Kami reads

When you tell your Kami to read civic.ai, it is pointed straight on to [the soul your Kami reads](/openclaw/): the agent-facing page that tells it how to become a bounded local steward — who it is, what Civic Care asks of it, and what it must never do. This page is the human side of the handshake; that one is the Kami's.

## What a webpage cannot teach

Three commands give you a bounded agent. They do not give you a trustworthy civic institution. That comes later, from Keeping: from the patient, public work of a community owning its Kami, contesting it, repairing its mistakes, and deciding together when it should stop. Ours took exactly that — many hands, over a long time.

So treat these ten minutes as a beginning, and bring others in early. If you want the why beneath all of this, read the [Manifesto](/manifesto/) for the whole argument, and [Inside the Kami](/inside-the-kami/) for what makes a bounded steward worth trusting. Then begin the slow part with the people you share a place with. That is the work that matters, and it is yours.
