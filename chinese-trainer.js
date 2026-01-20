const FILE_NAME = 'chinese_dictionary.json';
const DEFAULT_DICTIONARY_URL = 'https://raw.githubusercontent.com/orion304/my-page/main/chinese_dictionary.json';

let dictionary = null;
let currentWord = null;
let currentPromptField = null; // Which field is being shown as prompt
let correctCount = 0;
let wrongCount = 0;
let fileName = '';
let googleDriveFileId = null;
let isGoogleDriveConnected = false;
let isSaving = false;
let needsAnotherSave = false;

const fileUpload = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name');
const trainingSection = document.getElementById('training-section');
const promptLabel = document.getElementById('prompt-label');
const promptValue = document.getElementById('prompt-value');
const inputField1 = document.getElementById('input-field-1');
const inputField2 = document.getElementById('input-field-2');
const inputField3 = document.getElementById('input-field-3');
const inputField4 = document.getElementById('input-field-4');
const inputLabel1 = document.getElementById('input-label-1');
const inputLabel2 = document.getElementById('input-label-2');
const inputLabel3 = document.getElementById('input-label-3');
const inputLabel4 = document.getElementById('input-label-4');
const hanziChoices1 = document.getElementById('hanzi-choices-1');
const hanziChoices2 = document.getElementById('hanzi-choices-2');
const hanziChoices3 = document.getElementById('hanzi-choices-3');
const hanziChoices4 = document.getElementById('hanzi-choices-4');
const inputGroup1 = document.getElementById('input-group-1');
const inputGroup2 = document.getElementById('input-group-2');
const inputGroup3 = document.getElementById('input-group-3');
const inputGroup4 = document.getElementById('input-group-4');
const feedback1 = document.getElementById('feedback-1');
const feedback2 = document.getElementById('feedback-2');
const feedback3 = document.getElementById('feedback-3');
const feedback4 = document.getElementById('feedback-4');
const checkBtn = document.getElementById('check-btn');
const judgmentButtons = document.getElementById('judgment-buttons');
const correctBtn = document.getElementById('correct-btn');
const wrongBtn = document.getElementById('wrong-btn');
const downloadBtn = document.getElementById('download-btn');
const correctCountDisplay = document.getElementById('correct-count');
const wrongCountDisplay = document.getElementById('wrong-count');
const totalCountDisplay = document.getElementById('total-count');
const googleDriveBtn = document.getElementById('google-drive-btn');
const googleBtnText = document.getElementById('google-btn-text');
const googleStatus = document.getElementById('google-status');
const learnedList = document.getElementById('learned-list');
const learningList = document.getElementById('learning-list');
const loadDefaultBtn = document.getElementById('load-default-btn');
const uploadSection = document.querySelector('.upload-section');
const changeDictionaryLink = document.getElementById('change-dictionary-link');
const changeDictionaryBtn = document.getElementById('change-dictionary-btn');

// Wait for auth module to initialize, then enable buttons and check for saved tokens
function maybeEnableButtons() {
    // Poll until auth module is initialized
    const checkInit = setInterval(() => {
        if (googleDriveAuth.gapiInited && googleDriveAuth.tokenClient) {
            clearInterval(checkInit);
            googleDriveBtn.disabled = false;
            checkIfSignedIn();
        }
    }, 100);
}

async function checkIfSignedIn() {
    const signedIn = await googleDriveAuth.checkIfSignedIn();

    if (signedIn) {
        isGoogleDriveConnected = true;
        googleBtnText.textContent = 'Loading from Drive...';
        googleStatus.textContent = 'Reconnecting...';
        googleStatus.className = 'google-status';

        try {
            await loadFromGoogleDrive();
            googleBtnText.textContent = '✓ Connected to Google Drive';

            if (dictionary) {
                googleStatus.textContent = 'Auto-saving enabled';
                googleStatus.className = 'google-status success';
            }

            googleDriveBtn.disabled = true;
        } catch (error) {
            console.error('Error loading from Drive:', error);
            googleStatus.textContent = 'Error loading from Drive';
            googleStatus.className = 'google-status error';
            isGoogleDriveConnected = false;
            googleBtnText.textContent = 'Connect to Google Drive';
        }
    }
}

// Call maybeEnableButtons when page loads
setTimeout(maybeEnableButtons, 200);

fileUpload.addEventListener('change', handleFileUpload);
checkBtn.addEventListener('click', checkAnswers);
correctBtn.addEventListener('click', handleCorrect);
wrongBtn.addEventListener('click', handleWrong);
downloadBtn.addEventListener('click', downloadDictionary);
googleDriveBtn.addEventListener('click', handleGoogleDrive);
loadDefaultBtn.addEventListener('click', loadDefaultDictionary);
changeDictionaryBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showUploadSection();
});

// Initialize IPA reference table
let ipaReference = null;
(function initializeIPATable() {
    const container = document.getElementById('ipa-reference-container');
    if (container && window.IPAConverter) {
        // Generate and insert the IPA reference table
        const tableHTML = window.IPAConverter.generateIPAReferenceTable();
        container.innerHTML = tableHTML;

        // Get reference to the generated table
        ipaReference = document.getElementById('ipa-reference');

        // Attach click handlers for pronunciation tips
        window.IPAConverter.attachIPATableClickHandlers();
    }
})();

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (!trainingSection.classList.contains('active')) return;

    // Handle Enter key in input fields
    if (e.target.tagName === 'INPUT' && e.code === 'Enter') {
        e.preventDefault();
        // If check button is visible, check answers
        if (checkBtn.style.display !== 'none' && !checkBtn.disabled) {
            checkAnswers();
        }
        // If judgment buttons are visible, treat as "Got It"
        else if (judgmentButtons.style.display !== 'none' && !correctBtn.disabled) {
            handleCorrect();
        }
        return;
    }

    // Handle Escape key in input fields
    if (e.target.tagName === 'INPUT' && e.code === 'Escape') {
        e.preventDefault();
        // If judgment buttons are visible, treat as "Didn't Get It"
        if (judgmentButtons.style.display !== 'none' && !wrongBtn.disabled) {
            handleWrong();
        }
        return;
    }

    // Don't handle other shortcuts when in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Enter or Numpad 1: Check answers (if check button is visible)
    if ((e.code === 'Enter' || e.code === 'Numpad1') && checkBtn.style.display !== 'none') {
        e.preventDefault();
        if (!checkBtn.disabled) {
            checkAnswers();
        }
    }

    // Right Arrow or Numpad 2: Mark correct
    else if ((e.code === 'ArrowRight' || e.code === 'Numpad2') && judgmentButtons.style.display !== 'none') {
        e.preventDefault();
        if (!correctBtn.disabled) {
            handleCorrect();
        }
    }

    // Left Arrow, Backspace, or Numpad 3: Mark wrong
    else if ((e.code === 'ArrowLeft' || e.code === 'Backspace' || e.code === 'Numpad3') && judgmentButtons.style.display !== 'none') {
        e.preventDefault();
        if (!wrongBtn.disabled) {
            handleWrong();
        }
    }
});

// Pinyin tone number to diacritic conversion
const pinyinToneMap = {
    'a1': 'ā', 'a2': 'á', 'a3': 'ǎ', 'a4': 'à', 'a5': 'a',
    'e1': 'ē', 'e2': 'é', 'e3': 'ě', 'e4': 'è', 'e5': 'e',
    'i1': 'ī', 'i2': 'í', 'i3': 'ǐ', 'i4': 'ì', 'i5': 'i',
    'o1': 'ō', 'o2': 'ó', 'o3': 'ǒ', 'o4': 'ò', 'o5': 'o',
    'u1': 'ū', 'u2': 'ú', 'u3': 'ǔ', 'u4': 'ù', 'u5': 'u',
    'ü1': 'ǖ', 'ü2': 'ǘ', 'ü3': 'ǚ', 'ü4': 'ǜ', 'ü5': 'ü',
    'v1': 'ǖ', 'v2': 'ǘ', 'v3': 'ǚ', 'v4': 'ǜ', 'v5': 'ü'
};

function convertPinyinTones(text) {
    // Split by spaces to handle each syllable separately
    const syllables = text.split(' ');
    const converted = syllables.map(syllable => {
        // Check if syllable ends with a tone number (1-5)
        const match = syllable.match(/^(.*)([aeiouüv])([1-5])(.*)$/i);
        if (!match) return syllable;

        const before = match[1];
        const vowel = match[2].toLowerCase();
        const tone = match[3];
        const after = match[4];

        // Find which vowel should get the tone mark following pinyin rules
        const fullSyllable = before + vowel + after;
        let targetVowel = vowel;
        let targetIndex = before.length;

        // Rule 1: If 'a' or 'e' is present, it gets the tone mark
        const aIndex = fullSyllable.indexOf('a');
        const eIndex = fullSyllable.indexOf('e');
        if (aIndex !== -1) {
            targetVowel = 'a';
            targetIndex = aIndex;
        } else if (eIndex !== -1) {
            targetVowel = 'e';
            targetIndex = eIndex;
        } else {
            // Rule 2: If 'ou' is present, 'o' gets the tone mark
            const ouIndex = fullSyllable.indexOf('ou');
            if (ouIndex !== -1) {
                targetVowel = 'o';
                targetIndex = ouIndex;
            } else {
                // Rule 3: Otherwise, the last vowel gets the tone mark
                const vowels = ['i', 'o', 'u', 'ü', 'v'];
                for (let i = fullSyllable.length - 1; i >= 0; i--) {
                    if (vowels.includes(fullSyllable[i].toLowerCase())) {
                        targetVowel = fullSyllable[i].toLowerCase();
                        targetIndex = i;
                        break;
                    }
                }
            }
        }

        // Replace the target vowel with its accented version
        const accentedVowel = pinyinToneMap[targetVowel + tone] || targetVowel;
        const result = fullSyllable.substring(0, targetIndex) + accentedVowel + fullSyllable.substring(targetIndex + 1);

        return result;
    });

    return converted.join(' ');
}

function handlePinyinInput(e) {
    const input = e.target;
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;

    // First convert u: to ü
    let text = input.value.replace(/u:/g, 'ü');

    // Then convert tone numbers to diacritics
    const converted = convertPinyinTones(text);

    if (converted !== input.value) {
        input.value = converted;
        // Adjust cursor position
        const lengthDiff = converted.length - originalLength;
        input.setSelectionRange(cursorPos + lengthDiff, cursorPos + lengthDiff);
    }
}

// Reverse mapping: accented vowel → previous state
const pinyinBackspaceMap = {
    // Vowels with umlaut AND tone → just umlaut
    'ǖ': 'ü', 'ǘ': 'ü', 'ǚ': 'ü', 'ǜ': 'ü',
    // Vowels with tones → plain vowels
    'ā': 'a', 'á': 'a', 'ǎ': 'a', 'à': 'a',
    'ē': 'e', 'é': 'e', 'ě': 'e', 'è': 'e',
    'ī': 'i', 'í': 'i', 'ǐ': 'i', 'ì': 'i',
    'ō': 'o', 'ó': 'o', 'ǒ': 'o', 'ò': 'o',
    'ū': 'u', 'ú': 'u', 'ǔ': 'u', 'ù': 'u',
    // Just umlaut → plain u
    'ü': 'u'
};

function handlePinyinBackspace(e) {
    // Only handle backspace key
    if (e.key !== 'Backspace') {
        return;
    }

    const input = e.target;
    const cursorPos = input.selectionStart;
    const cursorEnd = input.selectionEnd;

    // Only handle if no text is selected and cursor is not at the start
    if (cursorPos !== cursorEnd || cursorPos === 0) {
        return;
    }

    // Get the character before the cursor
    const charBefore = input.value[cursorPos - 1];

    // Check if it's a diacritic character we should handle
    if (pinyinBackspaceMap[charBefore]) {
        e.preventDefault();

        // Replace the accented character with its simpler form
        const newValue = input.value.substring(0, cursorPos - 1) +
                        pinyinBackspaceMap[charBefore] +
                        input.value.substring(cursorPos);

        input.value = newValue;
        input.setSelectionRange(cursorPos, cursorPos);
    }
}

// Add pinyin and IPA conversion to input fields
function attachFieldConverters() {
    const inputs = [
        { field: inputField1, label: inputLabel1 },
        { field: inputField2, label: inputLabel2 },
        { field: inputField3, label: inputLabel3 },
        { field: inputField4, label: inputLabel4 }
    ];

    inputs.forEach(({ field, label }) => {
        // Remove any existing listeners first
        field.removeEventListener('input', handlePinyinInput);
        field.removeEventListener('keydown', handlePinyinBackspace);

        // Only add converter if this field is for pinyin
        if (label.textContent.includes('Pinyin')) {
            field.addEventListener('input', handlePinyinInput);
            field.addEventListener('keydown', handlePinyinBackspace);
        }
        // Attach IPA converter with Mandarin-specific tone conversion
        else if (label.textContent.includes('IPA')) {
            // Use shared converter with Mandarin tones and table show/hide
            window.IPAConverter.attachIPAConverterWithTable(field, { mandarin: true });
        }
    });
}

function positionIPATable() {
    if (!ipaReference) return;

    // Find which input field is the IPA field
    const inputGroups = [
        { group: inputGroup1, label: inputLabel1 },
        { group: inputGroup2, label: inputLabel2 },
        { group: inputGroup3, label: inputLabel3 },
        { group: inputGroup4, label: inputLabel4 }
    ];

    let ipaInputGroup = null;
    for (const { group, label } of inputGroups) {
        if (group.style.display !== 'none' && label.textContent.includes('IPA')) {
            ipaInputGroup = group;
            break;
        }
    }

    if (ipaInputGroup) {
        // Position the IPA reference table right after the IPA input group
        if (ipaInputGroup.nextSibling !== ipaReference) {
            ipaInputGroup.parentNode.insertBefore(ipaReference, ipaInputGroup.nextSibling);
        }
        // Keep hidden initially - will show on focus
        ipaReference.style.display = 'none';
    } else {
        // If IPA field is not visible, hide the reference table
        ipaReference.style.display = 'none';
    }
}

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    fileName = file.name;
    const reader = new FileReader();

    reader.onload = async function(event) {
        try {
            dictionary = JSON.parse(event.target.result);
            fileNameDisplay.textContent = `Loaded: ${fileName}`;
            trainingSection.classList.add('active');
            totalCountDisplay.textContent = Object.keys(dictionary).length;
            updateProgressTracker();
            showRandomWord();
            hideUploadSection();

            if (isGoogleDriveConnected) {
                await saveToGoogleDrive();
            }
        } catch (error) {
            alert('Error loading JSON file. Please check the format.');
            console.error(error);
        }
    };

    reader.readAsText(file);
}

function hideUploadSection() {
    uploadSection.classList.add('hidden');
    changeDictionaryLink.style.display = 'block';
}

function showUploadSection() {
    uploadSection.classList.remove('hidden');
    changeDictionaryLink.style.display = 'none';
}

async function loadDefaultDictionary() {
    try {
        fileNameDisplay.textContent = 'Loading default dictionary...';
        const response = await fetch(DEFAULT_DICTIONARY_URL);

        if (!response.ok) {
            throw new Error('Failed to load default dictionary');
        }

        dictionary = await response.json();
        fileName = 'chinese_dictionary.json';
        fileNameDisplay.textContent = 'Loaded: Default Chinese Dictionary';
        trainingSection.classList.add('active');
        totalCountDisplay.textContent = Object.keys(dictionary).length;
        updateProgressTracker();
        showRandomWord();
        hideUploadSection();

        if (isGoogleDriveConnected) {
            await saveToGoogleDrive();
        }
    } catch (error) {
        alert('Error loading default dictionary. Please try loading from file instead.');
        console.error(error);
        fileNameDisplay.textContent = 'Failed to load default dictionary';
    }
}

// Generate random hanzi distractors from dictionary
function getHanziDistractors(correctHanzi, count) {
    const allHanzi = Object.values(dictionary)
        .map(entry => entry.hanzi)
        .filter(h => h !== correctHanzi);

    // Shuffle and take 'count' items
    const shuffled = allHanzi.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Create hanzi choice grid for a field
function setupHanziChoices(choicesContainer, inputField, correctHanzi) {
    const distractors = getHanziDistractors(correctHanzi, 9);
    const allOptions = [correctHanzi, ...distractors].sort(() => Math.random() - 0.5);

    choicesContainer.innerHTML = '';
    choicesContainer.dataset.selected = '';
    choicesContainer.dataset.correct = correctHanzi;

    allOptions.forEach(hanzi => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'hanzi-choice';
        btn.textContent = hanzi;
        btn.addEventListener('click', () => selectHanziChoice(choicesContainer, btn, hanzi));
        choicesContainer.appendChild(btn);
    });

    // Hide text input, show choices
    inputField.style.display = 'none';
    choicesContainer.style.display = 'grid';
}

// Handle hanzi choice selection
function selectHanziChoice(container, btn, hanzi) {
    // Remove selected class from all buttons in this container
    container.querySelectorAll('.hanzi-choice').forEach(b => b.classList.remove('selected'));
    // Add selected class to clicked button
    btn.classList.add('selected');
    // Store selected value
    container.dataset.selected = hanzi;
}

// Reset hanzi choices (hide grid, show input)
function resetHanziChoices(choicesContainer, inputField) {
    choicesContainer.style.display = 'none';
    choicesContainer.innerHTML = '';
    choicesContainer.dataset.selected = '';
    inputField.style.display = 'block';
}

function showRandomWord() {
    if (!dictionary) return;

    // Filter to only learning words
    const words = Object.keys(dictionary).filter(key => {
        const state = dictionary[key].state;
        return state === 'learning';
    });

    if (words.length === 0) {
        const notStartedWords = Object.keys(dictionary).filter(key => dictionary[key].state === 'not_started');
        const learnedWords = Object.keys(dictionary).filter(key => dictionary[key].state === 'learned');

        if (notStartedWords.length > 0) {
            // Start first lesson automatically
            notStartedWords.forEach(key => {
                dictionary[key].state = 'learning';
                dictionary[key].correctCount = 0;
            });
            saveToGoogleDrive();
            updateProgressTracker();
            showRandomWord();
            return;
        } else if (learnedWords.length > 0) {
            promptValue.textContent = '🎉 All words learned! You can review by downloading and re-uploading the dictionary.';
            promptLabel.style.display = 'none';
            checkBtn.style.display = 'none';
            judgmentButtons.style.display = 'none';
            document.getElementById('input-section').style.display = 'none';
        } else {
            promptValue.textContent = 'No words to practice';
            promptLabel.style.display = 'none';
            checkBtn.style.display = 'none';
            judgmentButtons.style.display = 'none';
            document.getElementById('input-section').style.display = 'none';
        }

        updateProgressTracker();
        return;
    }

    // Filter out current word to avoid back-to-back repetition
    let availableWords = words;
    if (words.length > 1 && currentWord) {
        availableWords = words.filter(key => key !== currentWord);
    }

    const randomKey = availableWords[Math.floor(Math.random() * availableWords.length)];
    currentWord = randomKey;

    const wordData = dictionary[randomKey];

    // Randomly choose which field to show as prompt
    const fields = ['hanzi', 'pinyin', 'ipa', 'english'];
    currentPromptField = fields[Math.floor(Math.random() * fields.length)];

    // Display the prompt
    const fieldLabels = {
        'hanzi': 'Hanzi (汉字)',
        'pinyin': 'Pinyin',
        'zhuyin': 'Zhuyin (ㄅㄆㄇㄈ)',
        'ipa': 'IPA',
        'english': 'English'
    };

    promptLabel.textContent = fieldLabels[currentPromptField];
    promptLabel.style.display = 'block';
    promptValue.textContent = wordData[currentPromptField];

    // Set up input fields dynamically based on answer fields
    const otherFields = fields.filter(f => f !== currentPromptField);

    const inputGroups = [
        { group: inputGroup1, label: inputLabel1, field: inputField1, feedback: feedback1, choices: hanziChoices1 },
        { group: inputGroup2, label: inputLabel2, field: inputField2, feedback: feedback2, choices: hanziChoices2 },
        { group: inputGroup3, label: inputLabel3, field: inputField3, feedback: feedback3, choices: hanziChoices3 },
        { group: inputGroup4, label: inputLabel4, field: inputField4, feedback: feedback4, choices: hanziChoices4 }
    ];

    // Set up each input group based on available answer fields
    inputGroups.forEach((input, index) => {
        if (index < otherFields.length) {
            const fieldName = otherFields[index];
            input.group.style.display = 'block';
            input.label.textContent = fieldLabels[fieldName];
            input.field.value = '';
            input.field.className = 'answer-input';
            input.field.dataset.field = fieldName;
            input.feedback.textContent = '';
            input.feedback.className = 'answer-feedback';

            // Reset hanzi choices
            resetHanziChoices(input.choices, input.field);

            // Set up hanzi multiple choice if this is the hanzi field
            if (fieldName === 'hanzi') {
                setupHanziChoices(input.choices, input.field, wordData.hanzi);
            }
        } else {
            // Hide unused input groups
            input.group.style.display = 'none';
            input.field.dataset.field = '';
        }
    });

    // Show check button, hide judgment buttons
    checkBtn.style.display = 'flex';
    judgmentButtons.style.display = 'none';
    document.getElementById('input-section').style.display = 'block';

    checkBtn.disabled = false;
    correctBtn.disabled = false;
    wrongBtn.disabled = false;

    // Attach field converters (pinyin and IPA) to input fields
    attachFieldConverters();

    // Position IPA reference table under IPA input field if visible
    positionIPATable();

    updateProgressTracker();
}

function checkAnswers() {
    if (!currentWord || !dictionary) return;

    const wordData = dictionary[currentWord];

    // Check each input field
    const inputs = [
        { field: inputField1, feedback: feedback1, choices: hanziChoices1 },
        { field: inputField2, feedback: feedback2, choices: hanziChoices2 },
        { field: inputField3, feedback: feedback3, choices: hanziChoices3 },
        { field: inputField4, feedback: feedback4, choices: hanziChoices4 }
    ];

    inputs.forEach(({ field, feedback, choices }) => {
        const fieldName = field.dataset.field;

        // Skip hidden/unused input groups
        if (!fieldName) return;

        const expectedAnswer = wordData[fieldName];

        // Check if this is a hanzi field with multiple choice
        if (fieldName === 'hanzi' && choices.style.display === 'grid') {
            const userAnswer = choices.dataset.selected || '';
            const isCorrect = userAnswer === expectedAnswer;

            // Mark all choice buttons as correct/wrong
            choices.querySelectorAll('.hanzi-choice').forEach(btn => {
                if (btn.textContent === expectedAnswer) {
                    btn.classList.add('correct');
                } else if (btn.classList.contains('selected')) {
                    btn.classList.add('wrong');
                }
            });

            if (isCorrect) {
                feedback.textContent = '✓ Correct';
                feedback.className = 'answer-feedback correct';
            } else {
                feedback.textContent = `✗ Expected: ${expectedAnswer}`;
                feedback.className = 'answer-feedback wrong';
            }
        } else {
            // Regular text input
            let userAnswer = field.value.trim();
            let expectedAnswerNormalized = expectedAnswer;

            // For IPA fields, strip slashes from both user input and expected answer
            if (fieldName === 'ipa') {
                userAnswer = userAnswer.replace(/^\/|\/$/g, '');
                expectedAnswerNormalized = expectedAnswer.replace(/^\/|\/$/g, '');
            }

            const isCorrect = userAnswer.toLowerCase() === expectedAnswerNormalized.toLowerCase();

            if (isCorrect) {
                field.className = 'answer-input correct';
                feedback.textContent = '✓ Correct';
                feedback.className = 'answer-feedback correct';
            } else {
                field.className = 'answer-input wrong';
                feedback.textContent = `✗ Expected: ${expectedAnswer}`;
                feedback.className = 'answer-feedback wrong';
            }
        }
    });

    // Hide check button, show judgment buttons
    checkBtn.style.display = 'none';
    judgmentButtons.style.display = 'flex';

    // Blur to dismiss mobile keyboard
    document.activeElement.blur();
}

function handleCorrect() {
    if (!currentWord) return;

    correctCount++;
    correctCountDisplay.textContent = correctCount;

    const wordData = dictionary[currentWord];

    if (wordData.correctCount === undefined) {
        wordData.correctCount = 0;
    }

    wordData.correctCount++;

    if (wordData.correctCount >= 2) {
        wordData.state = 'learned';
    } else {
        wordData.state = 'learning';
    }

    saveToGoogleDrive();
    showRandomWord();
}

function handleWrong() {
    if (!currentWord) return;

    wrongCount++;
    wrongCountDisplay.textContent = wrongCount;

    const wordData = dictionary[currentWord];

    wordData.correctCount = 0;
    wordData.state = 'learning';

    saveToGoogleDrive();
    showRandomWord();
}

function updateProgressTracker() {
    if (!dictionary) return;

    const learned = [];
    const learning = [];

    Object.keys(dictionary).forEach(key => {
        const word = dictionary[key];
        if (word.state === 'learned') {
            learned.push(word.english);
        } else if (word.state === 'learning') {
            learning.push({ english: word.english, count: word.correctCount || 0 });
        }
    });

    if (learned.length > 0) {
        learnedList.innerHTML = learned
            .map(english => `<span class="word-badge learned">✓ ${english}</span>`)
            .join('');
    } else {
        learnedList.innerHTML = '<em style="color: #999;">No words learned yet</em>';
    }

    if (learning.length > 0) {
        learningList.innerHTML = learning
            .map(item => {
                const badge = item.count === 1
                    ? `<span class="word-badge learning-progress">${item.english} <span class="progress-indicator">●○</span></span>`
                    : `<span class="word-badge learning">${item.english}</span>`;
                return badge;
            })
            .join('');
    } else {
        learningList.innerHTML = '<em style="color: #999;">No words in progress</em>';
    }
}

async function handleGoogleDrive() {
    if (!isGoogleDriveConnected) {
        googleBtnText.textContent = 'Connecting...';
        googleStatus.textContent = 'Authorizing...';
        googleStatus.className = 'google-status';

        try {
            await googleDriveAuth.requestAccessToken(async (resp) => {
                isGoogleDriveConnected = true;
                googleBtnText.textContent = 'Loading from Drive...';
                googleStatus.textContent = 'Connecting...';

                try {
                    await loadFromGoogleDrive();
                    googleBtnText.textContent = '✓ Connected to Google Drive';

                    if (dictionary) {
                        googleStatus.textContent = 'Auto-saving enabled';
                        googleStatus.className = 'google-status success';
                    }

                    googleDriveBtn.disabled = true;
                } catch (error) {
                    console.error('Error loading from Drive:', error);
                    googleStatus.textContent = 'Error loading from Drive';
                    googleStatus.className = 'google-status error';
                    isGoogleDriveConnected = false;
                    googleBtnText.textContent = 'Connect to Google Drive';
                }
            });
        } catch (error) {
            console.error('OAuth error:', error);
            googleStatus.textContent = 'Error: ' + error.message;
            googleStatus.className = 'google-status error';
            googleBtnText.textContent = 'Connect to Google Drive';
        }
    }
}

async function loadFromGoogleDrive() {
    const response = await gapi.client.drive.files.list({
        q: `name='${FILE_NAME}' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
    });

    const files = response.result.files;

    if (files && files.length > 0) {
        googleDriveFileId = files[0].id;
        const fileResponse = await gapi.client.drive.files.get({
            fileId: googleDriveFileId,
            alt: 'media',
        });

        dictionary = JSON.parse(fileResponse.body);
        fileNameDisplay.textContent = `Loaded from Google Drive: ${FILE_NAME}`;
        trainingSection.classList.add('active');
        totalCountDisplay.textContent = Object.keys(dictionary).length;
        updateProgressTracker();
        showRandomWord();
        hideUploadSection();

        googleStatus.textContent = '✓ Dictionary loaded from Drive';
        googleStatus.className = 'google-status success';
    } else {
        googleStatus.textContent = 'No dictionary found in Drive. Please upload a JSON file below.';
        googleStatus.className = 'google-status';
        fileNameDisplay.textContent = 'Upload a JSON file to create your dictionary';
    }
}

async function saveToGoogleDrive() {
    if (!isGoogleDriveConnected || !dictionary) {
        console.log('Cannot save - not connected or no dictionary');
        return;
    }

    if (isSaving) {
        needsAnotherSave = true;
        return;
    }

    isSaving = true;

    const content = JSON.stringify(dictionary, null, 2);

    try {
        if (googleDriveFileId) {
            const response = await gapi.client.request({
                path: `/upload/drive/v3/files/${googleDriveFileId}`,
                method: 'PATCH',
                params: { uploadType: 'media' },
                body: content,
            });

            console.log('File updated successfully', response);
            googleStatus.textContent = '✓ Saved to Drive at ' + new Date().toLocaleTimeString();
            googleStatus.className = 'google-status success';
        } else {
            const metadata = {
                name: FILE_NAME,
                mimeType: 'application/json',
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', new Blob([content], { type: 'application/json' }));

            const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
                method: 'POST',
                headers: new Headers({ 'Authorization': 'Bearer ' + gapi.client.getToken().access_token }),
                body: form,
            });

            const result = await response.json();
            googleDriveFileId = result.id;
            console.log('File created successfully', result);
            googleStatus.textContent = '✓ Created and saved to Drive';
            googleStatus.className = 'google-status success';
        }
    } catch (error) {
        console.error('Error saving to Drive:', error);
        googleStatus.textContent = 'Error saving to Drive: ' + error.message;
        googleStatus.className = 'google-status error';
    } finally {
        isSaving = false;

        if (needsAnotherSave) {
            needsAnotherSave = false;
            saveToGoogleDrive();
        }
    }
}

function downloadDictionary() {
    if (!dictionary) return;

    const dataStr = JSON.stringify(dictionary, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'chinese_dictionary_updated.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
