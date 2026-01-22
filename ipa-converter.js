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

// Chao tone letter shortcuts for IPA (language-agnostic tone representation)
// These are the standard IPA tone diacritics used across tonal languages
const toneLetterMap = {
    't5': '˥',  // Extra high tone (tone 5)
    't4': '˦',  // High tone (tone 4)
    't3': '˧',  // Mid tone (tone 3)
    't2': '˨',  // Low tone (tone 2)
    't1': '˩',  // Extra low tone (tone 1)
    // Alternative shortcuts with ! prefix for consistency
    '!5': '˥',
    '!4': '˦',
    '!3': '˧',
    '!2': '˨',
    '!1': '˩',
};

// Mandarin-specific tone shortcuts (single digits convert to Mandarin tone patterns)
// These map Mandarin tone numbers to their specific Chao letter combinations
const mandarinToneMap = {
    '1': '˥˥',  // First tone: high level (55)
    '2': '˧˥',  // Second tone: rising (35)
    '3': '˨˩˦', // Third tone: dipping (214)
    '4': '˥˩',  // Fourth tone: falling (51)
};

// Pronunciation tips for IPA characters
// Used for clickable popup hints in reference tables
const pronunciationTips = {
    // Chinese consonants
    'p': 'Unaspirated /p/ like English "spy" (not "pie")',
    'pʰ': 'Aspirated /p/ like English "pie" with extra breath',
    't': 'Unaspirated /t/ like English "sty" (not "tie")',
    'tʰ': 'Aspirated /t/ like English "tie" with extra breath',
    'k': 'Unaspirated /k/ like English "sky" (not "kite")',
    'kʰ': 'Aspirated /k/ like English "kite" with extra breath',
    'ʈʂ': 'Retroflex affricate like "church" with tongue curled back',
    'ʈʂʰ': 'Aspirated retroflex affricate like "church" with curled tongue and extra breath',
    'ʂ': 'Retroflex fricative like "sh" in "ship" with tongue curled back',
    'ɻ': 'Retroflex approximant like American "r" in "red"',
    'tɕ': 'Alveolo-palatal affricate between "j" in "jeep" and "ch" in "cheap"',
    'tɕʰ': 'Aspirated alveolo-palatal affricate like tɕ with extra breath',
    'ɕ': 'Alveolo-palatal fricative between "sh" and "s"',
    'f': 'Voiceless labiodental fricative like English "f" in "fun"',
    's': 'Voiceless alveolar fricative like English "s" in "sun"',
    'x': 'Voiceless velar fricative like German "ch" in "doch"',
    'ʐ': 'Voiced retroflex fricative like "zh" in "Zhivago" with curled tongue',
    'm': 'Bilabial nasal like English "m" in "man"',
    'n': 'Alveolar nasal like English "n" in "nun"',
    'ŋ': 'Velar nasal like "ng" in "sing" (not "n" in "finger")',
    'l': 'Alveolar lateral like English "l" in "lip"',

    // Chinese vowels
    'i': 'Close front unrounded like "ee" in "see"',
    'y': 'Close front rounded like German "ü" in "über"',
    'u': 'Close back rounded like "oo" in "food"',
    'ɑ': 'Open back unrounded like British "a" in "father"',
    'ɛ': 'Open-mid front unrounded like "e" in "bed"',
    'ə': 'Mid central (schwa) like "a" in "about"',
    'ɤ': 'Close-mid back unrounded like "o" in "note" without rounding lips',
    'ɔ': 'Open-mid back rounded like British "o" in "dog"',
    'ɨ': 'Close central (apical) - buzz your tongue after "sh" sound',
    'ʅ': 'Apical vowel - extension of the "sh" sound in "ship"',
    'ʮ': 'Apical vowel - extension of the "r" sound (retroflex position)',

    // Chao tone letters (IPA tone diacritics)
    '˥': 'Extra high tone (5) - highest pitch',
    '˦': 'High tone (4) - high pitch',
    '˧': 'Mid tone (3) - middle pitch',
    '˨': 'Low tone (2) - low pitch',
    '˩': 'Extra low tone (1) - lowest pitch',

    // Mandarin tone combinations
    '˥˥': 'Mandarin 1st tone: high level (55)',
    '˧˥': 'Mandarin 2nd tone: rising (35)',
    '˨˩˦': 'Mandarin 3rd tone: dipping (214)',
    '˥˩': 'Mandarin 4th tone: falling (51)',

    // French-specific IPA characters
    'ʃ': 'Voiceless postalveolar fricative like "sh" in "ship"',
    'ʒ': 'Voiced postalveolar fricative like "s" in "measure"',
    'ʁ': 'Voiced uvular fricative (French "r")',
    'ɲ': 'Palatal nasal like "gn" in French "agneau"',
    'œ': 'Open-mid front rounded like "eu" in French "peur"',
    'ø': 'Close-mid front rounded like "eu" in French "peu"',
    'ɑ̃': 'Nasalized open back vowel like "an" in French "dans"',
    'ɛ̃': 'Nasalized open-mid front vowel like "in" in French "vin"',
    'ɔ̃': 'Nasalized open-mid back vowel like "on" in French "bon"',
    'œ̃': 'Nasalized open-mid front rounded like "un" in French "un"',
};

function convertIPA(text, options = {}) {
    // Convert letter+number combinations to IPA characters
    let result = text;

    // First, convert aspiration: consonant + 'h' → consonant + 'ʰ'
    // Common in Chinese IPA: ph → pʰ, th → tʰ, kh → kʰ, etc.
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

    // Second, convert Mandarin-specific tones if enabled
    // This allows typing ".3" to get "˨˩˦" (Mandarin 3rd tone)
    // Uses period prefix to avoid conflict with IPA character shortcuts (t2, s2, etc.)
    if (options.mandarin) {
        // Match: period followed by tone number 1-4
        // Example: "ni.3" → "ni˨˩˦", "t2s2ha.2" → "ʈʂʰa˧˥"
        result = result.replace(/\.([1-4])/g, (match, tone) => {
            return mandarinToneMap[tone];
        });

        // Remove .5 (neutral tone - no mark added)
        result = result.replace(/\.5/g, '');
    }

    // Third, convert tone letters (Chao tone letters for tonal languages)
    // Example: t5 → ˥ (extra high), t3 → ˧ (mid), t1 → ˩ (extra low)
    // Also supports !5, !3, !1 format
    for (const [key, value] of Object.entries(toneLetterMap)) {
        result = result.split(key).join(value);
    }

    // Fourth, convert IPA character shortcuts
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

function handleIPAInput(e, options = {}) {
    const input = e.target;
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;

    const converted = convertIPA(input.value, options);

    if (converted !== input.value) {
        input.value = converted;
        // Adjust cursor position
        const lengthDiff = converted.length - originalLength;
        input.setSelectionRange(cursorPos + lengthDiff, cursorPos + lengthDiff);
    }
}

// Mandarin-specific IPA input handler
function handleMandarinIPAInput(e) {
    handleIPAInput(e, { mandarin: true });
}

// Attach IPA converter to a given input field
function attachIPAConverter(inputField, options = {}) {
    if (!inputField) return;

    // Choose the appropriate handler based on options
    const handler = options.mandarin ? handleMandarinIPAInput : handleIPAInput;

    // Remove any existing listeners first
    inputField.removeEventListener('input', handleIPAInput);
    inputField.removeEventListener('input', handleMandarinIPAInput);

    // Add IPA converter
    inputField.addEventListener('input', handler);
}

// Create show/hide handlers for IPA reference table
// Returns object with showHandler and hideHandler functions
function createIPATableHandlers(inputField) {
    const showHandler = function() {
        const ipaReference = document.getElementById('ipa-reference');
        if (ipaReference) {
            ipaReference.style.display = 'block';
        }
    };

    const hideHandler = function() {
        // Small delay to allow clicking on the reference table
        setTimeout(() => {
            const ipaReference = document.getElementById('ipa-reference');
            if (ipaReference && document.activeElement !== inputField) {
                ipaReference.style.display = 'none';
            }
        }, 200);
    };

    return { showHandler, hideHandler };
}

// Attach IPA converter AND focus/blur handlers to show/hide reference table
function attachIPAConverterWithTable(inputField, options = {}) {
    if (!inputField) return;

    // Attach the IPA converter
    attachIPAConverter(inputField, options);

    // Create and attach focus/blur handlers
    const { showHandler, hideHandler } = createIPATableHandlers(inputField);

    // Remove any existing listeners first
    inputField.removeEventListener('focus', showHandler);
    inputField.removeEventListener('blur', hideHandler);

    // Add show/hide handlers
    inputField.addEventListener('focus', showHandler);
    inputField.addEventListener('blur', hideHandler);

    return { showHandler, hideHandler };
}

// Generate IPA reference table HTML
function generateIPAReferenceTable(options = {}) {
    // Group IPA characters by base letter for display
    const letterGroups = {};

    for (const [key, ipaChar] of Object.entries(ipaCharMap)) {
        const baseLetter = key[0];
        if (!letterGroups[baseLetter]) {
            letterGroups[baseLetter] = [];
        }
        letterGroups[baseLetter].push({ key, ipaChar });
    }

    // Create HTML structure
    let html = '<div class="ipa-reference" id="ipa-reference" style="display: none;">';
    html += '<h4>IPA Shortcuts (type letter + number)</h4>';
    html += '<div class="ipa-tables">';

    // Split into two columns for better layout
    const letters = Object.keys(letterGroups).sort();
    const midPoint = Math.ceil(letters.length / 2);
    const leftColumn = letters.slice(0, midPoint);
    const rightColumn = letters.slice(midPoint);

    // Left column table
    html += '<div class="ipa-table-section">';
    html += '<table class="ipa-compact-table"><thead><tr><th></th>';
    for (let i = 1; i <= 8; i++) {
        html += `<th>${i}</th>`;
    }
    html += '</tr></thead><tbody>';

    for (const letter of leftColumn) {
        html += `<tr><td class="base-letter">${letter}</td>`;
        const items = letterGroups[letter];
        for (let i = 1; i <= 8; i++) {
            const item = items.find(x => x.key === `${letter}${i}`);
            if (item) {
                const tip = pronunciationTips[item.ipaChar] || '';
                html += `<td class="ipa-char" data-char="${item.ipaChar}" data-tip="${tip}">${item.ipaChar}</td>`;
            } else {
                html += '<td></td>';
            }
        }
        html += '</tr>';
    }
    html += '</tbody></table></div>';

    // Right column table
    html += '<div class="ipa-table-section">';
    html += '<table class="ipa-compact-table"><thead><tr><th></th>';
    for (let i = 1; i <= 8; i++) {
        html += `<th>${i}</th>`;
    }
    html += '</tr></thead><tbody>';

    for (const letter of rightColumn) {
        html += `<tr><td class="base-letter">${letter}</td>`;
        const items = letterGroups[letter];
        for (let i = 1; i <= 8; i++) {
            const item = items.find(x => x.key === `${letter}${i}`);
            if (item) {
                const tip = pronunciationTips[item.ipaChar] || '';
                html += `<td class="ipa-char" data-char="${item.ipaChar}" data-tip="${tip}">${item.ipaChar}</td>`;
            } else {
                html += '<td></td>';
            }
        }
        html += '</tr>';
    }
    html += '</tbody></table></div>';

    html += '</div>'; // Close ipa-tables

    // Add Mandarin tone shortcuts if Mandarin mode
    if (options.mandarin) {
        html += '<div class="ipa-tone-section" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e9ecef;">';
        html += '<h5 style="font-size: 14px; margin-bottom: 10px; color: #666;">Mandarin Tones (type period + number)</h5>';
        html += '<table class="ipa-compact-table"><thead><tr>';
        html += '<th>Input</th><th>Result</th><th>Description</th>';
        html += '</tr></thead><tbody>';

        const toneInfo = [
            { input: '.1', result: '˥˥', desc: '1st tone: high level (55)' },
            { input: '.2', result: '˧˥', desc: '2nd tone: rising (35)' },
            { input: '.3', result: '˨˩˦', desc: '3rd tone: dipping (214)' },
            { input: '.4', result: '˥˩', desc: '4th tone: falling (51)' },
            { input: '.5', result: '(none)', desc: 'neutral tone' }
        ];

        for (const tone of toneInfo) {
            html += '<tr>';
            html += `<td style="font-family: monospace; font-weight: bold;">${tone.input}</td>`;
            html += `<td class="ipa-char" style="font-size: 18px;">${tone.result}</td>`;
            html += `<td style="font-size: 12px; color: #666;">${tone.desc}</td>`;
            html += '</tr>';
        }

        html += '</tbody></table>';
        html += '<div style="margin-top: 10px; font-size: 12px; color: #999;">Example: t2s2ha.2 → ʈʂʰa˧˥</div>';
        html += '</div>'; // Close ipa-tone-section
    }

    html += '</div>'; // Close ipa-reference

    return html;
}

// Show pronunciation tip popup
function showPronunciationTip(ipaChar, tip, cellElement) {
    if (!tip) return;

    // Remove any existing popup
    const existingPopup = document.getElementById('ipa-tip-popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'ipa-tip-popup';
    popup.className = 'ipa-tip-popup';
    popup.innerHTML = `<strong>${ipaChar}</strong>: ${tip}`;

    // Position popup near the cell
    document.body.appendChild(popup);
    const rect = cellElement.getBoundingClientRect();
    popup.style.position = 'fixed';
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.bottom + 5}px`;
    popup.style.transform = 'translateX(-50%)';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        popup.remove();
    }, 5000);

    // Click to dismiss
    popup.addEventListener('click', () => {
        popup.remove();
    });
}

// Attach click handlers to IPA reference table cells
function attachIPATableClickHandlers() {
    const cells = document.querySelectorAll('.ipa-char[data-tip]');
    cells.forEach(cell => {
        cell.style.cursor = 'pointer';
        cell.addEventListener('click', () => {
            const ipaChar = cell.dataset.char;
            const tip = cell.dataset.tip;
            showPronunciationTip(ipaChar, tip, cell);
        });
    });
}

// Position IPA reference table under the IPA input field
function positionIPATable(ipaInputField) {
    const ipaReference = document.getElementById('ipa-reference');
    if (!ipaReference || !ipaInputField) return;

    // Find the input field's parent group
    const inputGroup = ipaInputField.closest('.input-group');
    if (!inputGroup) return;

    // Insert table after the input group
    if (ipaReference.parentElement !== inputGroup.parentElement) {
        inputGroup.parentElement.insertBefore(ipaReference, inputGroup.nextSibling);
    }

    // Show the table
    ipaReference.style.display = 'block';
}

// Export for use in trainers
window.IPAConverter = {
    convertIPA,
    handleIPAInput,
    handleMandarinIPAInput,
    attachIPAConverter,
    attachIPAConverterWithTable,
    createIPATableHandlers,
    ipaCharMap,
    toneLetterMap,
    mandarinToneMap,
    pronunciationTips,
    generateIPAReferenceTable,
    attachIPATableClickHandlers,
    positionIPATable
};
