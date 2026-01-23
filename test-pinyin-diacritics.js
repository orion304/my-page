// Tests for Pinyin Diacritic → Tone Number Conversion (Node.js)

// Simplified PinyinConverter implementation for testing
const PinyinConverter = (() => {
    function stripPinyinDiacritics(pinyin) {
        // Diacritic to tone number mapping
        const diacriticMap = {
            // First tone (high level)
            'ā': 'a1', 'ē': 'e1', 'ī': 'i1', 'ō': 'o1', 'ū': 'u1', 'ǖ': 'ü1',
            // Second tone (rising)
            'á': 'a2', 'é': 'e2', 'í': 'i2', 'ó': 'o2', 'ú': 'u2', 'ǘ': 'ü2',
            // Third tone (dipping)
            'ǎ': 'a3', 'ě': 'e3', 'ǐ': 'i3', 'ǒ': 'o3', 'ǔ': 'u3', 'ǚ': 'ü3',
            // Fourth tone (falling)
            'à': 'a4', 'è': 'e4', 'ì': 'i4', 'ò': 'o4', 'ù': 'u4', 'ǜ': 'ü4',
            // Neutral tone (no diacritic, but handle ü)
            'ü': 'ü5'
        };

        const syllables = pinyin.trim().split(/\s+/);
        const converted = syllables.map(syllable => {
            let result = syllable;
            let toneFound = false;

            // Check each character for diacritic
            for (let i = 0; i < syllable.length; i++) {
                const char = syllable[i];
                if (diacriticMap[char]) {
                    const replacement = diacriticMap[char];
                    // Extract vowel and tone
                    const vowel = replacement.slice(0, -1);
                    const tone = replacement.slice(-1);

                    // Replace diacritic vowel with plain vowel
                    result = result.substring(0, i) + vowel + result.substring(i + 1);
                    // Append tone number at end
                    result = result + tone;
                    toneFound = true;
                    break;
                }
            }

            // If no tone found, assume neutral tone (5)
            if (!toneFound && result.length > 0) {
                result = result + '5';
            }

            return result;
        });

        return converted.join(' ');
    }

    return {
        stripPinyinDiacritics,
    };
})();

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
        throw new Error(message || `Expected "${expected}", got "${actual}"`);
    }
}

console.log('Pinyin Diacritic → Tone Number Conversion Tests\n');

// Basic single-syllable tests
test('single syllable: bào → bao4', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('bào'), 'bao4');
});

test('single syllable: zhǐ → zhi3', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('zhǐ'), 'zhi3');
});

test('single syllable: nǐ → ni3', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('nǐ'), 'ni3');
});

test('single syllable: hǎo → hao3', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('hǎo'), 'hao3');
});

// Multi-syllable tests (CC-CEDICT format)
test('two syllables: bào zhǐ → bao4 zhi3', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('bào zhǐ'), 'bao4 zhi3');
});

test('two syllables: nǐ hǎo → ni3 hao3', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('nǐ hǎo'), 'ni3 hao3');
});

test('two syllables: guǒ zhī → guo3 zhi1', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('guǒ zhī'), 'guo3 zhi1');
});

test('two syllables: zhōng guó → zhong1 guo2', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('zhōng guó'), 'zhong1 guo2');
});

// ü (u with umlaut) tests
test('ü with tone: lǘ → lü2', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('lǘ'), 'lü2');
});

test('ü with tone: nǚ → nü3', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('nǚ'), 'nü3');
});

test('ü with tone: lǜ → lü4', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('lǜ'), 'lü4');
});

// All four tones
test('first tone: mā → ma1', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('mā'), 'ma1');
});

test('second tone: má → ma2', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('má'), 'ma2');
});

test('third tone: mǎ → ma3', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('mǎ'), 'ma3');
});

test('fourth tone: mà → ma4', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('mà'), 'ma4');
});

// Neutral tone (no diacritic)
test('neutral tone: ma → ma5', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('ma'), 'ma5');
});

// Different vowels with tones
test('e vowel: hé → he2', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('hé'), 'he2');
});

test('i vowel: bǐ → bi3', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('bǐ'), 'bi3');
});

test('o vowel: bó → bo2', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('bó'), 'bo2');
});

test('u vowel: bù → bu4', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('bù'), 'bu4');
});

// Complex multi-syllable
test('three syllables: wǒ ài nǐ → wo3 ai4 ni3', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('wǒ ài nǐ'), 'wo3 ai4 ni3');
});

test('four syllables: nán rén nǚ rén → nan2 ren2 nü3 ren2', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('nán rén nǚ rén'), 'nan2 ren2 nü3 ren2');
});

// Edge cases
test('empty string: "" → ""', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics(''), '');
});

test('extra spaces: "nǐ  hǎo" → "ni3 hao3"', () => {
    assertEqual(PinyinConverter.stripPinyinDiacritics('nǐ  hǎo'), 'ni3 hao3');
});

console.log('\n' + '='.repeat(50));
console.log('Summary:', passed + '/' + (passed + failed), 'tests passed');
if (failed > 0) {
    console.log('❌ FAILED:', failed, 'tests');
    process.exit(1);
} else {
    console.log('✅ All tests passed!');
}
