// Utility for managing username in localStorage with URL parameter override support

const USERNAME_STORAGE_KEY = 'planning-poker-username';

/**
 * Get the username from localStorage or URL parameter
 * URL parameter takes precedence for testing purposes
 */
export const getCachedUsername = (): string => {
    // First check for URL parameter override (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    const urlUsername = urlParams.get('username');
    
    if (urlUsername) {
        return urlUsername.trim();
    }
    
    // Fall back to localStorage
    try {
        return localStorage.getItem(USERNAME_STORAGE_KEY) || '';
    } catch (error) {
        console.warn('Failed to read username from localStorage:', error);
        return '';
    }
};

/**
 * Save username to localStorage
 */
export const saveCachedUsername = (username: string): void => {
    try {
        if (username.trim()) {
            localStorage.setItem(USERNAME_STORAGE_KEY, username.trim());
        }
    } catch (error) {
        console.warn('Failed to save username to localStorage:', error);
    }
};

/**
 * Clear the cached username from localStorage
 */
export const clearCachedUsername = (): void => {
    try {
        localStorage.removeItem(USERNAME_STORAGE_KEY);
    } catch (error) {
        console.warn('Failed to clear username from localStorage:', error);
    }
};

/**
 * Check if username is provided via URL parameter (for testing)
 */
export const isUsernameFromUrl = (): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    return !!urlParams.get('username');
};