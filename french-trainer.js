const CLIENT_ID = '47759577064-h3pt7ehhl0n3d2i6dm6je5m2ln4iukn4.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
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
let gapiInited = false;
let tokenClient = null;
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
const inputLabel1 = document.getElementById('input-label-1');
const inputLabel2 = document.getElementById('input-label-2');
const inputLabel3 = document.getElementById('input-label-3');
const feedback1 = document.getElementById('feedback-1');
const feedback2 = document.getElementById('feedback-2');
const feedback3 = document.getElementById('feedback-3');
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

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '',
    });
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && tokenClient) {
        googleDriveBtn.disabled = false;
        checkIfSignedIn();
    }
}

async function checkIfSignedIn() {
    const savedToken = localStorage.getItem('google_drive_token_french');

    if (savedToken) {
        try {
            const tokenObj = JSON.parse(savedToken);
            const now = Date.now();
            if (tokenObj.expiry && now < tokenObj.expiry) {
                gapi.client.setToken(tokenObj);
                isGoogleDriveConnected = true;
                googleBtnText.textContent = 'Loading from Drive...';
                googleStatus.textContent = 'Reconnecting...';
                googleStatus.className = 'google-status';

                await loadFromGoogleDrive();
                googleBtnText.textContent = '✓ Connected to Google Drive';

                if (dictionary) {
                    googleStatus.textContent = 'Auto-saving enabled';
                    googleStatus.className = 'google-status success';
                }

                googleDriveBtn.disabled = true;
                return;
            } else {
                localStorage.removeItem('google_drive_token_french');
            }
        } catch (error) {
            console.error('Error loading saved token:', error);
            localStorage.removeItem('google_drive_token_french');
        }
    }
}

function saveTokenToStorage(token) {
    const tokenWithExpiry = {
        ...token,
        expiry: Date.now() + (3600 * 1000)
    };
    localStorage.setItem('google_drive_token_french', JSON.stringify(tokenWithExpiry));
}

const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.onload = gisLoaded;
document.head.appendChild(script);

setTimeout(gapiLoaded, 100);

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

document.addEventListener('keydown', function(e) {
    if (!trainingSection.classList.contains('active')) return;

    // If Enter is pressed in an input field, trigger check answers
    if (e.target.tagName === 'INPUT' && e.code === 'Enter' && checkBtn.style.display !== 'none') {
        e.preventDefault();
        if (!checkBtn.disabled) {
            checkAnswers();
        }
        return;
    }

    // Don't handle other shortcuts when in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if ((e.code === 'Enter' || e.code === 'Numpad1') && checkBtn.style.display !== 'none') {
        e.preventDefault();
        if (!checkBtn.disabled) {
            checkAnswers();
        }
    }
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
        'english': 'English',
        'gender': 'Gender (m/f or blank)'
    };

    promptLabel.textContent = fieldLabels[currentPromptField];
    promptLabel.style.display = 'block';
    promptValue.textContent = wordData[currentPromptField];

    // Set up the 3 input fields: the other 2 fields + gender
    const otherFields = fields.filter(f => f !== currentPromptField);
    otherFields.push('gender'); // Gender is always an input field

    inputLabel1.textContent = fieldLabels[otherFields[0]];
    inputLabel2.textContent = fieldLabels[otherFields[1]];
    inputLabel3.textContent = fieldLabels[otherFields[2]];

    inputField1.value = '';
    inputField2.value = '';
    inputField3.value = '';

    inputField1.className = 'answer-input';
    inputField2.className = 'answer-input';
    inputField3.className = 'answer-input';

    feedback1.textContent = '';
    feedback2.textContent = '';
    feedback3.textContent = '';

    feedback1.className = 'answer-feedback';
    feedback2.className = 'answer-feedback';
    feedback3.className = 'answer-feedback';

    inputField1.dataset.field = otherFields[0];
    inputField2.dataset.field = otherFields[1];
    inputField3.dataset.field = otherFields[2];

    checkBtn.style.display = 'flex';
    judgmentButtons.style.display = 'none';
    document.getElementById('input-section').style.display = 'block';

    checkBtn.disabled = false;
    correctBtn.disabled = false;
    wrongBtn.disabled = false;

    updateProgressTracker();
}

function checkAnswers() {
    if (!currentWord || !dictionary) return;

    const wordData = dictionary[currentWord];

    const inputs = [
        { field: inputField1, feedback: feedback1 },
        { field: inputField2, feedback: feedback2 },
        { field: inputField3, feedback: feedback3 }
    ];

    inputs.forEach(({ field, feedback }) => {
        const fieldName = field.dataset.field;
        let userAnswer = field.value.trim();
        let expectedAnswer = wordData[fieldName];

        // For IPA fields, strip slashes from both user input and expected answer
        if (fieldName === 'ipa') {
            userAnswer = userAnswer.replace(/^\/|\/$/g, '');
            expectedAnswer = expectedAnswer.replace(/^\/|\/$/g, '');
        }

        const isCorrect = userAnswer.toLowerCase() === expectedAnswer.toLowerCase();

        if (isCorrect) {
            field.className = 'answer-input correct';
            feedback.textContent = '✓ Correct';
            feedback.className = 'answer-feedback correct';
        } else {
            field.className = 'answer-input wrong';
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
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                googleStatus.textContent = 'Error: ' + resp.error;
                googleStatus.className = 'google-status error';
                return;
            }

            saveTokenToStorage(resp);

            isGoogleDriveConnected = true;
            googleBtnText.textContent = 'Loading from Drive...';
            googleStatus.textContent = 'Connecting...';
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
        };

        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            tokenClient.requestAccessToken({prompt: ''});
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
