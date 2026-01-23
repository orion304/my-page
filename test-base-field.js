// Tests for BaseField and EnglishField (Node.js)

// Simple mock DOM elements for testing
class MockElement {
    constructor() {
        this.value = '';
        this.textContent = '';
        this.className = '';
    }
}

// Import field classes (simulate browser environment)
class BaseField {
    constructor(input, label, feedback) {
        this.input = input;
        this.label = label;
        this.feedback = feedback;
        this.attached = false;
    }

    attach() {
        this.attached = true;
    }

    detach() {
        this.attached = false;
    }

    getValue() {
        return this.input.value;
    }

    setValue(value) {
        this.input.value = value;
    }

    clear() {
        this.input.value = '';
        this.feedback.textContent = '';
        this.feedback.className = 'answer-feedback';
        this.input.className = 'answer-input';
    }

    validate(expected) {
        const actual = this.getValue().trim();
        return actual.toLowerCase() === expected.toLowerCase();
    }

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

    getFieldName() {
        return this.label.textContent.trim();
    }
}

class EnglishField extends BaseField {
    // No special behavior
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

console.log('BaseField and EnglishField Tests\n');

// Test BaseField
test('BaseField: getValue/setValue', () => {
    const input = new MockElement();
    const label = new MockElement();
    const feedback = new MockElement();
    const field = new BaseField(input, label, feedback);

    field.setValue('test value');
    assertEqual(field.getValue(), 'test value');
});

test('BaseField: clear resets all elements', () => {
    const input = new MockElement();
    const label = new MockElement();
    const feedback = new MockElement();
    const field = new BaseField(input, label, feedback);

    field.setValue('test');
    input.className = 'answer-input incorrect';
    feedback.textContent = 'Some feedback';
    feedback.className = 'answer-feedback incorrect';

    field.clear();

    assertEqual(field.getValue(), '');
    assertEqual(feedback.textContent, '');
    assertEqual(feedback.className, 'answer-feedback');
    assertEqual(input.className, 'answer-input');
});

test('BaseField: validate - exact match (case insensitive)', () => {
    const input = new MockElement();
    const label = new MockElement();
    const feedback = new MockElement();
    const field = new BaseField(input, label, feedback);

    field.setValue('dog');
    assert(field.validate('dog'));
    assert(field.validate('DOG'));
    assert(field.validate('Dog'));
    assert(!field.validate('cat'));
});

test('BaseField: validate - trims whitespace', () => {
    const input = new MockElement();
    const label = new MockElement();
    const feedback = new MockElement();
    const field = new BaseField(input, label, feedback);

    field.setValue('  dog  ');
    assert(field.validate('dog'));
});

test('BaseField: showFeedback - correct answer', () => {
    const input = new MockElement();
    const label = new MockElement();
    const feedback = new MockElement();
    const field = new BaseField(input, label, feedback);

    field.showFeedback(true);

    assertEqual(feedback.textContent, '✓ Correct');
    assertEqual(feedback.className, 'answer-feedback correct');
    assertEqual(input.className, 'answer-input correct');
});

test('BaseField: showFeedback - incorrect answer', () => {
    const input = new MockElement();
    const label = new MockElement();
    const feedback = new MockElement();
    const field = new BaseField(input, label, feedback);

    field.showFeedback(false, 'dog');

    assertEqual(feedback.textContent, '✗ Expected: dog');
    assertEqual(feedback.className, 'answer-feedback incorrect');
    assertEqual(input.className, 'answer-input incorrect');
});

test('BaseField: attach/detach tracking', () => {
    const input = new MockElement();
    const label = new MockElement();
    const feedback = new MockElement();
    const field = new BaseField(input, label, feedback);

    assert(!field.attached);
    field.attach();
    assert(field.attached);
    field.detach();
    assert(!field.attached);
});

test('BaseField: getFieldName from label', () => {
    const input = new MockElement();
    const label = new MockElement();
    const feedback = new MockElement();
    const field = new BaseField(input, label, feedback);

    label.textContent = 'English';
    assertEqual(field.getFieldName(), 'English');

    label.textContent = '  Pinyin  ';
    assertEqual(field.getFieldName(), 'Pinyin');
});

// Test EnglishField
test('EnglishField: inherits BaseField behavior', () => {
    const input = new MockElement();
    const label = new MockElement();
    const feedback = new MockElement();
    const field = new EnglishField(input, label, feedback);

    field.setValue('hello');
    assert(field.validate('hello'));
    assert(field.validate('HELLO'));
});

console.log('\n' + '='.repeat(50));
console.log('Summary:', passed + '/' + (passed + failed), 'tests passed');
if (failed > 0) {
    console.log('❌ FAILED:', failed, 'tests');
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
}
