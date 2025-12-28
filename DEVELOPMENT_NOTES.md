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

### Active Tasks (from Arcturus handoff 2025-12-27)

**Priority 0: French Article Handling** ⚠️ HIGH PRIORITY
- [ ] Combine articles with French words when French is an answer field
- [ ] When prompted "dog", user types "le chien" or "un chien" in French field
- [ ] When prompted "chien", user types "le" or "un" in separate article field
- [ ] Accept BOTH definite (le/la) and indefinite (un/une) articles as correct
- [ ] For elision words, user types non-contracted form ("la orange" not "l'orange")
- **Implementation notes**:
  - Article field shows ONLY when French is the prompt (currentPromptField === 'french')
  - When French is answer field: validate as "le/un word" or "la/une word"
  - When French is prompt: validate article field accepts le/un (m) or la/une (f)
  - No elision detection needed - always require article for gendered words

**Priority 0: French Diacritics Input System** ✓ COMPLETED
- [x] Add French accent shortcuts for the French word input field
- [x] Similar to pinyin tone system in Chinese trainer
- **Implemented shortcuts** (`french-trainer.js:195-241`):
  - `e'` → é (acute)
  - `e`` → è, `a`` → à, `u`` → ù (grave)
  - `e^` → ê, `a^` → â, `u^` → û, `o^` → ô, `i^` → î (circumflex)
  - `e:` → ë, `i:` → ï, `u:` → ü (diaeresis)
  - `c,` → ç (cedilla)
  - `oe1` → œ, `ae1` → æ (ligatures)
- Uppercase variants also supported

**Priority 0: Disable Zhuyin on Front End (Temporary)**
- [ ] Hide zhuyin field from Chinese trainer testing
- [ ] Quick fix until full toggle system is built
- **Implementation notes**:
  - In `chinese-trainer.js:448`, change fields array from `['hanzi', 'pinyin', 'zhuyin', 'english']` to `['hanzi', 'pinyin', 'english']`
  - Single line change, immediately effective

**Priority 1: Mobile UX Improvements**
- [ ] Enter on last textbox validates/checks answers
- [ ] After validation on mobile, drop focus from textbox (prevents keyboard popping up)
- **Scope**: French and Chinese trainers
- **Implementation notes**:
  - French: Already has Enter handling in input fields (`french-trainer.js:149-159`)
  - Need to detect "last visible input field" and trigger validation
  - After `checkAnswers()`, call `document.activeElement.blur()` to drop focus
  - Consider using `inputmode` attribute for better mobile behavior

**Priority 2: Chinese Trainer - Hanzi Multiple Choice**
- [ ] Change hanzi input from text field to multiple choice (~10 options)
- [ ] Include correct answer plus plausible distractors
- [ ] Keep pinyin as text input
- **Implementation notes**:
  - Only affects hanzi field when it's one of the answer fields (not the prompt)
  - Distractors: Use other hanzi from dictionary, or generate similar-looking characters
  - UI: Grid of buttons or clickable cards
  - Need to track selected answer before checking
  - Consider: Visual similarity algorithm for better distractors

**Priority 3: IPA Tooltips with Pronunciation Guidance**
- [ ] Add tooltips to every IPA symbol in French trainer reference tables
- [ ] Each tooltip should include:
  - Vowel/consonant chart with symbol's location highlighted
  - English words containing the same sound
  - Other pronunciation guidance notes
- **Implementation notes**:
  - Current tables are in `french.html:72-366`
  - Options: CSS tooltips (simple), or JS-powered with rich content
  - For chart highlighting, could use small inline SVG or ASCII art
  - Data source: Create IPA_PRONUNCIATION_DATA.js with tooltip content per symbol
  - Consider: Mobile-friendly touch activation for tooltips

**Priority 4: Tilde (~) Diacritic for Nasalized Vowels**
- [ ] Add tilde as a diacritic option in IPA shortcut system
- [ ] Update IPA_SHORTCUTS.md with new mappings
- **Implementation notes**:
  - Approach: Detect vowel+~ and convert to vowel + combining tilde (U+0303)
  - Nasalizable vowels: all base vowels plus IPA vowel variants (ɑ, æ, ɐ, ə, ɛ, ɜ, etc.)
  - Add after the existing letter+number conversions in `convertIPA()`
  - Example: `a~` → `ã`, `ɛ~` → `ɛ̃`

**Priority 5 (Stretch): Chinese Trainer - Zhuyin Toggle**
- [ ] Add zhuyin on-screen keyboard as optional feature
- [ ] Create site-wide toggle to enable/disable zhuyin testing
- [ ] When disabled, hide zhuyin field from testing
- **Implementation notes**:
  - Toggle could be stored in localStorage
  - Keyboard: Array of zhuyin symbols in standard layout
  - When toggle off, filter 'zhuyin' from the fields array in `showRandomWord()`
  - Consider: Settings page or per-trainer settings

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


