// Tests for HanziField (Node.js)

// Mock DOM elements
class MockElement {
    constructor() {
        this.value = '';
        this.textContent = '';
        this.className = '';
        this.style = { display: '' };
        this.innerHTML = '';
        this.dataset = {};
        this.children = [];
        this.classList = {
            add: (cls) => {
                this.className = this.className ? this.className + ' ' + cls : cls;
            },
            remove: (cls) => {
                this.className = this.className.replace(cls, '').trim();
            },
            contains: (cls) => {
                return this.className.includes(cls);
            }
        };
        this.eventListeners = {};
    }

    appendChild(child) {
        this.children.push(child);
    }

    querySelectorAll(selector) {
        // Simple mock: return all children if selector matches
        if (selector === '.hanzi-choice') {
            return this.children.filter(c => c.className.includes('hanzi-choice'));
        }
        return [];
    }

    addEventListener(event, handler) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(handler);
    }

    // Simulate click
    click() {
        if (this.eventListeners['click']) {
            this.eventListeners['click'].forEach(handler => handler());
        }
    }
}

// Mock document.createElement
global.document = {
    createElement: (tag) => {
        const el = new MockElement();
        el.tagName = tag.toUpperCase();
        return el;
    }
};

// Import HanziField class
class BaseField {
    constructor(input, label, feedback) {
        this.input = input;
        this.label = label;
        this.feedback = feedback;
        this.attached = false;
    }

    getValue() { return this.input.value; }
    setValue(value) { this.input.value = value; }

    clear() {
        this.input.value = '';
        this.feedback.textContent = '';
        this.feedback.className = 'answer-feedback';
        this.input.className = 'answer-input';
    }
}

class HanziField extends BaseField {
    constructor(input, label, feedback, choicesContainer, getDistractors) {
        super(input, label, feedback);
        this.choicesContainer = choicesContainer;
        this.getDistractors = getDistractors;
    }

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

        this.input.style.display = 'none';
        this.choicesContainer.style.display = 'grid';
    }

    selectChoice(btn, hanzi) {
        this.choicesContainer.querySelectorAll('.hanzi-choice').forEach(b => {
            b.classList.remove('selected');
        });
        btn.classList.add('selected');
        this.choicesContainer.dataset.selected = hanzi;
    }

    getValue() {
        return this.choicesContainer.dataset.selected || '';
    }

    clear() {
        super.clear();
        this.choicesContainer.style.display = 'none';
        this.choicesContainer.innerHTML = '';
        this.choicesContainer.dataset.selected = '';
        this.input.style.display = 'block';
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

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
}

console.log('HanziField Tests\n');

// Mock getDistractors function
function mockGetDistractors(correctHanzi, count) {
    const allHanzi = ['你', '好', '我', '是', '不', '吗', '的', '了', '在', '他', '她', '们'];
    return allHanzi.filter(h => h !== correctHanzi).slice(0, count);
}

// Test setupChoices
test('setupChoices: creates 10 buttons (1 correct + 9 distractors)', () => {
    const input = new MockElement();
    const choicesContainer = new MockElement();
    const field = new HanziField(input, new MockElement(), new MockElement(), choicesContainer, mockGetDistractors);

    field.setupChoices('你');

    assertEqual(choicesContainer.children.length, 10);
    assert(choicesContainer.children.every(c => c.className.includes('hanzi-choice')));
});

test('setupChoices: hides input, shows choices', () => {
    const input = new MockElement();
    const choicesContainer = new MockElement();
    const field = new HanziField(input, new MockElement(), new MockElement(), choicesContainer, mockGetDistractors);

    field.setupChoices('你');

    assertEqual(input.style.display, 'none');
    assertEqual(choicesContainer.style.display, 'grid');
});

test('setupChoices: stores correct answer in dataset', () => {
    const input = new MockElement();
    const choicesContainer = new MockElement();
    const field = new HanziField(input, new MockElement(), new MockElement(), choicesContainer, mockGetDistractors);

    field.setupChoices('你');

    assertEqual(choicesContainer.dataset.correct, '你');
});

test('setupChoices: includes correct hanzi in options', () => {
    const input = new MockElement();
    const choicesContainer = new MockElement();
    const field = new HanziField(input, new MockElement(), new MockElement(), choicesContainer, mockGetDistractors);

    field.setupChoices('你');

    const hanziTexts = choicesContainer.children.map(c => c.textContent);
    assert(hanziTexts.includes('你'), 'Correct hanzi should be in options');
});

// Test selectChoice
test('selectChoice: sets selected class on button', () => {
    const input = new MockElement();
    const choicesContainer = new MockElement();
    const field = new HanziField(input, new MockElement(), new MockElement(), choicesContainer, mockGetDistractors);

    field.setupChoices('你');
    const btn = choicesContainer.children[0];
    btn.click();

    assert(btn.classList.contains('selected'));
});

test('selectChoice: stores selected value in dataset', () => {
    const input = new MockElement();
    const choicesContainer = new MockElement();
    const field = new HanziField(input, new MockElement(), new MockElement(), choicesContainer, mockGetDistractors);

    field.setupChoices('你');
    const btn = choicesContainer.children[0];
    const hanzi = btn.textContent;
    btn.click();

    assertEqual(choicesContainer.dataset.selected, hanzi);
});

test('selectChoice: removes selected from other buttons', () => {
    const input = new MockElement();
    const choicesContainer = new MockElement();
    const field = new HanziField(input, new MockElement(), new MockElement(), choicesContainer, mockGetDistractors);

    field.setupChoices('你');

    // Click first button
    choicesContainer.children[0].click();
    assert(choicesContainer.children[0].classList.contains('selected'));

    // Click second button
    choicesContainer.children[1].click();
    assert(!choicesContainer.children[0].classList.contains('selected'));
    assert(choicesContainer.children[1].classList.contains('selected'));
});

// Test getValue
test('getValue: returns selected hanzi', () => {
    const input = new MockElement();
    const choicesContainer = new MockElement();
    const field = new HanziField(input, new MockElement(), new MockElement(), choicesContainer, mockGetDistractors);

    field.setupChoices('你');
    const btn = choicesContainer.children[2];
    btn.click();

    assertEqual(field.getValue(), btn.textContent);
});

test('getValue: returns empty string when nothing selected', () => {
    const input = new MockElement();
    const choicesContainer = new MockElement();
    const field = new HanziField(input, new MockElement(), new MockElement(), choicesContainer, mockGetDistractors);

    field.setupChoices('你');

    assertEqual(field.getValue(), '');
});

// Test clear
test('clear: resets choices and shows input', () => {
    const input = new MockElement();
    const choicesContainer = new MockElement();
    const field = new HanziField(input, new MockElement(), new MockElement(), choicesContainer, mockGetDistractors);

    field.setupChoices('你');
    choicesContainer.children[0].click();

    field.clear();

    assertEqual(choicesContainer.style.display, 'none');
    assertEqual(choicesContainer.innerHTML, '');
    assertEqual(choicesContainer.dataset.selected, '');
    assertEqual(input.style.display, 'block');
});

console.log('\n' + '='.repeat(50));
console.log('Summary:', passed + '/' + (passed + failed), 'tests passed');
if (failed > 0) {
    console.log('❌ FAILED:', failed, 'tests');
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
}
