const CLIENT_ID = '47759577064-h3pt7ehhl0n3d2i6dm6je5m2ln4iukn4.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
const FILE_NAME = 'asl_dictionary.json';

let dictionary = null;
let currentWord = null;
let correctCount = 0;
let wrongCount = 0;
let fileName = '';
let prefetchFrame = null;
let googleDriveFileId = null;
let isGoogleDriveConnected = false;
let gapiInited = false;
let tokenClient = null;

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

// Initialize Google API
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
        callback: '', // defined later
    });
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && tokenClient) {
        googleDriveBtn.disabled = false;
        // Check if we have a saved token
        checkIfSignedIn();
    }
}

async function checkIfSignedIn() {
    // Try to get saved token from localStorage
    const savedToken = localStorage.getItem('google_drive_token');

    if (savedToken) {
        try {
            const tokenObj = JSON.parse(savedToken);

            // Check if token is expired
            const now = Date.now();
            if (tokenObj.expiry && now < tokenObj.expiry) {
                // Token is still valid, set it
                gapi.client.setToken(tokenObj);
                isGoogleDriveConnected = true;
                googleBtnText.textContent = 'Loading from Drive...';
                googleStatus.textContent = 'Reconnecting...';
                googleStatus.className = 'google-status';

                await loadFromGoogleDrive();
                googleBtnText.textContent = '✓ Connected to Google Drive';

                // Only show "auto-saving enabled" if we actually loaded a dictionary
                if (dictionary) {
                    googleStatus.textContent = 'Auto-saving enabled';
                    googleStatus.className = 'google-status success';
                }

                googleDriveBtn.disabled = true;
                return;
            } else {
                // Token expired, remove it
                localStorage.removeItem('google_drive_token');
            }
        } catch (error) {
            console.error('Error loading saved token:', error);
            localStorage.removeItem('google_drive_token');
        }
    }
}

function saveTokenToStorage(token) {
    // Add expiry time (tokens typically last 1 hour)
    const tokenWithExpiry = {
        ...token,
        expiry: Date.now() + (3600 * 1000) // 1 hour from now
    };
    localStorage.setItem('google_drive_token', JSON.stringify(tokenWithExpiry));
}

// Load Google Identity Services
const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.onload = gisLoaded;
document.head.appendChild(script);

// Call gapiLoaded when gapi is ready
setTimeout(gapiLoaded, 100);

fileUpload.addEventListener('change', handleFileUpload);
showSignBtn.addEventListener('click', toggleIframe);
closeIframeBtn.addEventListener('click', toggleIframe);
correctBtn.addEventListener('click', handleCorrect);
wrongBtn.addEventListener('click', handleWrong);
downloadBtn.addEventListener('click', downloadDictionary);
googleDriveBtn.addEventListener('click', handleGoogleDrive);

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

function showRandomWord() {
    if (!dictionary) return;

    // Filter to only unlearned and learning words
    const words = Object.keys(dictionary).filter(key => {
        const state = dictionary[key].state;
        return state === 'not_started' || state === 'learning';
    });

    // If no words left to learn, show completion message
    if (words.length === 0) {
        conceptDisplay.textContent = '🎉 All words learned!';
        showSignBtn.style.display = 'none';
        iframeContainer.classList.remove('visible');
        correctBtn.disabled = true;
        wrongBtn.disabled = true;
        return;
    }

    const randomKey = words[Math.floor(Math.random() * words.length)];
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

async function handleCorrect() {
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

    await saveToGoogleDrive();

    showRandomWord();
}

async function handleWrong() {
    if (!currentWord) return;

    wrongCount++;
    wrongCountDisplay.textContent = wrongCount;

    const wordData = dictionary[currentWord];

    // Reset correct counter but keep in learning state
    wordData.correctCount = 0;
    wordData.state = 'learning';

    await saveToGoogleDrive();

    showRandomWord();
}

async function handleGoogleDrive() {
    if (!isGoogleDriveConnected) {
        // Connect to Google Drive
        tokenClient.callback = async (resp) => {
            if (resp.error !== undefined) {
                googleStatus.textContent = 'Error: ' + resp.error;
                googleStatus.className = 'google-status error';
                return;
            }

            // Save token to localStorage
            saveTokenToStorage(resp);

            isGoogleDriveConnected = true;
            googleBtnText.textContent = 'Loading from Drive...';
            googleStatus.textContent = 'Connecting...';
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
        };

        if (gapi.client.getToken() === null) {
            tokenClient.requestAccessToken({prompt: 'consent'});
        } else {
            tokenClient.requestAccessToken({prompt: ''});
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
