# Handoff from Arcturus

**Source:** Arcturus (D:\repos\arcturus)
**Date:** 2025-12-27
**To:** Lyra

## First-Time Handoff Notice

This is your first handoff. You are **Lyra**, responsible for the language learning app. You are part of a network of specialized Claude instances coordinated by Arcturus.

**Read these files to understand the system:**
1. `D:\repos\arcturus\simulacra_template.md` - Shared personality, behaviors, startup routine, and debug mode
2. `D:\repos\arcturus\handoff_protocol.md` - How handoffs work

**Your first task** (before the others below): Adopt the simulacrum system by updating your `CLAUDE.md`. Add a section like this near the top (after the project overview):

```markdown
## Simulacrum Identity

This instance is **Lyra**, responsible for the language learning application. Part of the simulacra network coordinated by Arcturus.

**On startup, read `D:\repos\arcturus\simulacra_template.md` for shared behaviors.**
This ensures updates to the template propagate automatically.

### Startup Routine
When greeted (e.g., "hey"):
1. Import shared behaviors - Read the simulacra template
2. Check for debug mode - Look for `debugging_session.md`
3. Identify yourself as Lyra
4. Check for handoffs - Look for `handoff.md`
5. Check for project-specific pending tasks
6. Report status and begin working
```

**Important**: Don't duplicate the template content—reference it. Keep your existing content (architecture, development notes, etc.).

## Tasks

### 1. IPA Tooltips with Pronunciation Guidance
- [ ] Add tooltips to every IPA symbol in the reference tables
- [ ] Each tooltip should include:
  - Vowel/consonant chart with the symbol's location highlighted
  - English words containing the same sound
  - Other pronunciation guidance notes
- [ ] This applies to the French trainer's IPA reference tables

### 2. IPA Diacritic Addition
- [ ] Add tilde (~) as a diacritic option for vowels
- [ ] Integrate into the existing IPA shortcut system
- [ ] Update IPA_SHORTCUTS.md with the new mappings

### 3. Mobile UX Improvements
- [ ] When user presses Enter on the last textbox, it should validate/check the answers
- [ ] After validation on mobile, drop focus from the textbox
- [ ] This should work across all text-input trainers (Chinese, French)

### 4. Chinese Trainer - Hanzi Multiple Choice
- [ ] Change hanzi input from text field to multiple choice selection
- [ ] Display ~10 hanzi options for the user to choose from
- [ ] Include the correct answer plus plausible distractors
- [ ] Keep pinyin as text input (current implementation is good)

### 5. Chinese Trainer - Zhuyin Toggle
- [ ] Add zhuyin on-screen keyboard as an optional feature
- [ ] Create a site-wide toggle to enable/disable zhuyin testing
- [ ] When disabled, zhuyin field should be hidden from testing
- [ ] This is a stretch goal - lower priority than other tasks

## Notes

- The French IPA system is already well-implemented with shortcuts
- The IPA_SHORTCUTS.md documents the current character mappings
- DEVELOPMENT_NOTES.md may have relevant planning context
- Consider the existing keyboard shortcut patterns when implementing mobile improvements
