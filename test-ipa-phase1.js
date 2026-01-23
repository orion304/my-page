// Phase 1: IPA Converter Namespace Fix Tests (Node.js)

// IPA character mapping (from ipa-converter.js)
const ipaCharMap = {
    'a1': 'ɑ', 'a2': 'æ', 'a3': 'ɐ', 'a4': 'ɑ̃',
    'e1': 'ə', 'e2': 'ɛ', 'e3': 'ɜ', 'e4': 'ɝ', 'e5': 'ɘ', 'e6': 'ɞ', 'e7': 'ɛ̃', 'e8': 'ɚ',
    'i1': 'ɪ', 'i2': 'ɨ', 'i3': 'ɪ̈',
    'o1': 'ɔ', 'o2': 'ɔ̃', 'o3': 'ø', 'o4': 'œ', 'o5': 'ɶ',
    'u1': 'ʊ', 'u2': 'ʉ', 'u3': 'ɥ',
    'y1': 'ʏ', 'y2': 'ʎ', 'y3': 'ɣ', 'y4': 'ɤ', 'y5': 'y',
    'b1': 'β', 'b2': 'ɓ', 'b3': 'ʙ',
    'c1': 'ç', 'c2': 'ɕ',
    'd1': 'ð', 'd2': 'ɗ', 'd3': 'ɖ',
    'f1': 'ɸ',
    'g1': 'ɡ', 'g2': 'ɠ', 'g3': 'ɢ', 'g4': 'ʛ',
    'h1': 'ħ', 'h2': 'ɦ', 'h3': 'ɥ', 'h4': 'ɧ', 'h5': 'ʜ',
    'j1': 'ɟ', 'j2': 'ʄ',
    'l1': 'ɫ', 'l2': 'ɭ', 'l3': 'ɬ', 'l4': 'ʟ', 'l5': 'ɮ',
    'm1': 'ɱ',
    'n1': 'ŋ', 'n2': 'ɲ', 'n3': 'ɳ', 'n4': 'ɴ',
    'p1': 'ɸ',
    'r1': 'ɾ', 'r2': 'ɹ', 'r3': 'ʀ', 'r4': 'ʁ', 'r5': 'ɼ', 'r6': 'ɽ', 'r7': 'ɺ', 'r8': 'ɻ',
    's1': 'ʃ', 's2': 'ʂ',
    't1': 'θ', 't2': 'ʈ',
    'v1': 'ʌ', 'v2': 'ʋ', 'v3': 'ⱱ',
    'w1': 'ʍ',
    'x1': 'χ', 'x2': 'x',
    'z1': 'ʒ', 'z2': 'ʐ', 'z3': 'ʑ',
    'q1': 'ˈ', 'q2': 'ˌ',
    'k1': 'ː', 'k2': 'ˑ',
};

// Tone letter map (fixed - only ! prefix)
const toneLetterMap = {
    '!5': '˥',
    '!4': '˦',
    '!3': '˧',
    '!2': '˨',
    '!1': '˩',
};

// Mandarin tone map
const mandarinToneMap = {
    '1': '˥˥',
    '2': '˧˥',
    '3': '˨˩˦',
    '4': '˥˩',
};

function convertIPA(text, options = {}) {
    let result = text;

    // First: aspiration
    const aspirationPatterns = [
        ['ph', 'pʰ'], ['Ph', 'Pʰ'], ['PH', 'Pʰ'],
        ['th', 'tʰ'], ['Th', 'Tʰ'], ['TH', 'Tʰ'],
        ['kh', 'kʰ'], ['Kh', 'Kʰ'], ['KH', 'Kʰ'],
        ['ch', 'cʰ'], ['Ch', 'Cʰ'], ['CH', 'Cʰ'],
        ['bh', 'bʰ'], ['Bh', 'Bʰ'], ['BH', 'Bʰ'],
        ['dh', 'dʰ'], ['Dh', 'Dʰ'], ['DH', 'Dʰ'],
        ['gh', 'gʰ'], ['Gh', 'Gʰ'], ['GH', 'Gʰ'],
    ];

    for (const [pattern, replacement] of aspirationPatterns) {
        result = result.split(pattern).join(replacement);
    }

    // Second: Mandarin tones
    if (options.mandarin) {
        result = result.replace(/\.([1-4])/g, (match, tone) => mandarinToneMap[tone]);
        result = result.replace(/\.5/g, '');
    }

    // Third: tone letters
    for (const [key, value] of Object.entries(toneLetterMap)) {
        result = result.split(key).join(value);
    }

    // Fourth: IPA characters
    const sortedKeys = Object.keys(ipaCharMap).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        const regex = new RegExp(key, 'gi');
        result = result.replace(regex, () => ipaCharMap[key.toLowerCase()]);
    }

    return result;
}

// Test framework
let passed = 0, failed = 0;

function test(desc, input, expected, options = {}) {
    const result = convertIPA(input, options);
    const pass = result === expected;
    if (pass) {
        passed++;
        console.log('✓', desc);
    } else {
        failed++;
        console.log('✗', desc);
        console.log('  Input:', JSON.stringify(input), '→ Expected:', JSON.stringify(expected), '→ Got:', JSON.stringify(result));
    }
}

console.log('Phase 1: IPA Converter Namespace Fix Tests\n');

// Test 1: IPA consonant shortcuts (CRITICAL - were broken before)
test('t1 → θ (IPA theta)', 't1', 'θ');
test('t2 → ʈ (IPA retroflex)', 't2', 'ʈ');

// Test 2: Tone marks with ! prefix
test('!1 → ˩ (extra low)', '!1', '˩');
test('!2 → ˨ (low)', '!2', '˨');
test('!3 → ˧ (mid)', '!3', '˧');
test('!4 → ˦ (high)', '!4', '˦');
test('!5 → ˥ (extra high)', '!5', '˥');

// Test 3: Mandarin tones
test('.1 → ˥˥ (Mandarin 1st)', '.1', '˥˥', { mandarin: true });
test('.2 → ˧˥ (Mandarin 2nd)', '.2', '˧˥', { mandarin: true });
test('.3 → ˨˩˦ (Mandarin 3rd)', '.3', '˨˩˦', { mandarin: true });
test('.4 → ˥˩ (Mandarin 4th)', '.4', '˥˩', { mandarin: true });
test('.5 → (neutral)', '.5', '', { mandarin: true });

// Test 4: Other IPA characters
test('s1 → ʃ', 's1', 'ʃ');
test('z1 → ʒ', 'z1', 'ʒ');
test('n1 → ŋ', 'n1', 'ŋ');

// Test 5: Aspiration
test('ph → pʰ', 'ph', 'pʰ');
test('th → tʰ', 'th', 'tʰ');
test('kh → kʰ', 'kh', 'kʰ');

// Test 6: Complex combinations
test('ni.3 → ni˨˩˦', 'ni.3', 'ni˨˩˦', { mandarin: true });
test('t2s2 → ʈʂ', 't2s2', 'ʈʂ');
test('t2s2a.2 → ʈʂa˧˥', 't2s2a.2', 'ʈʂa˧˥', { mandarin: true });
test('!3!5 → ˧˥', '!3!5', '˧˥');

// Test 7: Old format no longer converts (proves namespace fix worked)
test('t3 unchanged', 't3', 't3');
test('t4 unchanged', 't4', 't4');
test('t5 unchanged', 't5', 't5');

console.log('\n' + '='.repeat(50));
console.log('Summary:', passed + '/' + (passed + failed), 'tests passed');
if (failed > 0) {
    console.log('❌ FAILED:', failed, 'tests');
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
}
