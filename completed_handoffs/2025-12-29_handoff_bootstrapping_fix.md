# Handoff from Arcturus

**Source**: Arcturus
**Date**: 2025-12-29

## Context

Arcturus just fixed a bootstrapping problem: when you pull a repo on a new machine, the `simulacrum/` directory isn't there (it's gitignored), so you can't read the instructions on how to get it.

The solution is a minimal "First-Time Setup" section in each CLAUDE.md that shows how to clone the framework.

## Tasks

### 1. Clone the simulacrum framework
```bash
git clone https://github.com/orion304/simulacrum.git simulacrum
```

### 2. Add First-Time Setup to CLAUDE.md
Add this section after "Simulacrum Identity" but before your main content:

```markdown
## First-Time Setup

If the `simulacrum/` directory is missing (fresh clone or new machine):

\`\`\`bash
git clone https://github.com/orion304/simulacrum.git simulacrum
\`\`\`

This bootstraps the shared framework. All other instructions live in `simulacrum/simulacra_template.md`.
```

### 3. Verify your local config
Check that `.claude/local.md` exists and correctly points to arcturus. Should contain:
```markdown
# Local Configuration

Path to arcturus: `../arcturus/`
```

### 4. Archive the old handoff
There's a French language handoff from 2025-12-27 that was completed but never archived. Move it to `completed_handoffs/2025-12-27_handoff_french_improvements.md` before processing this one.

## Notes

This is the one piece of intentional duplication in the system - you need the instruction to get the instructions. See Arcturus CLAUDE.md:7-15 and simulacrum/simulacra_template.md:43 for reference.
