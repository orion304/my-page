const FILE_NAME = 'asl_dictionary.json';
const DEFAULT_DICTIONARY_URL = 'https://raw.githubusercontent.com/orion304/my-page/main/asl_dictionary.json';

let dictionary = null;
let currentWord = null;
let correctCount = 0;
let wrongCount = 0;
let fileName = '';
let prefetchFrame = null;
let googleDriveFileId = null;
let isGoogleDriveConnected = false;
let isSaving = false;
let needsAnotherSave = false;

const fileUpload = document.getElementById('file-upload');
const fileNameDisplay = document.getElementById('file-name');
const trainingSection = document.getElementById('training-section');
const conceptDisplay = document.getElementById('current-concept');
const showSignBtn = document.getElementById('show-sign-btn');
const iframeContainer = document.getElementById('iframe-container');
const signIframe = document.getElementById('sign-iframe');
const correctBtn = document.getElementById('correct-btn');
const wrongBtn = document.getElementById('wrong-btn');
const downloadBtn = document.getElementById('download-btn');
const correctCountDisplay = document.getElementById('correct-count');
const wrongCountDisplay = document.getElementById('wrong-count');
const totalCountDisplay = document.getElementById('total-count');
const googleDriveBtn = document.getElementById('google-drive-btn');
const googleBtnText = document.getElementById('google-btn-text');
const googleStatus = document.getElementById('google-status');
const closeIframeBtn = document.getElementById('close-iframe-btn');
const iframeTitle = document.getElementById('iframe-title');
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

            // Only show "auto-saving enabled" if we actually loaded a dictionary
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
showSignBtn.addEventListener('click', toggleIframe);
closeIframeBtn.addEventListener('click', toggleIframe);
correctBtn.addEventListener('click', handleCorrect);
wrongBtn.addEventListener('click', handleWrong);
downloadBtn.addEventListener('click', downloadDictionary);
googleDriveBtn.addEventListener('click', handleGoogleDrive);
loadDefaultBtn.addEventListener('click', loadDefaultDictionary);
changeDictionaryBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showUploadSection();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Only handle shortcuts when training section is active
    if (!trainingSection.classList.contains('active')) return;

    // Ignore if user is typing in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    // Spacebar or Numpad 1: Toggle sign visibility
    if (e.code === 'Space' || e.code === 'Numpad1') {
        e.preventDefault();
        if (showSignBtn.style.display !== 'none') {
            toggleIframe();
        }
    }

    // Right Arrow, Enter, or Numpad 2: Mark correct
    else if (e.code === 'ArrowRight' || e.code === 'Enter' || e.code === 'Numpad2') {
        e.preventDefault();
        if (!correctBtn.disabled) {
            handleCorrect();
        }
    }

    // Left Arrow, Backspace, or Numpad 3: Mark wrong
    else if (e.code === 'ArrowLeft' || e.code === 'Backspace' || e.code === 'Numpad3') {
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

            // If connected to Drive, save this dictionary
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
        fileName = 'asl_dictionary.json';
        fileNameDisplay.textContent = 'Loaded: Default ASL Dictionary';
        trainingSection.classList.add('active');
        totalCountDisplay.textContent = Object.keys(dictionary).length;
        updateProgressTracker();
        showRandomWord();
        hideUploadSection();

        // If connected to Drive, save this dictionary
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

    // Filter to only learning words (not_started means lesson hasn't been unlocked yet)
    const words = Object.keys(dictionary).filter(key => {
        const state = dictionary[key].state;
        return state === 'learning';
    });

    // If no learning words, check if we need to start a new lesson or if we're done
    if (words.length === 0) {
        const nextLesson = getNextLessonNumber();
        const learnedWords = Object.keys(dictionary).filter(key => dictionary[key].state === 'learned');

        if (nextLesson !== null) {
            // There's a next lesson to start
            let html = `🎉 Lesson Complete!<br><button class="start-lesson-btn" onclick="startLesson(${nextLesson})">📚 Start Lesson ${nextLesson}</button>`;

            // Also show review option if there are learned words
            if (learnedWords.length > 0) {
                const maxReview = learnedWords.length;
                const defaultReview = Math.min(10, maxReview);
                html += `<div class="review-section">
                    <p style="margin-top: 20px; color: #666;">— OR —</p>
                    <p style="margin-bottom: 10px; font-weight: 600;">Review Learned Words</p>
                    <div class="review-controls">
                        <input type="range" id="review-slider" min="10" max="${maxReview}" value="${defaultReview}" oninput="updateReviewCount(this.value)">
                        <span id="review-count">${defaultReview} words</span>
                    </div>
                    <button class="start-review-btn" onclick="startReview()">🔄 Start Review</button>
                </div>`;
            }

            conceptDisplay.innerHTML = html;
            showSignBtn.style.display = 'none';
            iframeContainer.classList.remove('visible');
            correctBtn.disabled = true;
            wrongBtn.disabled = true;
        } else {
            // No more lessons - check if we can review
            if (learnedWords.length > 0) {
                const maxReview = learnedWords.length;
                const defaultReview = Math.min(10, maxReview);
                conceptDisplay.innerHTML = `🎉 All Lessons Complete!
                    <div class="review-section">
                        <p style="margin-top: 20px; margin-bottom: 10px; font-weight: 600;">Review Learned Words</p>
                        <div class="review-controls">
                            <input type="range" id="review-slider" min="10" max="${maxReview}" value="${defaultReview}" oninput="updateReviewCount(this.value)">
                            <span id="review-count">${defaultReview} words</span>
                        </div>
                        <button class="start-review-btn" onclick="startReview()">🔄 Start Review</button>
                    </div>`;
            } else {
                // Truly complete - no lessons and no learned words
                conceptDisplay.textContent = '🎉 All words learned!';
            }
            showSignBtn.style.display = 'none';
            iframeContainer.classList.remove('visible');
            correctBtn.disabled = true;
            wrongBtn.disabled = true;
        }

        // Update progress tracker to reflect lesson completion
        updateProgressTracker();
        return;
    }

    // Filter out current word to avoid back-to-back repetition (if we have more than 1 word)
    let availableWords = words;
    if (words.length > 1 && currentWord) {
        availableWords = words.filter(key => key !== currentWord);
    }

    const randomKey = availableWords[Math.floor(Math.random() * availableWords.length)];
    currentWord = randomKey;

    const wordData = dictionary[randomKey];
    conceptDisplay.textContent = wordData.concept;
    iframeTitle.textContent = wordData.concept;

    // Hide iframe when showing new word
    iframeContainer.classList.remove('visible');
    showSignBtn.textContent = '👁️ Show Sign';
    showSignBtn.style.display = 'inline-block';
    correctBtn.disabled = false;
    wrongBtn.disabled = false;

    // Prefetch the page by setting iframe src
    signIframe.src = wordData.url;

    // Update progress tracker
    updateProgressTracker();
}

// Get the next lesson number to start (lowest numbered lesson among not_started words)
function getNextLessonNumber() {
    if (!dictionary) return null;

    const notStartedLessons = Object.keys(dictionary)
        .filter(key => dictionary[key].state === 'not_started')
        .map(key => parseInt(dictionary[key].lesson));

    if (notStartedLessons.length === 0) {
        return null; // No more lessons
    }

    return Math.min(...notStartedLessons);
}

// Start a new lesson by setting all words in that lesson to 'learning' with correctCount 0
// TODO: In the future, consider moving to metadata-based approach (Option 1) where
// active lessons are tracked in dictionary._metadata.activeLessons array for more flexibility
async function startLesson(lessonNumber) {
    if (!dictionary) return;

    // Find all words in this lesson and set them to learning
    Object.keys(dictionary).forEach(key => {
        const word = dictionary[key];
        if (word.lesson === lessonNumber.toString()) {
            word.state = 'learning';
            word.correctCount = 0;
        }
    });

    // Save to Google Drive
    await saveToGoogleDrive();

    // Update UI and show first word
    updateProgressTracker();
    showRandomWord();
}

// Update the review count display when slider moves
function updateReviewCount(value) {
    const countDisplay = document.getElementById('review-count');
    if (countDisplay) {
        countDisplay.textContent = value + ' words';
    }
}

// Start a review session with N randomly selected learned words
function startReview() {
    if (!dictionary) return;

    const slider = document.getElementById('review-slider');
    const reviewCount = slider ? parseInt(slider.value) : 10;

    // Get all learned words
    const learnedWords = Object.keys(dictionary).filter(key => dictionary[key].state === 'learned');

    // Randomly select N words to review
    const wordsToReview = [];
    const shuffled = [...learnedWords].sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(reviewCount, shuffled.length); i++) {
        wordsToReview.push(shuffled[i]);
    }

    // Set selected words to learning with correctCount = 1
    wordsToReview.forEach(key => {
        dictionary[key].state = 'learning';
        dictionary[key].correctCount = 1;
    });

    // Save to Google Drive
    saveToGoogleDrive();

    // Update UI and show first word
    updateProgressTracker();
    showRandomWord();
}

function updateProgressTracker() {
    if (!dictionary) return;

    const learned = [];
    const learning = [];

    Object.keys(dictionary).forEach(key => {
        const word = dictionary[key];
        if (word.state === 'learned') {
            learned.push(word.concept);
        } else if (word.state === 'learning') {
            learning.push({ concept: word.concept, count: word.correctCount || 0 });
        }
    });

    // Update learned list
    if (learned.length > 0) {
        learnedList.innerHTML = learned
            .map(concept => `<span class="word-badge learned">✓ ${concept}</span>`)
            .join('');
    } else {
        learnedList.innerHTML = '<em style="color: #999;">No words learned yet</em>';
    }

    // Update learning list
    if (learning.length > 0) {
        learningList.innerHTML = learning
            .map(item => {
                const badge = item.count === 1
                    ? `<span class="word-badge learning-progress">${item.concept} <span class="progress-indicator">●○</span></span>`
                    : `<span class="word-badge learning">${item.concept}</span>`;
                return badge;
            })
            .join('');
    } else {
        learningList.innerHTML = '<em style="color: #999;">No words in progress</em>';
    }
}

function toggleIframe() {
    if (iframeContainer.classList.contains('visible')) {
        iframeContainer.classList.remove('visible');
        showSignBtn.textContent = '👁️ Show Sign';
    } else {
        iframeContainer.classList.add('visible');
        showSignBtn.textContent = '🔼 Hide Sign';
    }
}

function handleCorrect() {
    if (!currentWord) return;

    correctCount++;
    correctCountDisplay.textContent = correctCount;

    const wordData = dictionary[currentWord];

    // Initialize correctCount if it doesn't exist
    if (wordData.correctCount === undefined) {
        wordData.correctCount = 0;
    }

    // Increment correct counter
    wordData.correctCount++;

    // Update state based on correct count
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

    // Reset correct counter but keep in learning state
    wordData.correctCount = 0;
    wordData.state = 'learning';

    saveToGoogleDrive();

    showRandomWord();
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

                    // Only show "auto-saving enabled" if we actually loaded a dictionary
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
    // Search for existing file
    const response = await gapi.client.drive.files.list({
        q: `name='${FILE_NAME}' and trashed=false`,
        spaces: 'drive',
        fields: 'files(id, name)',
    });

    const files = response.result.files;

    if (files && files.length > 0) {
        // File exists, load it
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
        // File doesn't exist - user needs to upload one
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

    // If already saving, mark that we need another save and return
    if (isSaving) {
        needsAnotherSave = true;
        return;
    }

    // Start saving
    isSaving = true;

    const content = JSON.stringify(dictionary, null, 2);

    try {
        if (googleDriveFileId) {
            // Update existing file
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
            // Create new file
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

        // If another save was requested while we were saving, save again
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
    a.download = fileName || 'asl_dictionary_updated.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
