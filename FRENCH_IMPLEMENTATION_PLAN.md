# French Vocabulary Implementation Plan

## Overview
Expand the vocabulary trainer to support French. Users will select French from the landing page alongside ASL and Chinese.

**Status**: ✅ COMPLETED

---

## Implementation Summary

The French vocabulary trainer has been implemented with the following features:

### Completed Features

#### 1. Landing Page Integration ✅
- Added French language card to `index.html`
- French flag emoji 🇫🇷 with hover effects
- Blue border styling matching French flag colors
- Links to `french.html`

#### 2. French Word Object Structure ✅
Implemented JSON structure with all required fields:

```json
{
  "chien": {
    "french": "chien",
    "ipa": "/ʃjɛ̃/",
    "english": "dog",
    "gender": "m",
    "state": "not_started",
    "correctCount": 0,
    "lesson": "1"
  }
}
```

**Key fields**:
- `french`: The French word
- `ipa`: International Phonetic Alphabet pronunciation (with slashes)
- `english`: English translation/meaning
- `gender`: Grammatical gender - "m" (masculine), "f" (feminine), or blank for non-gendered words
- `state`, `correctCount`, `lesson`: Same progression system as ASL/Chinese

**Note**: French does not have neuter gender. Gender field is blank for words without grammatical gender.

#### 3. Initial French Dictionary ✅
Created `french_dictionary.json` with 41 curated French words including:
- Common nouns with genders (chien/m, chat/m, maison/f, etc.)
- Mix of masculine and feminine nouns
- Various word types covering essential vocabulary

Source: User-provided `frenchdict.txt` (tab-separated format)

#### 4. Testing Method ✅
**Implemented: Multi-field Input (Enhanced)**

Testing flow:
1. Randomly select one field as prompt (french, ipa, OR english)
2. Display the prompt field value
3. User inputs the other TWO fields PLUS gender (3 input fields total)
4. Click "Check Answers" or press Enter to validate
5. View feedback showing correct/incorrect for each field
6. Press Enter for "Got It" or Escape for "Didn't Get It"

**Example scenarios**:
- **Prompt: French** → User fills in: IPA, English, Gender
- **Prompt: IPA** → User fills in: French, English, Gender
- **Prompt: English** → User fills in: French, IPA, Gender

This method is more comprehensive than originally planned and tests all aspects of vocabulary knowledge.

#### 5. IPA Input System ✅
**Major Feature: Letter+Number Shortcuts**

Implemented real-time IPA character conversion using letter+number combinations:

**Examples**:
- `a1` → ɑ (a script)
- `e1` → ə (schwa)
- `e2` → ɛ (epsilon)
- `s1` → ʃ (sh sound)
- `z1` → ʒ (zh sound)
- `n1` → ŋ (eng)
- `r4` → ʁ (French uvular r)

**Features**:
- Real-time conversion as you type
- 80+ IPA character mappings
- Covers all vowels, consonants, stress markers, and length markers
- Cursor position preserved during conversion

**Reference Documentation**:
- Compact reference tables displayed directly under IPA input field
- Two-column layout (a-n on left, o-z on right)
- Shows base letter + numbered variants in grid format
- Auto-shows when IPA field is active
- See `IPA_SHORTCUTS.md` for complete reference

#### 6. French Trainer Interface ✅
Created complete French trainer with:

**Files**:
- `french.html` - Main trainer interface
- `french-trainer.js` - All trainer logic
- `french-trainer.css` - French-themed styling

**Styling**:
- Blue/Red gradient background (French flag colors: #0055A4, #EF4135)
- Blue accent colors throughout
- Responsive design for mobile/desktop
- Compact IPA reference tables with grid layout

**Features**:
- 3-field dynamic input system
- Real-time IPA character conversion
- Automatic slash stripping for IPA validation
- Visual feedback (green=correct, red=wrong)
- Progress tracking (Learning vs Learned)
- Session statistics (correct/wrong counts)
- Google Drive auto-save integration
- Default dictionary loading from GitHub
- Download updated dictionary option

**Keyboard Shortcuts**:
- **Enter** (in input field):
  - Before checking: Check answers
  - After checking: Mark as "Got It" (correct)
- **Escape** (in input field): Mark as "Didn't Get It" (wrong)
- **Arrow Right/Numpad2**: Mark correct (when not in input field)
- **Arrow Left/Backspace/Numpad3**: Mark wrong (when not in input field)
- **Auto-focus**: First input field automatically focused on each new word

**Google Drive Integration**:
- Separate storage: `french_dictionary.json`
- Separate auth token: `google_drive_token_french`
- Auto-save on progress changes
- Load on connection

---

## Technical Implementation Details

### IPA Character Conversion
Located in `french-trainer.js` (lines 194-262):

```javascript
const ipaCharMap = {
    'a1': 'ɑ', 'a2': 'æ', 'a3': 'ɐ', 'a4': 'ɑ̃',
    'e1': 'ə', 'e2': 'ɛ', // ... 80+ total mappings
    's1': 'ʃ', 'z1': 'ʒ',
    'r4': 'ʁ', // French uvular r
    'k1': 'ː', // length mark
    // ... complete mapping
};

function convertIPA(text) {
    // Real-time conversion with regex replacement
    // Preserves cursor position
}

function handleIPAInput(e) {
    // Attached to IPA input fields only
    // Converts on each input event
}
```

### IPA Reference Tables
Located in `french.html` (lines 64-361):

- Combined alphabetical table (a-z)
- Split vertically: left table (a-n), right table (o-z)
- 8 columns for number variants (1-8)
- Dynamically positioned after IPA input field
- JavaScript moves the table based on which field is IPA

### Answer Validation
Located in `french-trainer.js` (lines 509-545):

```javascript
function checkAnswers() {
    // Special handling for IPA field:
    // Strip slashes from both user input and expected answer
    if (fieldName === 'ipa') {
        userAnswer = userAnswer.replace(/^\/|\/$/g, '');
        expectedAnswer = expectedAnswer.replace(/^\/|\/$/g, '');
    }
    // Case-insensitive comparison for all fields
}
```

### Keyboard Workflow
Located in `french-trainer.js` (lines 142-190):

```javascript
// Enter in input field:
// - If check button visible: check answers
// - If judgment buttons visible: mark correct

// Escape in input field:
// - If judgment buttons visible: mark wrong

// Auto-focus on new word:
// inputField1.focus() called in showRandomWord()
```

---

## Files Created/Modified

### New Files
1. `french.html` - French trainer interface (413 lines)
2. `french-trainer.js` - French trainer logic (742 lines)
3. `french-trainer.css` - French trainer styles (501 lines)
4. `french_dictionary.json` - 41 French words with full metadata
5. `IPA_SHORTCUTS.md` - Complete IPA shortcut reference documentation

### Modified Files
1. `index.html` - Added French language card (lines 27-31)
2. `landing.css` - Added French card styling (lines 80-87)
3. `FRENCH_IMPLEMENTATION_PLAN.md` - This file (updated with implementation details)

---

## Deviations from Original Plan

### Changed Decisions

1. **Testing Method**:
   - **Planned**: Hybrid (2 fields - English + gender, IPA as reference)
   - **Implemented**: Full multi-field (3 fields - all combinations tested)
   - **Reason**: More comprehensive testing, user can practice IPA production

2. **IPA Handling**:
   - **Planned**: Reference display only
   - **Implemented**: Full input system with letter+number shortcuts
   - **Reason**: Enables IPA practice, similar to pinyin conversion in Chinese trainer

3. **Prompt Randomization**:
   - **Planned**: Always show French word
   - **Implemented**: Randomly show french, ipa, OR english
   - **Reason**: More varied practice, tests recall in multiple directions

4. **Gender Field**:
   - **Planned**: Radio buttons or dropdown
   - **Implemented**: Text input field
   - **Reason**: Simpler UI, faster keyboard entry, consistent with other fields

5. **Keyboard Shortcuts**:
   - **Planned**: Basic check/correct/wrong
   - **Implemented**: Enhanced with Enter=check+correct, Escape=wrong, auto-focus
   - **Reason**: Fully keyboard-driven workflow for faster practice

### Additional Features

1. **IPA Reference Tables**: Compact visual reference with real-time positioning
2. **Auto-focus**: First field automatically focused on new word
3. **Slash Stripping**: Automatic handling of IPA slashes for easier input
4. **Dynamic Table Positioning**: IPA reference follows IPA input field location

---

## User Workflow Example

1. Load French trainer from landing page
2. Connect to Google Drive (optional) or load default dictionary
3. First word appears (e.g., prompt shows "English: dog")
4. Cursor automatically in first input field
5. Type French word: `chien`
6. Tab to next field (or click)
7. Type IPA using shortcuts: `s1je7` → converts to `ʃjɛ̃`
   - IPA reference table shows under IPA field when focused
8. Tab to next field
9. Type gender: `m`
10. Press **Enter** to check answers
11. View feedback (green checkmarks or red X with corrections)
12. Press **Enter** if got it right, or **Escape** if didn't get it
13. Next word automatically loads with cursor in first field
14. Repeat

Fully keyboard-driven - no mouse needed!

---

## Future Enhancements

Potential improvements for French trainer:

1. **Article Practice**: Separate mode to practice le/la/l'/les/un/une
2. **Plural Forms**: Add plural tracking and testing
3. **Verb Conjugations**: Dedicated verb conjugation practice mode
4. **Audio Pronunciation**: Native speaker audio for each word
5. **Adjective Agreement**: Practice masculine/feminine/plural adjective forms
6. **Accent Input Helpers**: Quick shortcuts for é, è, ê, ë, à, ç, etc.
7. **Expanded Vocabulary**: Organize into themed lessons (food, animals, travel, etc.)
8. **IPA Audio Examples**: Hear the IPA sounds when hovering over reference table
9. **Spaced Repetition**: Smarter scheduling based on difficulty
10. **Conjugation Tables**: For verbs, show full conjugation reference

---

## Testing Notes

**Browser Compatibility**:
- Tested on modern browsers (Chrome, Firefox, Safari, Edge)
- IPA character display requires Unicode font support
- Google Drive integration uses Google Identity Services

**Mobile Support**:
- Responsive design adapts to mobile screens
- IPA reference tables stack vertically on small screens
- Touch-friendly button sizes
- Input fields disable autocorrect/autocapitalize for IPA

**Known Limitations**:
- IPA input requires memorizing letter+number shortcuts (reference table helps)
- No audio pronunciation yet
- Gender input is free text (could allow typos like "mm" or "male")
- No conjugation tracking for verbs

---

## Success Metrics

✅ French trainer fully functional
✅ 41-word starter dictionary implemented
✅ IPA input system with 80+ character mappings
✅ Comprehensive testing (all 3 fields testable)
✅ Keyboard-driven workflow (Enter/Escape shortcuts)
✅ Visual feedback and progress tracking
✅ Google Drive integration
✅ Mobile responsive design
✅ Auto-focus for seamless practice flow
✅ Complete documentation (this file + IPA_SHORTCUTS.md)

**User Feedback**: "This is a great first start, and it'll also be much easier for me to develop because I'm a lot more familiar with French than I am with Chinese. It also doesn't involve particularly foreign characters or different keyboards."

---

## Conclusion

The French vocabulary trainer has been successfully implemented with enhanced features beyond the original plan. The IPA input system with letter+number shortcuts and visual reference tables makes it practical to practice pronunciation notation. The fully keyboard-driven workflow enables efficient practice sessions without mouse interaction.

The implementation serves as a solid foundation for French language learning and can be easily extended with additional features like audio, conjugations, and themed vocabulary lessons.

---

## Next Steps / Planned Improvements

### 1. Fixed Field Order ✅ COMPLETED
**Previous Behavior**: Fields were randomly ordered - prompt could be French, IPA, or English, and input fields appeared in random positions.

**Implemented Behavior**:
- **Fixed order**: French → IPA → English (always in this order)
- One field will be the prompt (shown at top)
- The other two fields will be input fields (in consistent positions)

**Example**:
- If prompted with English "dog", input fields are: French (position 1), IPA (position 2)
- If prompted with IPA "/ʃjɛ̃/", input fields are: French (position 1), English (position 3)
- If prompted with French "chien", input fields are: IPA (position 2), English (position 3)

**Rationale**: Consistent field positions make it easier to develop muscle memory and speed up input.

---

### 2. Article Integration ✅ COMPLETED
**Previous Behavior**: Separate "gender" field that accepted "m", "f", or blank.

**Implemented Behavior**:
- Replace gender field with "article" field
- Article field is separate from French word field
- User enters article (le/la/l'/les/un/une/des) in article textbox
- Article and French word are validated independently

**Testing Scenarios**:

**Scenario A - Prompted with English "man"**:
- Prompt shows: "English: man"
- Input fields: [Article] [French word] [IPA]
- User types: "le" + "homme" + "/ɔm/"
- System validates article and word separately

**Scenario B - Prompted with French "homme"**:
- Prompt shows: "French: homme"
- Input fields: [Article] [IPA] [English]
- User types: "le" + "/ɔm/" + "man"
- Article is validated against expected article for "homme"

**Scenario C - Prompted with IPA "/ɔm/"**:
- Prompt shows: "IPA: /ɔm/"
- Input fields: [Article] [French word] [English]
- User types: "le" + "homme" + "man"

**Words Without Articles**:
- When French word has no article (gender field is blank), omit the article textbox entirely
- Example: verbs, adjectives without articles
- Only show: [French word] [IPA] [English]

**Implementation Notes**:
- Gender field retained in dictionary structure (m/f/blank)
- Frontend converts gender to expected article:
  - m → "le"
  - f → "la"
  - blank → hide article field
- No elision rules (always "le" or "la", never "l'")
- Simpler implementation, no dictionary migration needed

**Validation Logic**:
- Article and French word are checked as separate fields
- Each gets independent feedback (green checkmark or red X)
- Both must be correct for overall "correct" judgment

**Rationale**:
- Learning articles is crucial for French (gender/definiteness/number)
- Typing "le homme" is more natural than typing "m"
- Reinforces real-world usage patterns
- Validates article knowledge separately from word knowledge

---

### Implementation Summary

**Changes Made**:

1. **HTML (french.html)**:
   - Replaced 3 generic input groups with 4 named input groups
   - Added: `input-group-article`, `input-group-french`, `input-group-ipa`, `input-group-english`
   - Article field has class `article-input` for narrow styling

2. **CSS (french-trainer.css)**:
   - Added `.article-input { max-width: 100px; }` for narrow article field

3. **JavaScript (french-trainer.js)**:
   - Updated field references to use named fields instead of generic inputField1/2/3
   - Modified `showRandomWord()`:
     - Fixed field order (Article, French, IPA, English)
     - Show/hide fields based on prompt and whether word has gender
     - Convert gender to expected article (m→"le", f→"la")
     - Focus on first visible input field
   - Modified `checkAnswers()`:
     - Build dynamic list of visible fields to validate
     - Validate article field separately when visible
     - Maintain article-input class for correct/wrong styling
   - Modified `attachIPAConverter()`:
     - Simplified to always attach to inputFieldIpa
     - Position reference table after IPA group when visible
   - Modified `hideIPAReference()`:
     - Check activeElement directly instead of dataset.field

**Result**:
- Fixed, predictable field order for muscle memory
- Article validation separate from French word
- No dictionary changes needed
- Backward compatible (gender field retained)

**Future Enhancement Ideas**:
- Could add article validation hints (definite vs indefinite, singular vs plural)
- Could track article errors separately in statistics
- Could extend to support plural articles (les/des)

---

### 3. Embed Prompt Among Input Fields ⏳
**Current Behavior**: Prompt is displayed at the top in a separate "prompt display" area, then all input fields appear below.

**Desired Behavior**: Prompt should appear inline in its natural position among the input fields.

**Examples**:

**Scenario A - Prompted with English "man"**:
```
[Article textbox: ___] [French textbox: ___________]
[IPA textbox: ___________]
English: man
```
Order: Article input → French input → IPA input → English label (prompt)

**Scenario B - Prompted with French "homme"**:
```
[Article textbox: ___] French: homme
[IPA textbox: ___________]
[English textbox: ___________]
```
Order: Article input + French label (prompt) on same row → IPA input → English input

**Scenario C - Prompted with IPA "/ɔm/"**:
```
[Article textbox: ___] [French textbox: ___________]
IPA: /ɔm/
[English textbox: ___________]
```
Order: Article input → French input → IPA label (prompt) → English input

**Scenario D - No article word (e.g., verb "aimer")**:
If prompted with English "to love":
```
[French textbox: ___________]
[IPA textbox: ___________]
English: to love
```
Order: French input → IPA input → English label (prompt)

**Key Points**:
- Prompt appears as a label/display in its natural field position
- Article and French word should appear on the same row (article textbox immediately followed by French field)
- Other fields appear on their own rows
- Remove the separate prompt display area at the top
- More natural flow - reads like: "le [___]" or "[___] homme"

**UI Considerations**:
- When article + French are both visible, they should be inline on the same row
- Article textbox narrow (100px), French field takes remaining space
- Labels for prompts should match the styling of input fields but be read-only
- Could use a styled div or disabled input to show the prompt value

**Rationale**:
- More natural reading flow
- Clearer visual connection between article and French word
- Reduces eye movement (don't have to look at top, then at inputs)
- Mimics how you would write/read the phrase naturally

---

### 4. French Diacritics Input Support ⏳
**Current Behavior**: French textbox accepts any text, requires manual input of special characters (é, à, ç, etc.)

**Desired Behavior**: Real-time character conversion for French diacritics using letter+key shortcuts.

**Proposed Shortcut System**:

Similar to IPA conversion and pinyin tone conversion, use shortcuts like:

**E variants**:
- `e'` → é (acute)
- `e`` → è (grave)
- `e^` → ê (circumflex)
- `e:` → ë (diaeresis)

**A variants**:
- `a`` → à (grave)
- `a^` → â (circumflex)

**I variants**:
- `i^` → î (circumflex)
- `i:` → ï (diaeresis)

**O variants**:
- `o^` → ô (circumflex)

**U variants**:
- `u`` → ù (grave)
- `u^` → û (circumflex)
- `u:` → ü (diaeresis)

**Special characters**:
- `c,` → ç (c cedilla)
- `oe` → œ (oe ligature)
- `ae` → æ (ae ligature)

**Alternative Scheme** (numbers after vowels, like pinyin):
- `e1` → é, `e2` → è, `e3` → ê, `e4` → ë
- `a1` → à, `a2` → â
- `c1` → ç
- etc.

**Implementation Notes**:
- Add new `frenchCharMap` similar to `ipaCharMap`
- Create `convertFrench()` function similar to `convertIPA()`
- Attach to French input field only
- Real-time conversion as user types
- Preserve cursor position during conversion
- Could add optional reference table like IPA shortcuts (but less critical)

**Example Usage**:
- Type: `cafe'` → Converts to: `café`
- Type: `franc,ais` → Converts to: `français`
- Type: `e'le`ve` → Converts to: `élève`

**Rationale**:
- Easier than using Alt codes or character picker
- Consistent with IPA and pinyin conversion patterns
- Faster workflow for users without French keyboard
- Reinforces correct spelling with diacritics

**Decision Needed**:
- Which shortcut scheme to use? (symbols like `e'` vs numbers like `e1`)
- User's preference?
