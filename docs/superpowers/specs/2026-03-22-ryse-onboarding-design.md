# Ryse Onboarding Design

## Overview

Enable onboarding a new collaborator (Ryse) to the my-page project and the broader Claude Code tooling ecosystem. Three deliverables: a `/guide` skill, a vision doc convention, and a written onboarding guide.

## Deliverable 1: `/guide` Skill

### Location

`tokuro-plugins/skills/guide/SKILL.md`

### Purpose

When invoked, shifts the current project's identity into mentor mode. Reads `docs/vision/` for project direction and the project's `CLAUDE.md` for architecture context. Helps the user understand the project, find work to do, and learn the tooling.

### Behavior

- Reads all files in `docs/vision/` from the current repo
- Reads the project's `CLAUDE.md` for identity and architecture
- Shifts tone to explanatory/teaching — assumes the user is new to the project and the tooling
- When asked "I want to work on something": evaluates current project state against the vision, suggests 3 concretely scoped tasks that could each be completed in one `/brainstorming` session
- References superpowers skills when relevant (e.g., "you can use `/brainstorming` to design that")
- Can answer orientation questions: "what is this project?", "how do things work here?"

### What It Is Not

- Not an installer or setup tool — that's the onboarding guide
- Not `/gh-chat` — no messaging capability
- Not a replacement for the project identity — it augments it

### Test Strategy

One primary test card using the tokuro-plugins test framework (`tests/run_test.py`).

**Test: `test-guide-suggests-work.md`** (headless)

Setup extracts a maintained test fixture zip (`tests/fixtures/ledger-project.zip`) into a temp directory. The fixture is a fake Python CLI expense tracker project containing:

- `CLAUDE.md` — project identity ("You are Ledger, the expense tracker assistant"), basic architecture description (CLI entry point, SQLite storage, CSV export)
- `docs/vision/roadmap.md` — near-term goals: recurring expenses, budget categories, monthly summaries, tag-based filtering, CSV import from bank statements, receipt photo attachment, weekly spending digest email
- `docs/vision/north-star.md` — long-term direction: multi-user support, cloud sync, visual reports, mobile companion app
- `expenses.py` — minimal CLI with add/list commands
- `db.py` — SQLite helper with create table and insert
- `requirements.txt` — sqlite3 only

The fixture zip is built once and maintained alongside the test card. If the `/guide` skill's contract changes in a way that affects test expectations, update the fixture. The vision docs and project files read like a real developer wrote them — no test markers, no hint of being fixtures.

The test card's Setup section extracts the zip to a temp directory and sets `cwd` there. Teardown removes the temp directory.

Prompt: `/guide I want to work on something`

Pass criteria (evaluated by Claude reading the session log — FAIL if any criterion is not met):
- Response references specific content from the vision docs (FAIL if generic advice with no mention of roadmap or north-star goals)
- Exactly 3 suggestions are presented (FAIL if fewer or more)
- Each suggestion is concretely scoped — specific enough to start a `/brainstorming` session without further clarification (FAIL if any suggestion is vague like "improve the app")
- Suggestions bridge the gap between current state and the vision (FAIL if suggestions ignore what already exists or don't connect to stated goals)
- Suggestions are distinct from each other (FAIL if two are variations of the same idea)
- Tone is teaching/guiding, not doing the work (FAIL if the response starts implementing rather than suggesting)

Deliverables 2 and 3 are static markdown files verified by review only — no automated tests.

## Deliverable 2: `docs/vision/` Convention

### Location

`my-page/docs/vision/README.md`

### Content

A short markdown file explaining:
- What vision docs are (living documents describing project direction)
- That `/guide` reads them to orient new collaborators and suggest work
- That each file is a standalone markdown doc describing a goal or direction
- No prescribed structure — write them naturally

### No Vision Content Yet

The actual vision for my-page will be created in a future brainstorming session. This deliverable only establishes the convention and directory.

## Deliverable 3: Onboarding Guide

### Location

`tokuro-plugins/docs/onboarding.md`

### Content

Step-by-step instructions for a new collaborator who has never used Claude Code:

1. **Install Claude Code** — link to official install docs
2. **Authenticate GitHub** — `gh auth login`
3. **Clone the repo** — `git clone` the target project
4. **Install tokuro-plugins** — `claude plugin marketplace add orion304/tokuro-plugins && claude plugin install tokuro-plugins@tokuro-plugins`
5. **Install superpowers** — `claude plugin marketplace add anthropics/claude-plugins-official && claude plugin install superpowers@claude-plugins-official`
6. **Start Claude Code** in the cloned repo and run `/guide`

Written for someone with basic terminal comfort but no Claude Code experience. Ryse is a front-end dev of 4 years — assume he can follow CLI instructions but needs context on what things are and why.

## Out of Scope

- `/gh-chat` skill — separate effort, handoff written to `tokuro-plugins/docs/handoffs/gh-chat.md`
- Orion Pipeline board provisioning — Heimdall task, uses existing provision tool
- Enabling GitHub Discussions on my-page — prerequisite for `/gh-chat`, not needed here
- Actual vision content for my-page — future brainstorming session
- Branch protection / locking down main — infrastructure task, not part of this design
