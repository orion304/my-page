# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a multi-language vocabulary trainer web application. It's a static site that helps users learn vocabulary through interactive training interfaces with progress tracking and Google Drive integration for persistence.

**Currently supports:**
- **ASL (American Sign Language)**: Video-based sign learning with iframe embeds
- **Chinese (Mandarin)**: Text input-based testing across hanzi, pinyin, zhuyin, and English
- **French**: Text input-based testing with IPA character conversion, testing french word, IPA pronunciation, English translation, and gender

The landing page (index.html) allows users to select which language to study.

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

## Architecture

### Core Components

#### Landing Page
**index.html**: Language selection landing page
- Three-column grid with language cards (ASL, Chinese, French)
- Links to asl.html, chinese.html, and french.html
- Styled with landing.css

**landing.css**: Landing page styles
- Card-based layout with hover effects
- Purple gradient background theme
- Language-specific border colors (purple for ASL, red for Chinese, blue for French)
- Responsive design for mobile

#### ASL Trainer
**asl.html**: ASL trainer HTML structure containing:
- External references to CSS (`asl-trainer.css`) and JavaScript (`asl-trainer.js`)
- Iframe container for video sign references
- All UI markup and structure

**asl-trainer.css**: ASL application styles including:
- Layout and typography
- Component styling (buttons, cards, badges, iframe)
- Purple/blue gradient theme
- Responsive design and animations

**asl-trainer.js**: ASL application logic including:
- Google Drive OAuth integration (localStorage key: `google_drive_token`)
- Dictionary state management
- Word selection and progression algorithms
- Iframe prefetching for performance
- Keyboard shortcut handlers
- UI event handlers and DOM manipulation

**asl_dictionary.json**: ASL dictionary data structure where each entry contains:
```json
{
  "word-key": {
    "concept": "WORD / meaning",
    "url": "https://www.lifeprint.com/...",
    "state": "not_started" | "learning" | "learned",
    "correctCount": 0,
    "lesson": "1"
  }
}
```

#### Chinese Trainer
**chinese.html**: Chinese trainer HTML structure containing:
- External references to CSS (`chinese-trainer.css`) and JavaScript (`chinese-trainer.js`)
- Prompt display area showing one random field
- Three text input fields for user answers
- Feedback display areas below each input

**chinese-trainer.css**: Chinese application styles including:
- Layout and typography adapted for text input
- Input field styling with color feedback (green/red)
- Red/crimson gradient theme (Chinese flag colors)
- Responsive design and animations

**chinese-trainer.js**: Chinese application logic including:
- Google Drive OAuth integration (localStorage key: `google_drive_token_chinese`)
- Random field selection (hanzi, pinyin, zhuyin, or english as prompt)
- Answer validation and feedback display
- Same state progression as ASL
- Keyboard shortcut handlers adapted for Chinese workflow
- UI event handlers and DOM manipulation

**chinese_dictionary.json**: Chinese dictionary data structure where each entry contains:
```json
{
  "word-key": {
    "hanzi": "汉字",
    "pinyin": "hànzì",
    "zhuyin": "ㄏㄢˋ ㄗˋ",
    "ipa": "/xän⁵¹ tsɨ⁵¹/",
    "english": "Chinese characters",
    "state": "not_started" | "learning" | "learned",
    "correctCount": 0,
    "lesson": "1"
  }
}
```

#### French Trainer
**french.html**: French trainer HTML structure containing:
- External references to CSS (`french-trainer.css`) and JavaScript (`french-trainer.js`)
- Prompt display area showing one random field
- Three text input fields for user answers (with IDs for dynamic positioning)
- IPA reference tables that dynamically position under IPA input field
- Feedback display areas below each input

**french-trainer.css**: French application styles including:
- Layout and typography adapted for text input
- Input field styling with color feedback (green/red)
- Blue/red gradient theme (French flag colors)
- IPA reference table styling with compact grid layout
- Responsive design and animations

**french-trainer.js**: French application logic including:
- Google Drive OAuth integration (localStorage key: `google_drive_token_french`)
- Random field selection (french, ipa, or english as prompt)
- Real-time IPA character conversion using letter+number shortcuts (80+ mappings)
- Answer validation with automatic slash stripping for IPA fields
- Dynamic IPA reference table positioning (moves to appear after IPA input field)
- Same state progression as ASL/Chinese
- Enhanced keyboard shortcuts (Enter for check+correct, Escape for wrong)
- Auto-focus on first input field when new word loads
- UI event handlers and DOM manipulation

**french_dictionary.json**: French dictionary data structure where each entry contains:
```json
{
  "word-key": {
    "french": "chien",
    "ipa": "/ʃjɛ̃/",
    "english": "dog",
    "gender": "m",
    "state": "not_started" | "learning" | "learned",
    "correctCount": 0,
    "lesson": "1"
  }
}
```

**IPA Character Conversion System**:
- Located in `french-trainer.js` (lines 194-308)
- Maps letter+number combinations to IPA characters (e.g., `a1` → ɑ, `s1` → ʃ, `e2` → ɛ)
- Real-time conversion preserves cursor position
- Attached only to IPA input fields via `attachIPAConverter()`
- Reference tables show all mappings in compact grid format
- See `IPA_SHORTCUTS.md` for complete character reference

### State Management

All three trainers use localStorage and Google Drive for persistence:

**ASL Trainer:**
- **Google Drive file**: `asl_dictionary.json`
- **Token storage**: `google_drive_token` in localStorage with expiry tracking
- **Auto-save**: Triggers on every correct/wrong button click

**Chinese Trainer:**
- **Google Drive file**: `chinese_dictionary.json`
- **Token storage**: `google_drive_token_chinese` in localStorage with expiry tracking
- **Auto-save**: Triggers on every correct/wrong button click

**French Trainer:**
- **Google Drive file**: `french_dictionary.json`
- **Token storage**: `google_drive_token_french` in localStorage with expiry tracking
- **Auto-save**: Triggers on every correct/wrong button click

Word states progress identically in all trainers:
1. `not_started` → initial state
2. `learning` → after first correct answer (correctCount: 1)
3. `learned` → after two consecutive correct answers (correctCount: 2)

Getting a word wrong resets `correctCount` to 0 and sets state back to `learning`.

### Google Drive Integration

All trainers share the same Google OAuth client ID but use separate files:

- **Client ID**: Hardcoded in all trainer JS files (same ID for all)
- **ASL file name**: `asl_dictionary.json` (constant in asl-trainer.js)
- **Chinese file name**: `chinese_dictionary.json` (constant in chinese-trainer.js)
- **French file name**: `french_dictionary.json` (constant in french-trainer.js)
- **Scope**: `https://www.googleapis.com/auth/drive.file`
- **Token persistence**: Stored in localStorage with 1-hour expiry (separate keys per trainer)
- **Auto-save**: Triggers on every correct/wrong button click
- **File operations**: Uses Google Drive API v3 for create/update/read

## Development

### Git Commits

When creating git commits:
- Use clear, concise commit messages that describe the changes
- DO NOT add "Generated with Claude Code" or "Co-Authored-By" footers
- Keep commit messages simple and to the point

### Local Testing

Since this is a static site, simply open `index.html` in a browser. Note:
- Google Drive features require HTTPS in production
- File uploads work without any server

### Deployment

The project uses GitLab CI for deployment:
- Pipeline defined in `.gitlab-ci.yml`
- Copies all files to `public/` directory for GitLab Pages
- No build step required (static HTML/CSS/JS)

### Planning and Documentation

- **DEVELOPMENT_NOTES.md**: Active development planning document tracking:
  - Current goals (immediate, short-term, stretch)
  - Future multi-language support plans (Chinese, French)
  - Ideas and brainstorming (including Chicago skyline interactive map)
  - Technical decisions and architectural notes

### Legacy Files and Historical Code

- **app.js**: Legacy Chinese vocabulary app with structure for: hanzi, pinyin, zhuyin, IPA, english
  - Not currently used but contains data structure matching planned Chinese language expansion
- **style.css**: Legacy stylesheet (not used, index.html has inline styles)
- **Commit 74319fc**: Contains code for Chicago skyline interactive map feature (image maps with clickable building regions)
  - May be referenced for future implementation

## Key Behaviors

### Keyboard Shortcuts

All trainers support hands-free operation via keyboard shortcuts:

**ASL Trainer** (asl-trainer.js):
- **Spacebar** or **Numpad 1**: Toggle show/hide sign
- **Right Arrow**, **Enter**, or **Numpad 2**: Mark word correct
- **Left Arrow**, **Backspace**, or **Numpad 3**: Mark word wrong

**Chinese Trainer** (chinese-trainer.js):
- **Enter** or **Numpad 1**: Check answers (when inputs are visible)
- **Right Arrow** or **Numpad 2**: Mark word correct (after checking)
- **Left Arrow**, **Backspace**, or **Numpad 3**: Mark word wrong (after checking)

**French Trainer** (french-trainer.js):
- **Enter** (in input field): Check answers, then mark as "Got It" (correct)
- **Escape** (in input field): Mark as "Didn't Get It" (wrong)
- **Right Arrow** or **Numpad 2**: Mark word correct (when not in input field)
- **Left Arrow**, **Backspace**, or **Numpad 3**: Mark word wrong (when not in input field)
- **Auto-focus**: First input field automatically focused on each new word

All shortcuts:
- Only active when training section is visible
- Some shortcuts disabled when typing in input fields (French has enhanced in-field shortcuts)

### Word Selection Algorithm

All trainers use similar word selection logic:

**ASL Trainer**: The `showRandomWord()` function only shows words with state `learning`. Words with `not_started` are organized into lessons that can be started manually. Once all words in active lessons reach `learned` state, it displays lesson completion with options to start next lesson or review.

**Chinese Trainer**: The `showRandomWord()` function automatically starts all `not_started` words as `learning` on first load, then randomly selects from `learning` words. Once all words reach `learned` state, it displays a completion message.

**French Trainer**: The `showRandomWord()` function automatically starts all `not_started` words as `learning` on first load, then randomly selects from `learning` words. Once all words reach `learned` state, it displays a completion message. Same behavior as Chinese trainer.

All trainers avoid showing the same word twice in a row when multiple words are available.

### Testing Methods

**ASL Trainer - Video-based Recognition**:
1. Display concept/word text
2. User clicks to reveal iframe with sign video
3. User marks themselves correct/wrong

**Chinese Trainer - Multi-field Text Input**:
1. Randomly select one field as prompt (hanzi, pinyin, zhuyin, or english)
2. Display prompt value, show 3 empty input fields for other fields
3. User fills in all 3 fields
4. User clicks "Check Answers" to validate
5. System shows correct/wrong feedback with expected values
6. User marks themselves correct/wrong based on overall performance

**French Trainer - Multi-field Text Input with IPA Conversion**:
1. Randomly select one field as prompt (french, ipa, or english)
2. Display prompt value, show 3 empty input fields for other 2 fields + gender
3. User fills in all 3 fields (IPA field has real-time character conversion and reference tables)
4. User presses "Enter" or clicks "Check Answers" to validate
5. System shows correct/wrong feedback with expected values (IPA slashes automatically stripped)
6. User presses "Enter" for correct or "Escape" for wrong
7. Auto-focus on first field for next word

### Iframe Prefetching (ASL Only)

The ASL trainer prefetches sign reference pages by setting iframe src immediately when displaying a word, improving perceived performance when user clicks "Show Sign".

### Progress Tracking

All trainers display two visual lists showing learning progress:
- **Learned**: Words with state `learned` (green badges with checkmark)
- **Learning**: Words with state `learning`, showing one or two dots based on correctCount (yellow/cyan badges)

**ASL Trainer**: Shows `concept` field in badges
**Chinese Trainer**: Shows `english` field in badges
**French Trainer**: Shows `english` field in badges

## Modifying the Dictionaries

**ASL Dictionary** (`asl_dictionary.json`):
1. Each entry must have: `concept`, `url`, `state`, `correctCount`, `lesson`
2. The `url` should point to a Lifeprint.com ASL reference page
3. The `lesson` field organizes words into manually-started lessons

**Chinese Dictionary** (`chinese_dictionary.json`):
1. Each entry must have: `hanzi`, `pinyin`, `zhuyin`, `ipa`, `english`, `state`, `correctCount`, `lesson`
2. Use simplified Chinese characters for `hanzi`
3. Include tone marks in `pinyin` (e.g., "nǐ hǎo")
4. Use Bopomofo symbols for `zhuyin` (e.g., "ㄋㄧˇ ㄏㄠˇ")
5. IPA transcription should use standard Mandarin phonetic notation
6. The `lesson` field is currently unused (all words auto-start)

**French Dictionary** (`french_dictionary.json`):
1. Each entry must have: `french`, `ipa`, `english`, `gender`, `state`, `correctCount`, `lesson`
2. The `french` field contains the French word
3. The `ipa` field contains IPA pronunciation with slashes (e.g., "/ʃjɛ̃/")
4. The `gender` field is "m" (masculine), "f" (feminine), or blank for non-gendered words
5. IPA can be entered using letter+number shortcuts (e.g., s1 → ʃ, e2 → ɛ)
6. The `lesson` field is currently unused (all words auto-start)
7. Slashes are automatically stripped during validation, so users don't need to type them
