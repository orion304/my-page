# Multi-Language Vocabulary Trainer

A progressive web application for learning vocabulary in multiple languages: **ASL** (American Sign Language), **Chinese** (Mandarin), and **French**.

🌐 **Live Site**: [https://orion304.github.io/my-page/](https://orion304.github.io/my-page/)

---

## Features

### 🌍 Three Language Trainers

1. **🤟 ASL (American Sign Language)**
   - Visual sign recognition training
   - Image-based vocabulary learning
   - Simple show/recall format

2. **🇨🇳 Chinese (Mandarin)**
   - Hanzi (Chinese characters) practice
   - Pinyin with tone diacritics
   - Real-time tone conversion (ni3 → nǐ)
   - English translation testing
   - Multi-field input validation

3. **🇫🇷 French**
   - French vocabulary with gender
   - IPA (International Phonetic Alphabet) pronunciation
   - Real-time IPA character conversion
   - English translation testing
   - Interactive IPA reference tables

### 🎯 Core Training Features

- **Progressive Learning System**
  - Not Started → Learning → Learned
  - Words move through states based on correctness
  - 2 correct answers required to mark as "learned"

- **Visual Progress Tracking**
  - Real-time progress badges
  - Separate lists for learning vs learned words
  - Session statistics (correct/wrong counts)

- **Google Drive Integration**
  - Auto-save progress to Google Drive
  - Sync across devices
  - Separate storage per language
  - Automatic reconnection with saved tokens

- **Keyboard-Driven Workflow**
  - Full keyboard shortcuts for all actions
  - Enter to check/confirm
  - Escape for wrong answers
  - Auto-focus on input fields
  - No mouse required!

- **Dictionary Management**
  - Load default dictionaries from GitHub
  - Upload custom JSON dictionaries
  - Download updated progress
  - Change dictionaries mid-session

---

## Language-Specific Features

### ASL Trainer
- Image display for sign visualization
- Simple show answer → self-assessment flow
- Keyboard shortcuts: 1 (check), 2 (correct), 3 (wrong)

### Chinese Trainer
**Pinyin Tone Conversion**:
- `ni3` → `nǐ` (automatic tone diacritics)
- `u:` → `ü` (umlaut conversion)
- Logical backspace (removes diacritics layer by layer)
- All 5 tones supported (ā á ǎ à a)

**Testing Format**:
- Randomly prompt: Hanzi, Pinyin, OR English
- Fill in the other 2 fields
- Instant validation with visual feedback

### French Trainer
**IPA Input System** (80+ characters):
- Letter + number shortcuts (e.g., `a1` → ɑ, `s1` → ʃ, `e2` → ɛ)
- Real-time character conversion
- Cursor position preserved
- Compact reference tables

**IPA Reference Tables**:
- Displayed directly under IPA input field
- Two-column layout (a-n | o-z)
- Shows base letter + numbered variants
- Auto-shows when IPA field is focused
- See [IPA_SHORTCUTS.md](IPA_SHORTCUTS.md) for complete reference

**Testing Format**:
- Randomly prompt: French, IPA, OR English
- Fill in the other 2 fields + gender (m/f/blank)
- Automatic slash stripping for IPA
- Case-insensitive validation

**Keyboard Shortcuts**:
- **Enter**: Check answers, then mark as "Got It"
- **Escape**: Mark as "Didn't Get It"
- **Auto-focus**: Cursor automatically in first field

---

## Dictionary Format

### ASL Dictionary
```json
{
  "hello": {
    "sign": "hello",
    "image": "images/hello.jpg",
    "definition": "A greeting",
    "state": "not_started",
    "correctCount": 0
  }
}
```

### Chinese Dictionary
```json
{
  "你好": {
    "hanzi": "你好",
    "pinyin": "nǐhǎo",
    "english": "hello",
    "state": "not_started",
    "correctCount": 0,
    "lesson": "1"
  }
}
```

### French Dictionary
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

**Fields**:
- `state`: "not_started", "learning", or "learned"
- `correctCount`: Number of consecutive correct answers
- `gender` (French only): "m" (masculine), "f" (feminine), or blank
- `lesson`: Optional grouping/organization field

---

## File Structure

```
my-page/
├── index.html              # Landing page with language selection
├── landing.css             # Landing page styles
│
├── asl.html                # ASL trainer interface
├── asl-trainer.js          # ASL trainer logic
├── asl-trainer.css         # ASL trainer styles
├── asl_dictionary.json     # ASL vocabulary data
│
├── chinese.html            # Chinese trainer interface
├── chinese-trainer.js      # Chinese trainer logic (pinyin conversion)
├── chinese-trainer.css     # Chinese trainer styles
├── chinese_dictionary.json # Chinese vocabulary data
│
├── french.html             # French trainer interface
├── french-trainer.js       # French trainer logic (IPA conversion)
├── french-trainer.css      # French trainer styles
├── french_dictionary.json  # French vocabulary data (41 words)
│
├── IPA_SHORTCUTS.md        # IPA character shortcut reference
├── FRENCH_IMPLEMENTATION_PLAN.md  # French implementation details
└── README.md               # This file
```

---

## Getting Started

### 1. Choose a Language
Visit the landing page and select ASL, Chinese, or French.

### 2. Load a Dictionary
Three options:
- **Google Drive**: Connect to save/load progress across devices
- **Default Dictionary**: Load the built-in dictionary from GitHub
- **Custom File**: Upload your own JSON dictionary

### 3. Start Training
- Read the prompt (word/sign/character)
- Fill in the answer fields
- Press Enter to check
- Mark correct/wrong
- Repeat!

### 4. Track Progress
- Watch words move from Learning → Learned
- View session statistics
- Download updated dictionary with your progress

---

## Keyboard Shortcuts

### Chinese Trainer
- **Enter**: Check answers
- **Arrow Right / Numpad 2**: Mark correct
- **Arrow Left / Backspace / Numpad 3**: Mark wrong

### French Trainer
- **Enter** (in input field):
  - Before checking → Check answers
  - After checking → Mark as "Got It"
- **Escape** (in input field): Mark as "Didn't Get It"
- **Arrow Right / Numpad 2**: Mark correct (when not in input)
- **Arrow Left / Backspace / Numpad 3**: Mark wrong (when not in input)

### ASL Trainer
- **Enter / Numpad 1**: Show answer
- **Arrow Right / Numpad 2**: Mark correct
- **Arrow Left / Backspace / Numpad 3**: Mark wrong

---

## IPA Input Quick Reference

### Most Common French IPA Characters

| Type | Shortcut | Result | Description |
|------|----------|--------|-------------|
| Vowel | `e1` | ə | schwa |
| Vowel | `e2` | ɛ | epsilon (open e) |
| Vowel | `a1` | ɑ | open a |
| Vowel | `o1` | ɔ | open o |
| Vowel | `e7` | ɛ̃ | epsilon nasalized |
| Vowel | `o2` | ɔ̃ | open o nasalized |
| Consonant | `s1` | ʃ | sh sound |
| Consonant | `z1` | ʒ | zh sound |
| Consonant | `n1` | ŋ | ng sound |
| Consonant | `r4` | ʁ | French uvular r |
| Special | `k1` | ː | length mark |

**Full reference**: See [IPA_SHORTCUTS.md](IPA_SHORTCUTS.md) for all 80+ character shortcuts.

---

## Pinyin Tone Input Quick Reference

### Tone Number → Diacritic Conversion

Type numbers after vowels to add tone marks:

| Input | Output | Tone |
|-------|--------|------|
| `a1` | ā | 1st tone (flat) |
| `a2` | á | 2nd tone (rising) |
| `a3` | ǎ | 3rd tone (falling-rising) |
| `a4` | à | 4th tone (falling) |
| `a5` | a | 5th tone (neutral) |

Works with all vowels: a, e, i, o, u, ü

**Special conversions**:
- `u:` → `ü` (for lü, nü, etc.)
- `v` → `ü` (alternative input)

**Tone placement rules**:
- Automatically places tone on correct vowel (e.g., `hao3` → `hǎo`)
- Follows standard pinyin tone placement rules

---

## Google Drive Setup

### First Time Setup
1. Click "Connect to Google Drive"
2. Sign in with your Google account
3. Grant permission to access Drive files
4. Trainer automatically searches for existing dictionary or creates new one

### How It Works
- **File naming**: `asl_dictionary.json`, `chinese_dictionary.json`, `french_dictionary.json`
- **Auto-save**: Progress saved automatically after each word
- **Token storage**: Authentication token saved in browser localStorage
- **Separate storage**: Each language has its own file and auth token
- **Auto-reconnect**: Returns to Drive file on page reload

### Privacy
- Only accesses files created by this app
- No access to other Drive files
- Token stored locally in browser
- No server-side storage

---

## Creating Custom Dictionaries

### Step 1: Create JSON File
Use the dictionary format for your chosen language (see Dictionary Format section).

### Step 2: Structure Your Data
```json
{
  "word1": { /* word data */ },
  "word2": { /* word data */ },
  "word3": { /* word data */ }
}
```

### Step 3: Save as .json
Save with appropriate filename:
- `my_asl_dictionary.json`
- `my_chinese_dictionary.json`
- `my_french_dictionary.json`

### Step 4: Upload
1. Open the trainer
2. Click "Load Dictionary from File"
3. Select your JSON file
4. Start training!

### Tips
- Start with 10-20 words for testing
- Use consistent formatting
- Validate JSON before uploading ([JSONLint](https://jsonlint.com))
- Include `state`, `correctCount`, and `lesson` fields
- For French: IPA should include slashes `/ʃjɛ̃/`
- For Chinese: Use proper pinyin with tone marks

---

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Requirements
- JavaScript enabled
- Unicode font support (for IPA and Hanzi characters)
- localStorage support (for saved preferences)
- Google Identity Services (for Drive integration)

### Mobile Support
- Responsive design for phones and tablets
- Touch-friendly buttons and inputs
- Mobile keyboard optimizations
- Autocorrect/autocapitalize disabled for language inputs

---

## Technical Details

### Character Conversion Systems

**Pinyin (Chinese)**:
- Real-time tone diacritic conversion
- Smart backspace (removes tone, then vowel)
- Umlaut conversion (u: → ü)
- Handles all tone combinations
- Located in `chinese-trainer.js`

**IPA (French)**:
- 80+ character mappings
- Letter+number shortcut system
- Real-time conversion preserves cursor position
- Regex-based replacement engine
- Located in `french-trainer.js`

### State Management
- Each word tracks: state, correctCount
- State transitions: not_started → learning → learned
- Learned threshold: 2 consecutive correct answers
- Wrong answer resets correctCount to 0
- Progress persists in dictionary JSON

### Google Drive Integration
- Uses Google Identity Services (GIS)
- OAuth 2.0 authentication
- Drive API v3 for file operations
- Token expiry: 1 hour (auto-refresh prompt)
- Separate files per language

---

## Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/orion304/my-page.git
cd my-page

# Open in browser (requires local server for Google Drive features)
python -m http.server 8000
# Visit http://localhost:8000
```

### Project Structure
- **Landing page**: `index.html`, `landing.css`
- **Each trainer**: HTML + JS + CSS + JSON dictionary
- **No build step**: Pure HTML/CSS/JavaScript
- **No dependencies**: Vanilla JS (except Google APIs for Drive)

### Adding a New Language

1. **Create dictionary JSON**: `newlang_dictionary.json`
2. **Create HTML**: `newlang.html` (copy from existing trainer)
3. **Create JS**: `newlang-trainer.js` (adapt loading and validation logic)
4. **Create CSS**: `newlang-trainer.css` (theme appropriately)
5. **Update landing page**: Add card to `index.html` and styles to `landing.css`
6. **Update README**: Document new language features

---

## Future Enhancements

### Planned Features
- 🔊 Audio pronunciation for all languages
- 📊 Detailed analytics and learning graphs
- 🔄 Spaced repetition algorithm
- 🏆 Achievement badges and streaks
- 📱 Progressive Web App (PWA) with offline support
- 🌙 Dark mode theme
- 🔀 Randomization settings (prompt type, word order)
- 📝 Custom quiz modes

### Language-Specific
- **French**: Article practice, verb conjugations, audio IPA
- **Chinese**: Character stroke order, audio tones, HSK levels
- **ASL**: Video demonstrations, regional sign variants

---

## Contributing

Contributions welcome! This is a personal learning project, but suggestions and improvements are appreciated.

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (all three languages)
5. Submit a pull request

### Areas for Contribution
- Additional vocabulary words
- New language trainers
- Bug fixes and optimizations
- UI/UX improvements
- Documentation enhancements

---

## License

This project is open source. Feel free to use, modify, and distribute.

---

## Credits

**Developer**: orion304

**Inspiration**: Language learning apps like Anki, Duolingo, and Memrise

**Resources**:
- [TypeIt.org](https://ipa.typeit.org/full/) - IPA character input inspiration
- [Wiktionary](https://www.wiktionary.org/) - IPA pronunciations
- Google Drive API - Cloud storage integration

---

## Support

Found a bug? Have a suggestion?

📧 Open an issue on [GitHub](https://github.com/orion304/my-page/issues)

⭐ Star the repo if you find it useful!

---

**Happy Learning! 🎓**
