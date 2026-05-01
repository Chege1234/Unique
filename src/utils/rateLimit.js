const rateLimitMap = new Map();

/**
 * Client-side rate limiter to prevent rapid repeated submissions
 * @param {string} key - Unique identifier for the action being rate-limited
 * @param {number} limitMs - Minimum milliseconds between allowed calls (default: 2000ms)
 * @returns {boolean} true if the action is allowed
 * @throws {Error} if the action is being called too frequently
 */
export const rateLimit = (key, limitMs = 2000) => {
    const now = Date.now();
    const lastCall = rateLimitMap.get(key);

    if (lastCall && now - lastCall < limitMs) {
        throw new Error('Too many requests. Please wait a moment before trying again.');
    }

    rateLimitMap.set(key, now);
    return true;
};

/**
 * Clears the rate limit entry for the given key
 * @param {string} key - The key to clear
 */
export const clearRateLimit = (key) => {
    rateLimitMap.delete(key);
};

