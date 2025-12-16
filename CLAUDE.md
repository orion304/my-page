# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ASL (American Sign Language) vocabulary trainer web application. It's a static site that helps users learn ASL signs through a flashcard-style interface with progress tracking and Google Drive integration for persistence.

## Architecture

### Core Components

**index.html**: Main HTML structure containing:
- External references to CSS (`asl-trainer.css`) and JavaScript (`asl-trainer.js`)
- All UI markup and structure
- Minimal inline content for maintainability

**asl-trainer.css**: Application styles including:
- Layout and typography
- Component styling (buttons, cards, badges, etc.)
- Responsive design
- Animations and transitions

**asl-trainer.js**: Application logic including:
- Google Drive OAuth integration and persistence
- Dictionary state management
- Word selection and progression algorithms
- Keyboard shortcut handlers
- UI event handlers and DOM manipulation

**asl_dictionary.json**: Dictionary data structure where each entry contains:
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

### State Management

The application uses localStorage and Google Drive for persistence:
- **Local storage key**: `chineseVocabList` (legacy from original Chinese vocab app)
- **Google Drive**: Auto-saves dictionary updates via Google Drive API
- **Token storage**: Google OAuth tokens stored in localStorage with expiry tracking

Word states progress as follows:
1. `not_started` → initial state
2. `learning` → after first correct answer (correctCount: 1)
3. `learned` → after two consecutive correct answers (correctCount: 2)

Getting a word wrong resets `correctCount` to 0 and sets state back to `learning`.

### Google Drive Integration

- **Client ID**: Hardcoded in asl-trainer.js (line 1)
- **File name**: `asl_dictionary.json` (constant in asl-trainer.js)
- **Scope**: `https://www.googleapis.com/auth/drive.file`
- **Token persistence**: Stored in localStorage with 1-hour expiry
- **Auto-save**: Triggers on every correct/wrong button click
- **File operations**: Uses Google Drive API v3 for create/update/read

## Development

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

The application supports hands-free operation via keyboard shortcuts (asl-trainer.js):
- **Spacebar** or **Numpad 1**: Toggle show/hide sign
- **Right Arrow**, **Enter**, or **Numpad 2**: Mark word correct
- **Left Arrow**, **Backspace**, or **Numpad 3**: Mark word wrong
- Only active when training section is visible
- Disabled when typing in input fields

### Word Selection Algorithm

The `showRandomWord()` function (asl-trainer.js) only shows words with state `not_started` or `learning`. Once all words reach `learned` state, it displays a completion message.

### Iframe Prefetching

The app prefetches ASL sign reference pages by setting iframe src immediately when displaying a word, improving perceived performance when user clicks "Show Sign".

### Progress Tracking

Two visual lists show learning progress:
- **Learned**: Words with state `learned` (green badges)
- **Learning**: Words with state `learning`, showing one or two dots based on correctCount

## Modifying the Dictionary

To add new words or lessons:
1. Edit `asl_dictionary.json` following the existing structure
2. Each entry must have: `concept`, `url`, `state`, `correctCount`, `lesson`
3. The `url` should point to a Lifeprint.com ASL reference page
