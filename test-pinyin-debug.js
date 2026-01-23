// Debug pinyin conversion

const toneMap = {
    'a1': 'ā', 'a2': 'á', 'a3': 'ǎ', 'a4': 'à', 'a5': 'a',
    'e1': 'ē', 'e2': 'é', 'e3': 'ě', 'e4': 'è', 'e5': 'e',
    'i1': 'ī', 'i2': 'í', 'i3': 'ǐ', 'i4': 'ì', 'i5': 'i',
    'o1': 'ō', 'o2': 'ó', 'o3': 'ǒ', 'o4': 'ò', 'o5': 'o',
    'u1': 'ū', 'u2': 'ú', 'u3': 'ǔ', 'u4': 'ù', 'u5': 'u',
    'ü1': 'ǖ', 'ü2': 'ǘ', 'ü3': 'ǚ', 'ü4': 'ǜ', 'ü5': 'ü',
    'v1': 'ǖ', 'v2': 'ǘ', 'v3': 'ǚ', 'v4': 'ǜ', 'v5': 'ü'
};

function convertTonesDebug(text) {
    const syllables = text.split(' ');
    const converted = syllables.map(syllable => {
        console.log('\n--- Processing syllable:', syllable);
        let result = '';
        let remaining = syllable;
        let maxIterations = 10;
        let iterations = 0;

        while (remaining.length > 0 && iterations < maxIterations) {
            const match = remaining.match(/^([^aeiouüv]*)([aeiouüv]+)(n(?!g)|ng)?([1-5])/i);
            if (!match) {
                console.log('  No match found, appending remaining:', JSON.stringify(remaining));
                result += remaining;
                break;
            }

            iterations++;
            console.log('  Iteration', iterations, '- matched:', match[0]);
            const consonants = match[1];
            const vowelGroup = match[2].toLowerCase();
            const finals = match[3] || '';
            const tone = match[4];

            console.log('    consonants:', JSON.stringify(consonants));
            console.log('    vowelGroup:', JSON.stringify(vowelGroup));
            console.log('    finals:', JSON.stringify(finals));
            console.log('    tone:', tone);

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

            console.log('    targetVowel:', targetVowel, 'at index', targetIndex);

            const accentedVowel = toneMap[targetVowel + tone] || targetVowel;
            const convertedVowelGroup = vowelGroup.substring(0, targetIndex) +
                                       accentedVowel +
                                       vowelGroup.substring(targetIndex + 1);

            const convertedPart = consonants + convertedVowelGroup + finals;
            result += convertedPart;
            remaining = remaining.substring(match[0].length);

            console.log('    converted part:', JSON.stringify(convertedPart));
            console.log('    result so far:', JSON.stringify(result));
            console.log('    remaining:', JSON.stringify(remaining));
        }

        return result;
    });

    return converted.join(' ');
}

console.log('Testing nan2ren2:');
console.log('Result:', convertTonesDebug('nan2ren2'));

console.log('\n\nTesting ni3hao3:');
console.log('Result:', convertTonesDebug('ni3hao3'));
