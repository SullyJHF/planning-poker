import React, { createContext, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
    jiraBaseUrl: string;
    setJiraBaseUrl: (url: string) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

const STORAGE_KEY = 'planning-poker-settings';
const DEFAULT_JIRA_BASE_URL = 'https://yourcompany.atlassian.net/browse/';

export const SettingsProvider: React.FC<{ children: React.ReactNode; }> = ({ children }) => {
    const [jiraBaseUrl, setJiraBaseUrlState] = useState<string>(DEFAULT_JIRA_BASE_URL);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                if (parsed.jiraBaseUrl) {
                    setJiraBaseUrlState(parsed.jiraBaseUrl);
                }
            } catch (error) {
                console.warn('Failed to parse saved settings:', error);
            }
        }
    }, []);

    // Save settings to localStorage when they change
    const setJiraBaseUrl = (url: string) => {
        setJiraBaseUrlState(url);
        const settings = { jiraBaseUrl: url };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    };

    return (
        <SettingsContext.Provider value={{ jiraBaseUrl, setJiraBaseUrl }}>
            {children}
        </SettingsContext.Provider>
    );
};