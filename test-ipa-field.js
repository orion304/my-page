// Tests for IPAField (Node.js)

// Mock DOM elements
class MockElement {
    constructor() {
        this.value = '';
        this.textContent = '';
        this.className = '';
        this.selectionStart = 0;
        this.selectionEnd = 0;
    }

    setSelectionRange(start, end) {
        this.selectionStart = start;
        this.selectionEnd = end;
    }
}

// Mock IPAConverter
const mockIPAConverter = {
    attachCalled: false,
    attachOptions: null,
    attachInput: null,

    attachIPAConverterWithTable(input, options) {
        this.attachCalled = true;
        this.attachInput = input;
        this.attachOptions = options;
    },

    reset() {
        this.attachCalled = false;
        this.attachOptions = null;
        this.attachInput = null;
    }
};

// Import IPAField class (copy from field-components.js)
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

    validate(expected) {
        const actual = this.getValue().trim();
        return actual.toLowerCase() === expected.toLowerCase();
    }
}

class IPAField extends BaseField {
    constructor(input, label, feedback, options = {}) {
        super(input, label, feedback);
        this.options = options;
        this.attached = false;
    }

    attach() {
        super.attach();
        // Use mock instead of window.IPAConverter
        if (mockIPAConverter && mockIPAConverter.attachIPAConverterWithTable) {
            mockIPAConverter.attachIPAConverterWithTable(this.input, this.options);
        }
    }

    detach() {
        super.detach();
    }

    validate(expected) {
        const actual = this.getValue().trim().replace(/^\/|\/$/g, '');
        const expectedNormalized = expected.trim().replace(/^\/|\/$/g, '');
        return actual.toLowerCase() === expectedNormalized.toLowerCase();
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

console.log('IPAField Tests\n');

// Test slash-stripping validation
test('validate: strips slashes from both sides', () => {
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    input.value = '/ni3/';
    assert(field.validate('ni3'));
    assert(field.validate('/ni3/'));
});

test('validate: with slashes on input only', () => {
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    input.value = '/ni3/';
    assert(field.validate('ni3'));
});

test('validate: with slashes on expected only', () => {
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    input.value = 'ni3';
    assert(field.validate('/ni3/'));
});

test('validate: no slashes on either', () => {
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    input.value = 'ni3';
    assert(field.validate('ni3'));
});

test('validate: case insensitive', () => {
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    input.value = '/NI3/';
    assert(field.validate('ni3'));
});

test('validate: complex IPA with slashes', () => {
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    input.value = '/ni˨˩˦ xɑʊ˨˩˦/';
    assert(field.validate('ni˨˩˦ xɑʊ˨˩˦'));
});

test('validate: incorrect value fails', () => {
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    input.value = '/ni3/';
    assert(!field.validate('hao3'));
});

test('validate: partial slash stripping (leading only)', () => {
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    input.value = '/ni3';
    assert(field.validate('ni3'));
});

test('validate: partial slash stripping (trailing only)', () => {
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    input.value = 'ni3/';
    assert(field.validate('ni3'));
});

// Test attach behavior
test('attach: calls IPAConverter.attachIPAConverterWithTable', () => {
    mockIPAConverter.reset();
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    field.attach();

    assert(mockIPAConverter.attachCalled, 'IPAConverter.attachIPAConverterWithTable should be called');
    assertEqual(mockIPAConverter.attachInput, input);
});

test('attach: passes options to IPAConverter', () => {
    mockIPAConverter.reset();
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement(), { mandarin: true });

    field.attach();

    assert(mockIPAConverter.attachCalled);
    assertEqual(mockIPAConverter.attachOptions.mandarin, true);
});

test('attach: default options (no Mandarin)', () => {
    mockIPAConverter.reset();
    const input = new MockElement();
    const field = new IPAField(input, new MockElement(), new MockElement());

    field.attach();

    assert(mockIPAConverter.attachCalled);
    assertEqual(Object.keys(mockIPAConverter.attachOptions).length, 0);
});

console.log('\n' + '='.repeat(50));
console.log('Summary:', passed + '/' + (passed + failed), 'tests passed');
if (failed > 0) {
    console.log('❌ FAILED:', failed, 'tests');
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
}
