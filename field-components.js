// Field Component Architecture
// Like C# user controls - each field type owns its behavior

/**
 * BaseField - Foundation class for all field types
 * Provides common interface and behavior
 */
class BaseField {
    /**
     * @param {HTMLInputElement} input - The input element
     * @param {HTMLElement} label - The label element
     * @param {HTMLElement} feedback - The feedback element
     */
    constructor(input, label, feedback) {
        this.input = input;
        this.label = label;
        this.feedback = feedback;
        this.attached = false;
    }

    /**
     * Attach event listeners and setup field behavior
     * Override in subclasses for specific behavior
     */
    attach() {
        this.attached = true;
    }

    /**
     * Detach event listeners and cleanup
     * Override in subclasses for specific cleanup
     */
    detach() {
        this.attached = false;
    }

    /**
     * Get the current value of the field
     * @returns {string}
     */
    getValue() {
        return this.input.value;
    }

    /**
     * Set the value of the field
     * @param {string} value
     */
    setValue(value) {
        this.input.value = value;
    }

    /**
     * Clear the field (reset to empty state)
     */
    clear() {
        this.input.value = '';
        this.feedback.textContent = '';
        this.feedback.className = 'answer-feedback';
        this.input.className = 'answer-input';
    }

    /**
     * Validate the field against expected value
     * @param {string} expected - The expected value
     * @returns {boolean} - True if valid
     */
    validate(expected) {
        const actual = this.getValue().trim();
        return actual.toLowerCase() === expected.toLowerCase();
    }

    /**
     * Show validation feedback
     * @param {boolean} isCorrect - Whether the answer is correct
     * @param {string} expected - The expected value (shown on incorrect)
     */
    showFeedback(isCorrect, expected = '') {
        if (isCorrect) {
            this.feedback.textContent = '✓ Correct';
            this.feedback.className = 'answer-feedback correct';
            this.input.className = 'answer-input correct';
        } else {
            this.feedback.textContent = `✗ Expected: ${expected}`;
            this.feedback.className = 'answer-feedback incorrect';
            this.input.className = 'answer-input incorrect';
        }
    }

    /**
     * Get the field name from the label
     * @returns {string}
     */
    getFieldName() {
        return this.label.textContent.trim();
    }
}

/**
 * EnglishField - Plain text field with no conversion
 * Simple case-insensitive validation
 */
class EnglishField extends BaseField {
    // No special behavior needed - uses BaseField defaults
}

/**
 * PinyinField - Pinyin input with tone number conversion
 * Converts: ni3 → nǐ, hao3 → hǎo, u: → ü
 * Backspace reversal: ǐ → i → (empty)
 */
class PinyinField extends BaseField {
    constructor(input, label, feedback) {
        super(input, label, feedback);

        // Pinyin tone map
        this.toneMap = {
            'a1': 'ā', 'a2': 'á', 'a3': 'ǎ', 'a4': 'à', 'a5': 'a',
            'e1': 'ē', 'e2': 'é', 'e3': 'ě', 'e4': 'è', 'e5': 'e',
            'i1': 'ī', 'i2': 'í', 'i3': 'ǐ', 'i4': 'ì', 'i5': 'i',
            'o1': 'ō', 'o2': 'ó', 'o3': 'ǒ', 'o4': 'ò', 'o5': 'o',
            'u1': 'ū', 'u2': 'ú', 'u3': 'ǔ', 'u4': 'ù', 'u5': 'u',
            'ü1': 'ǖ', 'ü2': 'ǘ', 'ü3': 'ǚ', 'ü4': 'ǜ', 'ü5': 'ü',
            'v1': 'ǖ', 'v2': 'ǘ', 'v3': 'ǚ', 'v4': 'ǜ', 'v5': 'ü'
        };

        // Reverse map for backspace
        this.backspaceMap = {
            'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü',
            'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
            'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
            'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
            'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
            'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
            'ü': 'u'
        };

        // Bind event handlers to preserve 'this' context
        this.handleInput = this.handleInput.bind(this);
        this.handleBackspace = this.handleBackspace.bind(this);
    }

    attach() {
        super.attach();
        this.input.addEventListener('input', this.handleInput);
        this.input.addEventListener('keydown', this.handleBackspace);
    }

    detach() {
        super.detach();
        this.input.removeEventListener('input', this.handleInput);
        this.input.removeEventListener('keydown', this.handleBackspace);
    }

    convertTones(text) {
        const syllables = text.split(' ');
        const converted = syllables.map(syllable => {
            // Support compound words: repeatedly convert first vowel group + tone number
            // Process left-to-right by working through remaining unconverted portion
            // Example: "nan2ren2" → process "nan2" → process remaining "ren2" → "nánrén"
            let result = '';
            let remaining = syllable;
            let maxIterations = 10; // Safety limit
            let iterations = 0;

            while (remaining.length > 0 && iterations < maxIterations) {
                // Match: consonants + vowels + optional finals (n/ng) + tone number
                // Pattern handles: "nan2" (with final n), "ni3" (no final), "zhong1" (with final ng)
                const match = remaining.match(/^([^aeiouüv]*)([aeiouüv]+)(n(?!g)|ng)?([1-5])/i);
                if (!match) {
                    // No more tone conversions found, append rest as-is
                    result += remaining;
                    break;
                }

                iterations++;
                const consonants = match[1];
                const vowelGroup = match[2].toLowerCase();
                const finals = match[3] || ''; // optional 'n' or 'ng'
                const tone = match[4];

                // Apply pinyin tone placement rules to vowel group
                let targetVowel = vowelGroup[vowelGroup.length - 1]; // default: last
                let targetIndex = vowelGroup.length - 1;

                // Rule 1: 'a' or 'e' gets the tone mark
                if (vowelGroup.includes('a')) {
                    targetVowel = 'a';
                    targetIndex = vowelGroup.indexOf('a');
                } else if (vowelGroup.includes('e')) {
                    targetVowel = 'e';
                    targetIndex = vowelGroup.indexOf('e');
                } else if (vowelGroup === 'ou') {
                    // Rule 2: in 'ou', 'o' gets the tone
                    targetVowel = 'o';
                    targetIndex = 0;
                }
                // Rule 3: last vowel (already set as default)

                // Replace target vowel with accented version
                const accentedVowel = this.toneMap[targetVowel + tone] || targetVowel;
                const convertedVowelGroup = vowelGroup.substring(0, targetIndex) +
                                           accentedVowel +
                                           vowelGroup.substring(targetIndex + 1);

                // Append converted portion to result
                result += consonants + convertedVowelGroup + finals;

                // Continue with what's after the match
                remaining = remaining.substring(match[0].length);
            }

            return result;
        });

        return converted.join(' ');
    }

    handleInput(e) {
        const cursorPos = this.input.selectionStart;
        const originalLength = this.input.value.length;

        // First convert u: to ü
        let text = this.input.value.replace(/u:/g, 'ü');

        // Then convert tone numbers to diacritics
        const converted = this.convertTones(text);

        if (converted !== this.input.value) {
            this.input.value = converted;
            // Adjust cursor position
            const lengthDiff = converted.length - originalLength;
            this.input.setSelectionRange(cursorPos + lengthDiff, cursorPos + lengthDiff);
        }
    }

    handleBackspace(e) {
        // Only handle backspace key
        if (e.key !== 'Backspace') return;

        const cursorPos = this.input.selectionStart;
        const cursorEnd = this.input.selectionEnd;

        // Only handle if no text is selected and cursor is not at the start
        if (cursorPos !== cursorEnd || cursorPos === 0) return;

        // Get the character before the cursor
        const charBefore = this.input.value[cursorPos - 1];

        // Check if it's a diacritic character we should handle
        if (this.backspaceMap[charBefore]) {
            e.preventDefault();

            // Replace the accented character with its simpler form
            const newValue = this.input.value.substring(0, cursorPos - 1) +
                            this.backspaceMap[charBefore] +
                            this.input.value.substring(cursorPos);

            this.input.value = newValue;
            this.input.setSelectionRange(cursorPos, cursorPos);
        }
    }
}

/**
 * IPAField - IPA input with character conversion and reference table
 * Uses ipa-converter.js for conversion
 * Supports optional Mandarin tone mode
 * Validates with slash-stripping: /ni3/ === ni3
 */
class IPAField extends BaseField {
    /**
     * @param {HTMLInputElement} input - The input element
     * @param {HTMLElement} label - The label element
     * @param {HTMLElement} feedback - The feedback element
     * @param {Object} options - Options: { mandarin: boolean }
     */
    constructor(input, label, feedback, options = {}) {
        super(input, label, feedback);
        this.options = options;
        this.attached = false;
    }

    attach() {
        super.attach();
        // Use the shared IPA converter with table show/hide
        if (window.IPAConverter && window.IPAConverter.attachIPAConverterWithTable) {
            window.IPAConverter.attachIPAConverterWithTable(this.input, this.options);
        }
    }

    detach() {
        super.detach();
        // Properly remove IPA converter event listeners
        if (window.IPAConverter && window.IPAConverter.detachIPAConverter) {
            window.IPAConverter.detachIPAConverter(this.input);
        }
    }

    /**
     * Validate IPA field - strips slashes from both actual and expected
     * Accepts: /ni3/ or ni3 (both valid)
     * @param {string} expected - The expected IPA value
     * @returns {boolean}
     */
    validate(expected) {
        const actual = this.getValue().trim().replace(/^\/|\/$/g, ''); // Strip leading/trailing slashes
        const expectedNormalized = expected.trim().replace(/^\/|\/$/g, '');
        return actual.toLowerCase() === expectedNormalized.toLowerCase();
    }
}

/**
 * HanziField - Multiple choice grid for hanzi selection
 * Uses button grid instead of text input
 * Manages choice generation and selection
 */
class HanziField extends BaseField {
    /**
     * @param {HTMLInputElement} input - The input element (hidden when choices shown)
     * @param {HTMLElement} label - The label element
     * @param {HTMLElement} feedback - The feedback element
     * @param {HTMLElement} choicesContainer - The container for hanzi choice buttons
     * @param {Function} getDistractors - Function to get distractor hanzi: (correctHanzi, count) => string[]
     */
    constructor(input, label, feedback, choicesContainer, getDistractors) {
        super(input, label, feedback);
        this.choicesContainer = choicesContainer;
        this.getDistractors = getDistractors;
    }

    /**
     * Setup the hanzi choices grid
     * @param {string} correctHanzi - The correct hanzi for this word
     */
    setupChoices(correctHanzi) {
        const distractors = this.getDistractors(correctHanzi, 9);
        const allOptions = [correctHanzi, ...distractors].sort(() => Math.random() - 0.5);

        this.choicesContainer.innerHTML = '';
        this.choicesContainer.dataset.selected = '';
        this.choicesContainer.dataset.correct = correctHanzi;

        allOptions.forEach(hanzi => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'hanzi-choice';
            btn.textContent = hanzi;
            btn.addEventListener('click', () => this.selectChoice(btn, hanzi));
            this.choicesContainer.appendChild(btn);
        });

        // Hide text input, show choices
        this.input.style.display = 'none';
        this.choicesContainer.style.display = 'grid';
    }

    /**
     * Handle choice selection
     * @param {HTMLElement} btn - The button that was clicked
     * @param {string} hanzi - The hanzi that was selected
     */
    selectChoice(btn, hanzi) {
        // Remove selected class from all buttons
        this.choicesContainer.querySelectorAll('.hanzi-choice').forEach(b => {
            b.classList.remove('selected');
        });
        // Add selected class to clicked button
        btn.classList.add('selected');
        // Store selected value
        this.choicesContainer.dataset.selected = hanzi;
    }

    /**
     * Get the current value (selected hanzi from grid)
     * @returns {string}
     */
    getValue() {
        return this.choicesContainer.dataset.selected || '';
    }

    /**
     * Clear the field (reset choices)
     */
    clear() {
        super.clear();
        this.choicesContainer.style.display = 'none';
        this.choicesContainer.innerHTML = '';
        this.choicesContainer.dataset.selected = '';
        this.input.style.display = 'block';
    }
}

// Export for use in other files
window.FieldComponents = {
    BaseField,
    EnglishField,
    PinyinField,
    IPAField,
    HanziField,
};
