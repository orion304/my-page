// Test different pinyin input formats

const toneMap = {
    'a1': 'ā', 'a2': 'á', 'a3': 'ǎ', 'a4': 'à', 'a5': 'a',
    'e1': 'ē', 'e2': 'é', 'e3': 'ě', 'e4': 'è', 'e5': 'e',
    'i1': 'ī', 'i2': 'í', 'i3': 'ǐ', 'i4': 'ì', 'i5': 'i',
    'o1': 'ō', 'o2': 'ó', 'o3': 'ǒ', 'o4': 'ò', 'o5': 'o',
    'u1': 'ū', 'u2': 'ú', 'u3': 'ǔ', 'u4': 'ù', 'u5': 'u',
    'ü1': 'ǖ', 'ü2': 'ǘ', 'ü3': 'ǚ', 'ü4': 'ǜ', 'ü5': 'ü',
    'v1': 'ǖ', 'v2': 'ǘ', 'v3': 'ǚ', 'v4': 'ǜ', 'v5': 'ü'
};

function convertTones(text) {
    const syllables = text.split(' ');
    const converted = syllables.map(syllable => {
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

            const accentedVowel = toneMap[targetVowel + tone] || targetVowel;
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

console.log('Testing different pinyin input formats:\n');
console.log('SPACE-SEPARATED (traditional):');
console.log('  nan2 ren2 →', convertTones('nan2 ren2'));
console.log('  ni3 hao3 →', convertTones('ni3 hao3'));
console.log();
console.log('COMPOUND WORDS (no spaces):');
console.log('  nan2ren2 →', convertTones('nan2ren2'));
console.log('  ni3hao3 →', convertTones('ni3hao3'));
console.log('  zhong1guo2 →', convertTones('zhong1guo2'));
console.log();
console.log('MIXED FORMATS:');
console.log('  wo3ai4zhong1guo2 →', convertTones('wo3ai4zhong1guo2'));
console.log('  ni3 hao3ma5 →', convertTones('ni3 hao3ma5'));
console.log();
console.log('EDGE CASES:');
console.log('  lü3 →', convertTones('lü3'));
console.log('  nü3hai2zi5 →', convertTones('nü3hai2zi5'));
console.log('  ma1ma5 →', convertTones('ma1ma5'));
