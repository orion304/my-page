# Chinese Vocabulary Implementation Plan

## Overview
Expand the vocabulary trainer to support Chinese in addition to ASL. Users will select which language to study from a landing page.

---

## Implementation Steps

### Step 1: Create Landing Page with Language Selection
**Goal**: Add a simple landing page where users choose ASL or Chinese

**Approach**:
- Rename current `index.html` → `asl.html`
- Create new `landing.html` as the entry point
- Landing page has two large buttons/cards:
  - "🤟 ASL Vocabulary" → links to asl.html
  - "🇨🇳 Chinese Vocabulary" → links to chinese.html
- Simple, clean design - just the language selector

**Files to create/modify**:
- Create `landing.html`
- Rename `index.html` to `asl.html`
- Create `landing.css` for the language selector styling

---

### Step 2: Define Chinese Word Object Structure
**Goal**: Establish the data format for Chinese vocabulary entries

Based on your requirements (hanzi, pinyin, zhuyin, IPA, english meaning):

```json
{
  "hello": {
    "hanzi": "你好",
    "pinyin": "nǐ hǎo",
    "zhuyin": "ㄋㄧˇ ㄏㄠˇ",
    "ipa": "/ni˨˩˦ xaʊ˨˩˦/",
    "english": "hello",
    "state": "not_started",
    "correctCount": 0,
    "lesson": "1"
  }
}
```

**Key fields**:
- `hanzi`: Chinese characters (we need to decide: simplified, traditional, or both?)
- `pinyin`: Romanization with tone marks
- `zhuyin`: Bopomofo phonetic system
- `ipa`: International Phonetic Alphabet transcription
- `english`: English translation/meaning
- `state`, `correctCount`, `lesson`: Same progression system as ASL

**Decision needed**: Simplified Chinese, Traditional Chinese, or include both? (I recommend simplified for starter set)

---

### Step 3: Create Initial Chinese Dictionary
**Goal**: Build a small starter set of Chinese vocabulary

**Recommended starter set (15-20 words)**:
- Basic greetings (hello, goodbye, thank you)
- Numbers 1-10
- Common pronouns (I, you, he, she)
- Basic verbs (to be, have, want)

**Files to create**:
- `chinese_dictionary.json` with the starter vocabulary

**Questions to resolve**:
- Where do we source zhuyin and IPA? (Manual entry, or find a reference?)
- Should we start with just 10 words to keep it simple?

---

### Step 4: Define Chinese Testing Method
**Goal**: Decide how users will be tested on Chinese words (different from ASL video-based approach)

**Testing flow options**:

**Option A - Recognition (Show → Recall)**:
1. Show: Hanzi + Pinyin (visible)
2. User tries to recall English meaning
3. Click "Show Answer" → reveals English + zhuyin + IPA
4. User marks correct/wrong

**Option B - Production (Recall → Show)**:
1. Show: English meaning
2. User tries to recall Hanzi/Pinyin
3. Click "Show Answer" → reveals all fields
4. User marks correct/wrong

**Option C - Hybrid**:
1. Randomly alternate between recognition and production modes
2. State which mode for each word

**My recommendation**: Start with Option A (recognition) since it's simpler and mirrors the ASL flow more closely. Can add other modes later.

**UI changes needed**:
- Remove video iframe components
- Add sections to display: Hanzi (large), Pinyin, English, Zhuyin, IPA
- "Show Answer" button (similar to "Show Sign")
- Same correct/wrong buttons

---

### Step 5: Build Chinese Trainer Page
**Goal**: Create chinese.html with the Chinese-specific interface

**Approach**:
- Copy `asl.html` structure as starting point
- Create `chinese-trainer.js` (copy asl-trainer.js and modify)
- Create `chinese-trainer.css` (copy asl-trainer.css and modify)
- Update Google Drive integration to use `chinese_dictionary.json` filename
- Keep same keyboard shortcuts
- Keep same state progression and progress tracking

**Files to create**:
- `chinese.html`
- `chinese-trainer.js`
- `chinese-trainer.css`

---

## Summary of Deliverables

1. **Landing page**: Simple language selector
2. **Chinese dictionary schema**: Defined word object structure
3. **Starter vocabulary**: 10-20 Chinese words in JSON format
4. **Testing method**: Recognition-based (show hanzi/pinyin, recall English)
5. **Chinese trainer**: Full trainer interface for Chinese vocabulary

---

## Questions for User

Before we start implementing:

1. **Hanzi format**: Simplified Chinese, Traditional Chinese, or both?
2. **Starter set size**: 10 words or 20 words to begin with?
3. **Testing mode**: Recognition (Option A), Production (Option B), or Hybrid (Option C)?
4. **Zhuyin/IPA sources**: Do you have references, or should we populate these manually/find a tool?
