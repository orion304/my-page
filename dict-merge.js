/**
 * Dictionary Merge Utility
 * Merges repository dictionary updates into user's dictionary while preserving progress
 */

/**
 * Merges repository dictionary into user's dictionary
 * @param {Object} userDict - User's current dictionary (from Google Drive or file)
 * @param {Object} repoDict - Repository dictionary (default/latest version)
 * @returns {Object} { merged: mergedDict, stats: { newWords, updatedWords } }
 */
function mergeDictionaries(userDict, repoDict) {
    const merged = {};
    const stats = {
        newWords: 0,
        updatedWords: 0
    };

    // First, copy all user's words (preserves custom additions)
    Object.keys(userDict).forEach(key => {
        merged[key] = { ...userDict[key] };
    });

    // Then, merge in repository words
    Object.keys(repoDict).forEach(key => {
        if (!merged[key]) {
            // New word from repo - add with state="not_started"
            merged[key] = { ...repoDict[key] };
            merged[key].state = 'not_started';
            merged[key].correctCount = 0;
            stats.newWords++;
        } else {
            // Word exists in both - check if fields need updating
            const userWord = merged[key];
            const repoWord = repoDict[key];
            let hasUpdates = false;

            // Update all fields from repo EXCEPT state and correctCount
            Object.keys(repoWord).forEach(field => {
                if (field !== 'state' && field !== 'correctCount' && field !== 'lesson') {
                    if (userWord[field] !== repoWord[field]) {
                        userWord[field] = repoWord[field];
                        hasUpdates = true;
                    }
                }
            });

            if (hasUpdates) {
                stats.updatedWords++;
            }
        }
    });

    return { merged, stats };
}

/**
 * Fetches the default dictionary from the repository
 * @param {string} fileName - Dictionary filename (e.g., "chinese_dictionary.json")
 * @returns {Promise<Object>} Repository dictionary
 */
async function fetchRepoDictionary(fileName) {
    const repoUrl = `https://raw.githubusercontent.com/orion304/my-page/main/${fileName}`;
    const response = await fetch(repoUrl);

    if (!response.ok) {
        throw new Error(`Failed to fetch repository dictionary: ${response.status}`);
    }

    return await response.json();
}

/**
 * Merges user's dictionary with latest from repository
 * @param {Object} userDict - User's current dictionary
 * @param {string} fileName - Dictionary filename
 * @returns {Promise<Object>} { merged: mergedDict, stats: { newWords, updatedWords } }
 */
async function mergeWithRepo(userDict, fileName) {
    try {
        const repoDict = await fetchRepoDictionary(fileName);
        return mergeDictionaries(userDict, repoDict);
    } catch (error) {
        console.error('Error fetching repo dictionary:', error);
        // If fetch fails, return user's dictionary unchanged
        return {
            merged: userDict,
            stats: { newWords: 0, updatedWords: 0 }
        };
    }
}

// Export for use in trainers
window.DictMerge = {
    mergeDictionaries,
    fetchRepoDictionary,
    mergeWithRepo
};
