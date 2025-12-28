# Handoff from Arcturus

**Source**: Arcturus (central coordinator)
**Date**: 2025-12-27
**First Handoff**: Possibly - check if simulacrum identity is already set up

## Context

The user has requested French language learning improvements for the language app. This is part of ongoing work to enhance the multilingual learning experience.

## Tasks

### 1. French Article Handling
Modify the French section so that:
- Articles are combined with words in prompts (e.g., if prompted "dog", user can type "le chien" or "un chien")
- Accept **both** definite and indefinite articles as correct answers
- **Exception**: Keep contractions like "l'ami" separate (don't require the article). This simplifies code and improves gender-awareness testing since the user loses the gender cue when typing contractions correctly.

### 2. Diacritic Input Support
Implement ASCII substitution for French diacritics to make typing easier:
- `e'` → `é`
- `e`` → `è`
- (Determine other logical mappings for ê, ë, à, ù, ç, etc.)

## Notes

- If this is your first handoff, see `handoff_protocol.md` in the arcturus repo for onboarding steps (create `.claude/local.md`, set up permissions, update your CLAUDE.md)
- For shared behaviors, see `simulacra_template.md` in the arcturus repo (path in your `.claude/local.md`)
- After completing tasks, archive this file to `completed_handoffs/` with date prefix

## User Instruction

Go to my-page, launch Claude, and say "hey"
