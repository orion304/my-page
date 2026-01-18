const FILE_NAME = 'french_dictionary.json';
const DEFAULT_DICTIONARY_URL = 'https://raw.githubusercontent.com/orion304/my-page/main/french_dictionary.json';

let dictionary = null;
let currentWord = null;
let currentPromptField = null;
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
const inputFieldArticle = document.getElementById('input-field-article');
const inputFieldFrench = document.getElementById('input-field-french');
const inputFieldIpa = document.getElementById('input-field-ipa');
const inputFieldEnglish = document.getElementById('input-field-english');
const inputGroupArticle = document.getElementById('input-group-article');
const inputGroupFrench = document.getElementById('input-group-french');
const inputGroupIpa = document.getElementById('input-group-ipa');
const inputGroupEnglish = document.getElementById('input-group-english');
const feedbackArticle = document.getElementById('feedback-article');
const feedbackFrench = document.getElementById('feedback-french');
const feedbackIpa = document.getElementById('feedback-ipa');
const feedbackEnglish = document.getElementById('feedback-english');
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
const ipaReference = document.getElementById('ipa-reference');

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

// Get visible input fields in order
function getVisibleInputFields() {
    const allInputs = [inputFieldArticle, inputFieldFrench, inputFieldIpa, inputFieldEnglish];
    return allInputs.filter(input => {
        const group = input.closest('.input-group');
        return group && group.style.display !== 'none';
    });
}

// Get next visible input field after the current one
function getNextVisibleInput(currentInput) {
    const visibleInputs = getVisibleInputFields();
    const currentIndex = visibleInputs.indexOf(currentInput);
    if (currentIndex >= 0 && currentIndex < visibleInputs.length - 1) {
        return visibleInputs[currentIndex + 1];
    }
    return null; // No next field, this is the last one
}

document.addEventListener('keydown', function(e) {
    if (!trainingSection.classList.contains('active')) return;

    // Handle Tab/Enter in input fields - navigate or check answers
    if (e.target.tagName === 'INPUT' && (e.code === 'Tab' || e.code === 'Enter')) {
        // Only handle forward tab, not shift+tab
        if (e.code === 'Tab' && e.shiftKey) return;

        // Only handle if check button is visible (still answering)
        if (checkBtn.style.display !== 'none' && !checkBtn.disabled) {
            e.preventDefault();
            const nextInput = getNextVisibleInput(e.target);
            if (nextInput) {
                nextInput.focus();
            } else {
                // Last field - check answers and blur
                checkAnswers();
                document.activeElement.blur();
            }
        }
        return;
    }

    // Handle Escape key in input fields - mark wrong if judgment visible
    if (e.target.tagName === 'INPUT' && e.code === 'Escape') {
        e.preventDefault();
        if (judgmentButtons.style.display !== 'none' && !wrongBtn.disabled) {
            handleWrong();
        }
        return;
    }

    // Don't handle other shortcuts when in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Enter: check answers OR mark correct (when not in input field)
    if ((e.code === 'Enter' || e.code === 'Numpad1')) {
        e.preventDefault();
        if (checkBtn.style.display !== 'none' && !checkBtn.disabled) {
            checkAnswers();
        } else if (judgmentButtons.style.display !== 'none' && !correctBtn.disabled) {
            handleCorrect();
        }
    }
    // Escape: mark wrong (when not in input field)
    else if (e.code === 'Escape') {
        e.preventDefault();
        if (judgmentButtons.style.display !== 'none' && !wrongBtn.disabled) {
            handleWrong();
        }
    }
    // Arrow keys for judgment
    else if ((e.code === 'ArrowRight' || e.code === 'Numpad2') && judgmentButtons.style.display !== 'none') {
        e.preventDefault();
        if (!correctBtn.disabled) {
            handleCorrect();
        }
    }
    else if ((e.code === 'ArrowLeft' || e.code === 'Backspace' || e.code === 'Numpad3') && judgmentButtons.style.display !== 'none') {
        e.preventDefault();
        if (!wrongBtn.disabled) {
            handleWrong();
        }
    }
});

// French diacritic mapping: letter+modifier → accented character
const frenchCharMap = {
    // Acute (')
    "e'": 'é', "E'": 'É',
    // Grave (`)
    'e`': 'è', 'E`': 'È',
    'a`': 'à', 'A`': 'À',
    'u`': 'ù', 'U`': 'Ù',
    // Circumflex (^)
    'e^': 'ê', 'E^': 'Ê',
    'a^': 'â', 'A^': 'Â',
    'u^': 'û', 'U^': 'Û',
    'o^': 'ô', 'O^': 'Ô',
    'i^': 'î', 'I^': 'Î',
    // Diaeresis (:)
    'e:': 'ë', 'E:': 'Ë',
    'i:': 'ï', 'I:': 'Ï',
    'u:': 'ü', 'U:': 'Ü',
    // Cedilla (,)
    'c,': 'ç', 'C,': 'Ç',
    // Ligatures (1)
    'oe1': 'œ', 'OE1': 'Œ',
    'ae1': 'æ', 'AE1': 'Æ',
};

function convertFrench(text) {
    let result = text;
    // Sort keys by length (longest first) to handle multi-character sequences
    const sortedKeys = Object.keys(frenchCharMap).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
        // Case-sensitive replacement
        result = result.split(key).join(frenchCharMap[key]);
    }
    return result;
}

function handleFrenchInput(e) {
    const input = e.target;
    const cursorPos = input.selectionStart;
    const originalLength = input.value.length;
    const converted = convertFrench(input.value);
    if (converted !== input.value) {
        input.value = converted;
        // Adjust cursor position
        const lengthDiff = converted.length - originalLength;
        input.setSelectionRange(cursorPos + lengthDiff, cursorPos + lengthDiff);
    }
}

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
    // Vowels - Y variants
    'y1': 'ʏ', 'y2': 'ʎ', 'y3': 'ɣ', 'y4': 'ɤ',
    // Consonants - B variants
    'b1': 'β', 'b2': 'ɓ', 'b3': 'ʙ',
    // Consonants - C variants
    'c1': 'ç', 'c2': 'ɕ',
    // Consonants - D variants
    'd1': 'ð', 'd2': 'ɗ', 'd3': 'ɖ',
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
    'r1': 'ɾ', 'r2': 'ɹ', 'r3': 'ʀ', 'r4': 'ʁ', 'r5': 'ɼ', 'r6': 'ɽ', 'r7': 'ɺ',
    // Consonants - S variants
    's1': 'ʃ', 's2': 'ʂ',
    // Consonants - T variants
    't1': 'θ', 't2': 'ʈ',
    // Consonants - V variants
    'v1': 'ʌ', 'v2': 'ʋ', 'v3': 'ⱱ',
    // Consonants - W variants
    'w1': 'ʍ',
    // Consonants - X variants
    'x1': 'χ',
    // Consonants - Z variants
    'z1': 'ʒ', 'z2': 'ʐ', 'z3': 'ʑ',
    // Special symbols
    'q1': 'ˈ', 'q2': 'ˌ',  // primary and secondary stress
    'k1': 'ː', 'k2': 'ˑ',   // length marks
};

function convertIPA(text) {
    // Convert letter+number combinations to IPA characters
    let result = text;

    // Sort keys by length (longest first) to handle multi-character sequences
    const sortedKeys = Object.keys(ipaCharMap).sort((a, b) => b.length - a.length);

    for (const key of sortedKeys) {
        const regex = new RegExp(key, 'gi');
        result = result.replace(regex, (match) => {
            // Preserve case by checking if original was uppercase
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

// Attach French diacritic converter to French input field
function attachFrenchConverter() {
    inputFieldFrench.removeEventListener('input', handleFrenchInput);
    inputFieldFrench.addEventListener('input', handleFrenchInput);
}

// Attach IPA converter to input fields that are for IPA
function attachIPAConverter() {
    // Remove any existing listeners first
    inputFieldIpa.removeEventListener('input', handleIPAInput);
    inputFieldIpa.removeEventListener('focus', showIPAReference);
    inputFieldIpa.removeEventListener('blur', hideIPAReference);

    // Add IPA converter and show/hide handlers to IPA field
    inputFieldIpa.addEventListener('input', handleIPAInput);
    inputFieldIpa.addEventListener('focus', showIPAReference);
    inputFieldIpa.addEventListener('blur', hideIPAReference);

    // Move the IPA reference to be right after the IPA input group if IPA field is visible
    if (inputGroupIpa.style.display !== 'none' && ipaReference) {
        // Insert the reference right after the IPA input group
        if (inputGroupIpa.nextSibling !== ipaReference) {
            inputGroupIpa.parentNode.insertBefore(ipaReference, inputGroupIpa.nextSibling);
        }
    } else if (ipaReference) {
        // If IPA field is hidden, hide the reference
        ipaReference.style.display = 'none';
    }
}

function showIPAReference() {
    if (ipaReference) {
        ipaReference.style.display = 'block';
    }
}

function hideIPAReference() {
    // Small delay to allow clicking on the reference table
    setTimeout(() => {
        if (ipaReference && document.activeElement !== inputFieldIpa) {
            ipaReference.style.display = 'none';
        }
    }, 200);
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
        fileName = 'french_dictionary.json';
        fileNameDisplay.textContent = 'Loaded: Default French Dictionary';
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

function showRandomWord() {
    if (!dictionary) return;

    const words = Object.keys(dictionary).filter(key => {
        const state = dictionary[key].state;
        return state === 'learning';
    });

    if (words.length === 0) {
        const notStartedWords = Object.keys(dictionary).filter(key => dictionary[key].state === 'not_started');
        const learnedWords = Object.keys(dictionary).filter(key => dictionary[key].state === 'learned');

        if (notStartedWords.length > 0) {
            notStartedWords.forEach(key => {
                dictionary[key].state = 'learning';
                dictionary[key].correctCount = 0;
            });
            saveToGoogleDrive();
            updateProgressTracker();
            showRandomWord();
            return;
        } else if (learnedWords.length > 0) {
            promptValue.textContent = '🎉 All words learned!';
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

    let availableWords = words;
    if (words.length > 1 && currentWord) {
        availableWords = words.filter(key => key !== currentWord);
    }

    const randomKey = availableWords[Math.floor(Math.random() * availableWords.length)];
    currentWord = randomKey;

    const wordData = dictionary[randomKey];

    // Randomly choose which field to show as prompt (french, ipa, or english)
    const fields = ['french', 'ipa', 'english'];
    currentPromptField = fields[Math.floor(Math.random() * fields.length)];

    const fieldLabels = {
        'french': 'French',
        'ipa': 'IPA',
        'english': 'English'
    };

    promptLabel.textContent = fieldLabels[currentPromptField];
    promptLabel.style.display = 'block';
    promptValue.textContent = wordData[currentPromptField];

    // Determine if word has an article (based on gender)
    const hasArticle = wordData.gender && wordData.gender.trim() !== '';
    const expectedArticle = hasArticle ? (wordData.gender === 'm' ? 'le' : 'la') : '';

    // Clear all fields
    inputFieldArticle.value = '';
    inputFieldFrench.value = '';
    inputFieldIpa.value = '';
    inputFieldEnglish.value = '';

    inputFieldArticle.className = 'answer-input article-input';
    inputFieldFrench.className = 'answer-input';
    inputFieldIpa.className = 'answer-input';
    inputFieldEnglish.className = 'answer-input';

    feedbackArticle.textContent = '';
    feedbackFrench.textContent = '';
    feedbackIpa.textContent = '';
    feedbackEnglish.textContent = '';

    feedbackArticle.className = 'answer-feedback';
    feedbackFrench.className = 'answer-feedback';
    feedbackIpa.className = 'answer-feedback';
    feedbackEnglish.className = 'answer-feedback';

    // Show/hide fields in fixed order: Article, French, IPA, English
    // Hide the field that's being prompted
    inputGroupArticle.style.display = hasArticle ? 'block' : 'none';
    inputGroupFrench.style.display = currentPromptField === 'french' ? 'none' : 'block';
    inputGroupIpa.style.display = currentPromptField === 'ipa' ? 'none' : 'block';
    inputGroupEnglish.style.display = currentPromptField === 'english' ? 'none' : 'block';

    // Store expected article for validation
    inputFieldArticle.dataset.expected = expectedArticle;

    checkBtn.style.display = 'flex';
    judgmentButtons.style.display = 'none';
    document.getElementById('input-section').style.display = 'block';

    checkBtn.disabled = false;
    correctBtn.disabled = false;
    wrongBtn.disabled = false;

    // Attach converters to input fields
    attachFrenchConverter();
    attachIPAConverter();

    updateProgressTracker();

    // Focus on the first visible input field
    if (hasArticle) {
        inputFieldArticle.focus();
    } else if (currentPromptField !== 'french') {
        inputFieldFrench.focus();
    } else if (currentPromptField !== 'ipa') {
        inputFieldIpa.focus();
    } else {
        inputFieldEnglish.focus();
    }
}

function checkAnswers() {
    if (!currentWord || !dictionary) return;

    const wordData = dictionary[currentWord];

    // Build list of visible fields to check
    const fieldsToCheck = [];

    // Article field (if visible)
    if (inputGroupArticle.style.display !== 'none') {
        fieldsToCheck.push({
            field: inputFieldArticle,
            feedback: feedbackArticle,
            expected: inputFieldArticle.dataset.expected,
            name: 'article'
        });
    }

    // French field (if visible)
    if (inputGroupFrench.style.display !== 'none') {
        fieldsToCheck.push({
            field: inputFieldFrench,
            feedback: feedbackFrench,
            expected: wordData.french,
            name: 'french'
        });
    }

    // IPA field (if visible)
    if (inputGroupIpa.style.display !== 'none') {
        fieldsToCheck.push({
            field: inputFieldIpa,
            feedback: feedbackIpa,
            expected: wordData.ipa,
            name: 'ipa'
        });
    }

    // English field (if visible)
    if (inputGroupEnglish.style.display !== 'none') {
        fieldsToCheck.push({
            field: inputFieldEnglish,
            feedback: feedbackEnglish,
            expected: wordData.english,
            name: 'english'
        });
    }

    // Validate each visible field
    fieldsToCheck.forEach(({ field, feedback, expected, name }) => {
        let userAnswer = field.value.trim();
        let expectedAnswer = expected;

        // For IPA fields, strip slashes from both user input and expected answer
        if (name === 'ipa') {
            userAnswer = userAnswer.replace(/^\/|\/$/g, '');
            expectedAnswer = expectedAnswer.replace(/^\/|\/$/g, '');
        }

        const isCorrect = userAnswer.toLowerCase() === expectedAnswer.toLowerCase();

        if (isCorrect) {
            field.className = field === inputFieldArticle ? 'answer-input article-input correct' : 'answer-input correct';
            feedback.textContent = '✓ Correct';
            feedback.className = 'answer-feedback correct';
        } else {
            field.className = field === inputFieldArticle ? 'answer-input article-input wrong' : 'answer-input wrong';
            feedback.textContent = `✗ Expected: ${expectedAnswer}`;
            feedback.className = 'answer-feedback wrong';
        }
    });

    checkBtn.style.display = 'none';
    judgmentButtons.style.display = 'flex';
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
    a.download = fileName || 'french_dictionary_updated.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
