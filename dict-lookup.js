/**
 * CC-CEDICT Dictionary Lookup Module
 * Provides pinyin-based word lookup with tone-smart matching
 */

const DictLookup = (function() {
    let dictData = null;
    let isLoading = false;
    let loadPromise = null;

    /**
     * Lazy load the dictionary JSON file
     * @returns {Promise} Resolves when dictionary is loaded
     */
    async function loadDictionary() {
        if (dictData) {
            return dictData;
        }

        if (isLoading) {
            return loadPromise;
        }

        isLoading = true;
        loadPromise = fetch('cedict_pinyin_index.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load dictionary: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                dictData = data;
                isLoading = false;
                console.log('Dictionary loaded successfully');
                return dictData;
            })
            .catch(error => {
                isLoading = false;
                loadPromise = null;
                console.error('Failed to load dictionary:', error);
                throw error;
            });

        return loadPromise;
    }

    /**
     * Normalize pinyin for comparison (lowercase, trim spaces)
     * @param {string} pinyin - Input pinyin
     * @returns {string} Normalized pinyin
     */
    function normalizePinyin(pinyin) {
        return pinyin.toLowerCase().trim();
    }

    /**
     * Check if pinyin query contains tone numbers
     * @param {string} pinyin - Pinyin query
     * @returns {boolean} True if contains tone numbers
     */
    function hasTones(pinyin) {
        return /[0-9]/.test(pinyin);
    }

    /**
     * Search dictionary by pinyin
     * Tone-smart: if query has tones, exact match; if no tones, flexible match
     *
     * @param {string} query - Pinyin query (e.g., "guo3 zhi1" or "guo zhi")
     * @param {number} maxResults - Maximum number of results to return (default: 20)
     * @returns {Promise<Array>} Array of matching dictionary entries
     */
    async function searchByPinyin(query, maxResults = 20) {
        const dict = await loadDictionary();
        const normalizedQuery = normalizePinyin(query);

        let results = [];

        if (hasTones(normalizedQuery)) {
            // Exact tone matching
            results = dict.with_tones[normalizedQuery] || [];
        } else {
            // Tone-flexible matching
            results = dict.without_tones[normalizedQuery] || [];
        }

        // Limit results
        if (results.length > maxResults) {
            results = results.slice(0, maxResults);
        }

        return results;
    }

    /**
     * Check if dictionary is already loaded
     * @returns {boolean} True if loaded
     */
    function isLoaded() {
        return dictData !== null;
    }

    /**
     * Preload dictionary in the background
     * Useful for warming up before user needs it
     */
    function preload() {
        if (!dictData && !isLoading) {
            loadDictionary().catch(err => {
                console.warn('Dictionary preload failed:', err);
            });
        }
    }

    // Public API
    return {
        searchByPinyin,
        isLoaded,
        preload,
        loadDictionary
    };
})();

// Make available globally
window.DictLookup = DictLookup;
