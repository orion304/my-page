// Shared Google Drive OAuth Authentication Module
// Used by all trainers (ASL, Chinese, French) for unified authentication

const CLIENT_ID = '47759577064-h3pt7ehhl0n3d2i6dm6je5m2ln4iukn4.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

// Token storage key (unified across all trainers)
const TOKEN_STORAGE_KEY = 'google_drive_token';
const REFRESH_TOKEN_KEY = 'google_drive_refresh_token';

// Migration: Clear old separate tokens
function migrateOldTokens() {
    const oldTokens = ['google_drive_token_chinese', 'google_drive_token_french'];
    oldTokens.forEach(key => {
        if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
        }
    });
}

// Initialize migration on load
migrateOldTokens();

class GoogleDriveAuth {
    constructor() {
        this.gapiInited = false;
        this.tokenClient = null;
        this.isConnected = false;
    }

    // Initialize Google API Client
    async initializeGapiClient() {
        await gapi.client.init({
            discoveryDocs: DISCOVERY_DOCS,
        });
        this.gapiInited = true;
    }

    // Initialize Google Identity Services with offline access for refresh tokens
    initializeGIS() {
        this.tokenClient = google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES,
            callback: '', // Will be set when requesting token
            // Request offline access to get refresh tokens
            access_type: 'offline',
            prompt: 'consent', // Force consent to ensure we get refresh token
        });
    }

    // Check if user is already signed in with valid token
    async checkIfSignedIn() {
        const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (savedToken) {
            try {
                const tokenObj = JSON.parse(savedToken);
                const now = Date.now();

                // Check if access token is expired
                if (tokenObj.expiry && now < tokenObj.expiry) {
                    // Access token is still valid
                    gapi.client.setToken(tokenObj);
                    this.isConnected = true;
                    return true;
                } else if (refreshToken) {
                    // Access token expired, try to refresh
                    console.log('Access token expired, attempting refresh...');
                    const refreshed = await this.refreshAccessToken(refreshToken);
                    if (refreshed) {
                        this.isConnected = true;
                        return true;
                    }
                }

                // Token expired and couldn't refresh, remove it
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
            } catch (error) {
                console.error('Error loading saved token:', error);
                localStorage.removeItem(TOKEN_STORAGE_KEY);
                localStorage.removeItem(REFRESH_TOKEN_KEY);
            }
        }

        return false;
    }

    // Refresh access token using refresh token
    async refreshAccessToken(refreshToken) {
        try {
            // Note: Google's token refresh requires a server-side implementation
            // For a client-side only app, we need to handle token refresh differently
            // The GIS library handles token refresh automatically when using requestAccessToken

            // For now, we'll rely on the automatic refresh behavior of GIS
            // When the access token expires, the next API call will trigger a refresh
            console.log('Token refresh handled by GIS library');
            return false; // Return false to trigger new sign-in flow
        } catch (error) {
            console.error('Error refreshing token:', error);
            return false;
        }
    }

    // Save token to localStorage with expiry
    saveTokenToStorage(token) {
        // Add expiry time (Google access tokens last 1 hour)
        const tokenWithExpiry = {
            ...token,
            expiry: Date.now() + (3600 * 1000) // 1 hour from now
        };
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenWithExpiry));

        // Save refresh token if provided
        if (token.refresh_token) {
            localStorage.setItem(REFRESH_TOKEN_KEY, token.refresh_token);
        }
    }

    // Request access token from user (OAuth flow)
    async requestAccessToken(callback) {
        return new Promise((resolve, reject) => {
            this.tokenClient.callback = async (resp) => {
                if (resp.error !== undefined) {
                    reject(new Error(resp.error));
                    return;
                }

                // Save token to localStorage
                this.saveTokenToStorage(resp);
                this.isConnected = true;

                // Call custom callback if provided
                if (callback) {
                    await callback(resp);
                }

                resolve(resp);
            };

            // Request access token
            // Use 'consent' prompt to ensure we get refresh token on first auth
            // On subsequent auths, can use '' to avoid re-consent if token exists
            const existingToken = gapi.client.getToken();
            const prompt = existingToken === null ? 'consent' : '';

            this.tokenClient.requestAccessToken({ prompt });
        });
    }

    // Get current access token
    getAccessToken() {
        const token = gapi.client.getToken();
        return token ? token.access_token : null;
    }

    // Check if currently connected
    isSignedIn() {
        return this.isConnected;
    }

    // Sign out and clear tokens
    signOut() {
        const token = gapi.client.getToken();
        if (token !== null) {
            google.accounts.oauth2.revoke(token.access_token);
            gapi.client.setToken(null);
        }
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        this.isConnected = false;
    }
}

// Export singleton instance
const googleDriveAuth = new GoogleDriveAuth();

// Auto-initialize when scripts are loaded
function gapiLoaded() {
    gapi.load('client', async () => {
        await googleDriveAuth.initializeGapiClient();
    });
}

function gisLoaded() {
    googleDriveAuth.initializeGIS();
}

// Load Google Identity Services
const script = document.createElement('script');
script.src = 'https://accounts.google.com/gsi/client';
script.onload = gisLoaded;
document.head.appendChild(script);

// Load Google API Client
setTimeout(gapiLoaded, 100);
