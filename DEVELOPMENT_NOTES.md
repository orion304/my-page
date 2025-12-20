# Development Journey

## Overview
Document for tracking development thoughts, decisions, and the evolution of the ASL Vocab Trainer project.

---

## Current Goals

### Completed ✓
1. **Keyboard shortcuts**: Add keyboard navigation for hands-free operation
   - Spacebar to reveal/hide sign
   - Arrow keys (or other keys) for correct/wrong responses
   - Eliminate need for mouse clicks during practice

2. **Chinese vocabulary trainer** (Phase 1 - Individual Language Support)
   - Created landing page for language selection (index.html)
   - Implemented chinese.html trainer with text input-based testing
   - Built chinese_dictionary.json with 11 starter words (hanzi, pinyin, zhuyin, IPA, english)
   - Random field prompting: Shows one field (hanzi/pinyin/zhuyin/english), user fills in other three
   - Answer checking with visual feedback (green=correct, red=wrong, shows expected values)
   - Same state progression as ASL (not_started → learning → learned)
   - Google Drive integration with separate storage for Chinese dictionary
   - Keyboard shortcuts adapted for Chinese workflow

### Short-term Goals
1. **Expand vocabulary data**: Incorporate all 60 lessons worth of ASL vocabulary into the trainer
2. **Lesson tracking**: Implement system to track which lessons have been completed/learned
3. **Progressive lesson unlock**: Add ability to add words from the next lesson into the active word pool
4. **Review mode**: Create a review feature for learned vocabulary
   - Option to review X random words from learned set
   - Option to review all learned words

### Stretch Goals
1. **Spaced repetition system (SRS)**: Implement algorithm to schedule reviews based on retention (like Anki)
   - Words you struggle with appear more frequently
   - Words you know well appear less often
   - Optimal learning efficiency

2. **Live deployment status indicator**: Poll GitHub Pages API to detect when new deployments are ready
   - Would use `/repos/orion304/my-page/pages/builds/latest` endpoint
   - Show notification when new version is deployed
   - Note: Limited to 1 request/minute without authentication (60/hour rate limit)
   - Not worth implementing with token auth for this use case

### Long-term Goals: Multi-Language Support

**Phase 1 - Individual Language Support**
1. **Chinese vocabulary trainer**
   - Dictionary structure per word: hanzi, pinyin, zhuyin, IPA, english meaning
   - Same learning mechanics as ASL (state tracking, progress, review mode)

2. **French vocabulary trainer**
   - Dictionary structure per word: french word, gender (m/f/n), IPA, english meaning
   - Same learning mechanics as ASL

3. **Language switching**
   - User can select which language to study
   - Independent progress tracking per language
   - Separate Google Drive files or unified format with language tags

**Phase 2 - Cross-Language Integration**
- **Multi-language simultaneous testing**: Present a word from one language and require identification across multiple languages
  - Example: Prompt "chien" → User must identify: "dog" (English), "masculine" (gender), "狗/gǒu" (Chinese)
  - Requires linking vocabulary entries across languages via concept mapping
  - New data structure needed: concept IDs that link equivalent words across languages

**Architectural Considerations**
- Need flexible dictionary schema to support different language requirements
- Consider unified data model vs. language-specific models
- Cross-language concept mapping will require either manual tagging or external API (translation/concept linking)

---

## Ideas & Brainstorming

### Chicago Skyline Interactive Map
**Goal**: Display Chicago skyline photos taken from balcony with interactive clickable regions

**Features**:
- Display one or more skyline photos (e.g., `Chicago_evening_SW_skyline.jpg`)
- Use HTML image maps or SVG overlay to define clickable building regions
- Hover over buildings to highlight them
- Click to open link to building information (Wikipedia, architecture sites, etc.)
- Could include multiple views (different times of day, seasons)

**Technical Approach**:
- HTML `<map>` and `<area>` tags for clickable regions (simple approach)
- Or SVG overlay with polygon regions (more flexible, responsive)
- Tooltip on hover showing building name
- Links open in new tab to external resources

**Note**: Existing code for this feature exists in prior commits (see commit `74319fc` - "Added another map and some placeholders for future additional views")

---

## Technical Decisions

### Decision Log
| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
|      |          |           |                        |

---

## Challenges & Solutions


---

## Next Steps


---

## Notes & Observations


---

## Questions & Research


