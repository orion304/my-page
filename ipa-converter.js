// Shared IPA Character Converter
// Used by French and Chinese trainers for IPA input field conversion

// IPA character mapping: letter+number → IPA character
const ipaCharMap = {
    // Vowels - A variants
    'a1': 'ɑ', 'a2': 'æ', 'a3': 'ɐ', 'a4': 'ɑ̃',
    // Vowels - E variants
    'e1': 'ə', 'e2': 'ɛ', 'e3': 'ɜ', 'e4': 'ɝ', 'e5': 'ɘ', 'e6': 'ɞ', 'e7': 'ɛ̃', 'e8': 'ɚ',
    // Vowels - I variants
    'i1': 'ɪ', 'i2': 'ɨ', 'i3': 'ɪ̈',
    // Vowels - O variants
    'o1': 'ɔ', 'o2': 'ɔ̃', 'o3': 'ø', 'o4': 'œ', 'o5': 'ɶ',
    // Vowels - U variants
    'u1': 'ʊ', 'u2': 'ʉ', 'u3': 'ɥ',
    // Vowels - Y variants (includes ü for German/Chinese)
    'y1': 'ʏ', 'y2': 'ʎ', 'y3': 'ɣ', 'y4': 'ɤ', 'y5': 'y',
    // Consonants - B variants
    'b1': 'β', 'b2': 'ɓ', 'b3': 'ʙ',
    // Consonants - C variants
    'c1': 'ç', 'c2': 'ɕ',
    // Consonants - D variants
    'd1': 'ð', 'd2': 'ɗ', 'd3': 'ɖ',
    // Consonants - F variants
    'f1': 'ɸ',
    // Consonants - G variants
    'g1': 'ɡ', 'g2': 'ɠ', 'g3': 'ɢ', 'g4': 'ʛ',
    // Consonants - H variants
    'h1': 'ħ', 'h2': 'ɦ', 'h3': 'ɥ', 'h4': 'ɧ', 'h5': 'ʜ',
    // Consonants - J variants
    'j1': 'ɟ', 'j2': 'ʄ',
    // Consonants - L variants
    'l1': 'ɫ', 'l2': 'ɭ', 'l3': 'ɬ', 'l4': 'ʟ', 'l5': 'ɮ',
    // Consonants - M variants
    'm1': 'ɱ',
    // Consonants - N variants
    'n1': 'ŋ', 'n2': 'ɲ', 'n3': 'ɳ', 'n4': 'ɴ',
    // Consonants - P variants
    'p1': 'ɸ',
    // Consonants - R variants
    'r1': 'ɾ', 'r2': 'ɹ', 'r3': 'ʀ', 'r4': 'ʁ', 'r5': 'ɼ', 'r6': 'ɽ', 'r7': 'ɺ', 'r8': 'ɻ',
    // Consonants - S variants
    's1': 'ʃ', 's2': 'ʂ',
    // Consonants - T variants
    't1': 'θ', 't2': 'ʈ',
    // Consonants - V variants
    'v1': 'ʌ', 'v2': 'ʋ', 'v3': 'ⱱ',
    // Consonants - W variants
    'w1': 'ʍ',
    // Consonants - X variants (includes velar fricative for Chinese)
    'x1': 'χ', 'x2': 'x',
    // Consonants - Z variants
    'z1': 'ʒ', 'z2': 'ʐ', 'z3': 'ʑ',
    // Special symbols
    'q1': 'ˈ', 'q2': 'ˌ',  // primary and secondary stress
    'k1': 'ː', 'k2': 'ˑ',   // length marks
};

// Tone number shortcuts for Chinese IPA (convert to superscript)
const toneNumberMap = {
    '!1': '¹',
    '!2': '²',
    '!3': '³',
    '!4': '⁴',
    '!5': '⁵',  // Neutral tone
};

function convertIPA(text) {
    // Convert letter+number combinations to IPA characters
    let result = text;

    // First, convert tone numbers (Chinese) - use ! prefix to avoid conflicts
    // Example: !1 → ¹, !2 → ²
    for (const [key, value] of Object.entries(toneNumberMap)) {
        result = result.split(key).join(value);
    }

    // Then convert IPA character shortcuts
    // Sort keys by length (longest first) to handle multi-character sequences
    const sortedKeys = Object.keys(ipaCharMap).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        const regex = new RegExp(key, 'gi');
        result = result.replace(regex, (match) => {
            // Get IPA character (case-insensitive)
            const ipaChar = ipaCharMap[key.toLowerCase()];
            return ipaChar;
        });
    }

    return result;
}

function handleIPAInput(e) {
    const input = e.target;
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;

    const converted = convertIPA(input.value);

    if (converted !== input.value) {
        input.value = converted;
        // Adjust cursor position
        const lengthDiff = converted.length - originalLength;
        input.setSelectionRange(cursorPos + lengthDiff, cursorPos + lengthDiff);
    }
}

// Attach IPA converter to a given input field
function attachIPAConverter(inputField) {
    if (!inputField) return;

    // Remove any existing listener first
    inputField.removeEventListener('input', handleIPAInput);

    // Add IPA converter
    inputField.addEventListener('input', handleIPAInput);
}

// Export for use in trainers
window.IPAConverter = {
    convertIPA,
    handleIPAInput,
    attachIPAConverter,
    ipaCharMap,
    toneNumberMap
};
