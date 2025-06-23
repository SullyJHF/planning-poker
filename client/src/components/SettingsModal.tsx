import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import { useSettings } from '../contexts/SettingsContext';
import './SettingsModal.css';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { jiraBaseUrl, setJiraBaseUrl } = useSettings();
    const [tempJiraBaseUrl, setTempJiraBaseUrl] = useState(jiraBaseUrl);

    if (!isOpen) return null;

    const handleSave = () => {
        setJiraBaseUrl(tempJiraBaseUrl);
        onClose();
    };

    const handleCancel = () => {
        setTempJiraBaseUrl(jiraBaseUrl); // Reset to current value
        onClose();
    };

    return (
        <div className="settings-overlay">
            <div className="settings-modal">
                <div className="settings-header">
                    <h2>Settings</h2>
                    <button className="close-btn" onClick={handleCancel}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
                
                <div className="settings-content">
                    <div className="setting-group">
                        <label htmlFor="jira-base-url">Jira Base URL</label>
                        <input
                            id="jira-base-url"
                            type="url"
                            value={tempJiraBaseUrl}
                            onChange={(e) => setTempJiraBaseUrl(e.target.value)}
                            placeholder="https://yourcompany.atlassian.net/browse/"
                        />
                        <div className="setting-description">
                            Enter your Jira instance base URL. Ticket IDs will be automatically appended to this URL.
                        </div>
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="save-btn" onClick={handleSave}>
                        <FontAwesomeIcon icon={faSave} />
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};