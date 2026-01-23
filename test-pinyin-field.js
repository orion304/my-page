// Tests for PinyinField (Node.js)

// Mock DOM elements
class MockElement {
    constructor() {
        this.value = '';
        this.textContent = '';
        this.className = '';
        this.selectionStart = 0;
        this.selectionEnd = 0;
        this.eventListeners = {};
    }

    addEventListener(event, handler) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);
    }

    removeEventListener(event, handler) {
        if (this.eventListeners[event]) {
            this.eventListeners[event] = this.eventListeners[event].filter(h => h !== handler);
        }
    }

    setSelectionRange(start, end) {
        this.selectionStart = start;
        this.selectionEnd = end;
    }

    // Simulate input event
    triggerInput() {
        if (this.eventListeners['input']) {
            this.eventListeners['input'].forEach(handler => {
                handler({ target: this });
            });
        }
    }

    // Simulate keydown event
    triggerKeydown(key) {
        if (this.eventListeners['keydown']) {
            const event = {
                key,
                target: this,
                preventDefault: () => {}
            };
            this.eventListeners['keydown'].forEach(handler => {
                handler(event);
            });
        }
    }
}

// Import PinyinField class (copy from field-components.js)
class BaseField {
    constructor(input, label, feedback) {
        this.input = input;
        this.label = label;
        this.feedback = feedback;
        this.attached = false;
    }

    attach() { this.attached = true; }
    detach() { this.attached = false; }
    getValue() { return this.input.value; }
    setValue(value) { this.input.value = value; }

    clear() {
        this.input.value = '';
        this.feedback.textContent = '';
        this.feedback.className = 'answer-feedback';
        this.input.className = 'answer-input';
    }
}

class PinyinField extends BaseField {
    constructor(input, label, feedback) {
        super(input, label, feedback);

        this.toneMap = {
            'a1': 'ā', 'a2': 'á', 'a3': 'ǎ', 'a4': 'à', 'a5': 'a',
            'e1': 'ē', 'e2': 'é', 'e3': 'ě', 'e4': 'è', 'e5': 'e',
            'i1': 'ī', 'i2': 'í', 'i3': 'ǐ', 'i4': 'ì', 'i5': 'i',
            'o1': 'ō', 'o2': 'ó', 'o3': 'ǒ', 'o4': 'ò', 'o5': 'o',
            'u1': 'ū', 'u2': 'ú', 'u3': 'ǔ', 'u4': 'ù', 'u5': 'u',
            'ü1': 'ǖ', 'ü2': 'ǘ', 'ü3': 'ǚ', 'ü4': 'ǜ', 'ü5': 'ü',
            'v1': 'ǖ', 'v2': 'ǘ', 'v3': 'ǚ', 'v4': 'ǜ', 'v5': 'ü'
        };

        this.backspaceMap = {
            'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü',
            'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
            'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
            'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
            'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
            'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
            'ü': 'u'
        };

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
            let result = '';
            let remaining = syllable;
            let maxIterations = 10;
            let iterations = 0;

            while (remaining.length > 0 && iterations < maxIterations) {
                const match = remaining.match(/^([^aeiouüv]*)([aeiouüv]+)(n(?!g)|ng)?([1-5])/i);
                if (!match) {
                    result += remaining;
                    break;
                }

                iterations++;
                const consonants = match[1];
                const vowelGroup = match[2].toLowerCase();
                const finals = match[3] || '';
                const tone = match[4];

                let targetVowel = vowelGroup[vowelGroup.length - 1];
                let targetIndex = vowelGroup.length - 1;

                if (vowelGroup.includes('a')) {
                    targetVowel = 'a';
                    targetIndex = vowelGroup.indexOf('a');
                } else if (vowelGroup.includes('e')) {
                    targetVowel = 'e';
                    targetIndex = vowelGroup.indexOf('e');
                } else if (vowelGroup === 'ou') {
                    targetVowel = 'o';
                    targetIndex = 0;
                }

                const accentedVowel = this.toneMap[targetVowel + tone] || targetVowel;
                const convertedVowelGroup = vowelGroup.substring(0, targetIndex) +
                                           accentedVowel +
                                           vowelGroup.substring(targetIndex + 1);

                result += consonants + convertedVowelGroup + finals;
                remaining = remaining.substring(match[0].length);
            }

            return result;
        });

        return converted.join(' ');
    }

    handleInput(e) {
        const cursorPos = this.input.selectionStart;
        const originalLength = this.input.value.length;

        let text = this.input.value.replace(/u:/g, 'ü');
        const converted = this.convertTones(text);

        if (converted !== this.input.value) {
            this.input.value = converted;
            const lengthDiff = converted.length - originalLength;
            this.input.setSelectionRange(cursorPos + lengthDiff, cursorPos + lengthDiff);
        }
    }

    handleBackspace(e) {
        if (e.key !== 'Backspace') return;

        const cursorPos = this.input.selectionStart;
        const cursorEnd = this.input.selectionEnd;

        if (cursorPos !== cursorEnd || cursorPos === 0) return;

        const charBefore = this.input.value[cursorPos - 1];

        if (this.backspaceMap[charBefore]) {
            e.preventDefault();

            const newValue = this.input.value.substring(0, cursorPos - 1) +
                            this.backspaceMap[charBefore] +
                            this.input.value.substring(cursorPos);

            this.input.value = newValue;
            this.input.setSelectionRange(cursorPos, cursorPos);
        }
    }
}

// Test framework
let passed = 0, failed = 0;

function test(desc, fn) {
    try {
        fn();
        passed++;
        console.log('✓', desc);
    } catch (e) {
        failed++;
        console.log('✗', desc);
        console.log('  Error:', e.message);
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

console.log('PinyinField Tests\n');

// Test tone conversion logic (direct method calls)
test('convertTones: single syllable with tone 1', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('ma1'), 'mā');
});

test('convertTones: single syllable with tone 3', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('ni3'), 'nǐ');
});

test('convertTones: multiple syllables', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('ni3 hao3'), 'nǐ hǎo');
});

test('convertTones: ü with tone', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('nü3'), 'nǚ');
});

test('convertTones: rule 1 - a gets tone', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('bai3'), 'bǎi');
});

test('convertTones: rule 1 - e gets tone', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('mei3'), 'měi');
});

test('convertTones: rule 2 - ou, o gets tone', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('hou3'), 'hǒu');
});

test('convertTones: rule 3 - last vowel gets tone', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('gui4'), 'guì');
});

test('convertTones: neutral tone (5)', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('ma5'), 'ma');
});

test('convertTones: compound word without spaces - nan2ren2', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('nan2ren2'), 'nánrén');
});

test('convertTones: compound word without spaces - ni3hao3', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('ni3hao3'), 'nǐhǎo');
});

test('convertTones: compound word without spaces - zhong1guo2', () => {
    const field = new PinyinField(new MockElement(), new MockElement(), new MockElement());
    assertEqual(field.convertTones('zhong1guo2'), 'zhōngguó');
});

// Test input event handling
test('handleInput: u: converts to ü', () => {
    const input = new MockElement();
    const field = new PinyinField(input, new MockElement(), new MockElement());
    field.attach();

    input.value = 'nu:';
    input.selectionStart = 3;
    input.triggerInput();

    assertEqual(input.value, 'nü');
});

test('handleInput: tone number conversion', () => {
    const input = new MockElement();
    const field = new PinyinField(input, new MockElement(), new MockElement());
    field.attach();

    input.value = 'ni3';
    input.selectionStart = 3;
    input.triggerInput();

    assertEqual(input.value, 'nǐ');
});

test('handleInput: combined u: and tone', () => {
    const input = new MockElement();
    const field = new PinyinField(input, new MockElement(), new MockElement());
    field.attach();

    input.value = 'nu:3';
    input.selectionStart = 4;
    input.triggerInput();

    assertEqual(input.value, 'nǚ');
});

// Test backspace handling
test('handleBackspace: ǐ → i', () => {
    const input = new MockElement();
    const field = new PinyinField(input, new MockElement(), new MockElement());
    field.attach();

    input.value = 'nǐ';
    input.selectionStart = 2;
    input.selectionEnd = 2;
    input.triggerKeydown('Backspace');

    assertEqual(input.value, 'ni');
});

test('handleBackspace: ü → u', () => {
    const input = new MockElement();
    const field = new PinyinField(input, new MockElement(), new MockElement());
    field.attach();

    input.value = 'nü';
    input.selectionStart = 2;
    input.selectionEnd = 2;
    input.triggerKeydown('Backspace');

    assertEqual(input.value, 'nu');
});

test('handleBackspace: ǚ → ü (tone + umlaut → just umlaut)', () => {
    const input = new MockElement();
    const field = new PinyinField(input, new MockElement(), new MockElement());
    field.attach();

    input.value = 'nǚ';
    input.selectionStart = 2;
    input.selectionEnd = 2;
    input.triggerKeydown('Backspace');

    assertEqual(input.value, 'nü');
});

// Test attach/detach
test('attach: adds event listeners', () => {
    const input = new MockElement();
    const field = new PinyinField(input, new MockElement(), new MockElement());

    field.attach();
    assertEqual(input.eventListeners['input'].length, 1);
    assertEqual(input.eventListeners['keydown'].length, 1);
});

test('detach: removes event listeners', () => {
    const input = new MockElement();
    const field = new PinyinField(input, new MockElement(), new MockElement());

    field.attach();
    field.detach();

    assertEqual(input.eventListeners['input'].length, 0);
    assertEqual(input.eventListeners['keydown'].length, 0);
});

console.log('\n' + '='.repeat(50));
console.log('Summary:', passed + '/' + (passed + failed), 'tests passed');
if (failed > 0) {
    console.log('❌ FAILED:', failed, 'tests');
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
}
