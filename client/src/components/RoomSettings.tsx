import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faCog, 
    faSave, 
    faEye, 
    faEyeSlash,
    faLock,
    faLockOpen
} from '@fortawesome/free-solid-svg-icons';
import { CloseButton } from './CloseButton';
import { IconButton } from './IconButton';
import { Button } from './Button';
import './RoomSettings.css';

interface RoomSettingsProps {
    isHost: boolean;
    jiraBaseUrl: string;
    isPrivateRoom: boolean;
    currentPassword?: string;
    onUpdateJiraBaseUrl: (jiraBaseUrl: string) => void;
    onUpdateRoomPassword: (password: string) => void;
}

export const RoomSettings: React.FC<RoomSettingsProps> = ({
    isHost,
    jiraBaseUrl,
    isPrivateRoom,
    currentPassword,
    onUpdateJiraBaseUrl,
    onUpdateRoomPassword
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const [tempJiraUrl, setTempJiraUrl] = useState(jiraBaseUrl || 'https://yourcompany.atlassian.net/browse/');
    const [tempPassword, setTempPassword] = useState(currentPassword || '');
    const [showPassword, setShowPassword] = useState(false);
    const jiraUrlInputRef = useRef<HTMLInputElement>(null);

    // Update tempJiraUrl when jiraBaseUrl prop changes
    useEffect(() => {
        setTempJiraUrl(jiraBaseUrl || 'https://yourcompany.atlassian.net/browse/');
    }, [jiraBaseUrl]);

    // Update tempPassword when currentPassword prop changes
    useEffect(() => {
        setTempPassword(currentPassword || '');
    }, [currentPassword]);

    // Auto-focus and select text when settings panel opens
    useEffect(() => {
        if (showSettings && jiraUrlInputRef.current) {
            setTimeout(() => {
                jiraUrlInputRef.current?.focus();
                jiraUrlInputRef.current?.select();
            }, 100);
        }
    }, [showSettings]);

    const handleSave = () => {
        // Save Jira URL
        const normalizedUrl = tempJiraUrl.trim().endsWith('/') ? tempJiraUrl.trim() : tempJiraUrl.trim() + '/';
        onUpdateJiraBaseUrl(normalizedUrl);

        // Save password for private rooms
        if (isPrivateRoom) {
            onUpdateRoomPassword(tempPassword);
        }

        setShowSettings(false);
    };

    const handleCancel = () => {
        setTempJiraUrl(jiraBaseUrl || 'https://yourcompany.atlassian.net/browse/');
        setTempPassword(currentPassword || '');
        setShowPassword(false);
        setShowSettings(false);
    };

    if (!isHost) {
        return null;
    }

    return (
        <>
            <IconButton 
                icon={faCog}
                variant="outline"
                onClick={() => setShowSettings(true)}
                title="Room settings"
            />

            {showSettings && (
                <div className="settings-modal-overlay">
                    <div className="settings-modal">
                        <div className="settings-modal-header">
                            <h3>Room Settings</h3>
                            <CloseButton onClick={handleCancel} />
                        </div>
                        
                        <div className="settings-modal-content">
                            {/* Jira Settings Section */}
                            <div className="settings-section">
                                <h4>Jira Integration</h4>
                                <div className="setting-item">
                                    <label htmlFor="jira-base-url">Jira Base URL</label>
                                    <input
                                        ref={jiraUrlInputRef}
                                        id="jira-base-url"
                                        type="url"
                                        value={tempJiraUrl}
                                        onChange={(e) => setTempJiraUrl(e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                        placeholder="https://yourcompany.atlassian.net/browse/"
                                    />
                                    <div className="setting-description">
                                        Ticket IDs will be automatically appended to this URL.
                                    </div>
                                </div>
                            </div>

                            {/* Password Settings Section - Only for private rooms */}
                            {isPrivateRoom && (
                                <div className="settings-section">
                                    <h4>
                                        <FontAwesomeIcon icon={faLock} />
                                        Private Room Settings
                                    </h4>
                                    <div className="setting-item">
                                        <label htmlFor="room-password">Room Password</label>
                                        <div className="password-input-container">
                                            <input
                                                id="room-password"
                                                type={showPassword ? "text" : "password"}
                                                value={tempPassword}
                                                onChange={(e) => setTempPassword(e.target.value)}
                                                placeholder="Enter room password"
                                            />
                                            <button
                                                type="button"
                                                className="password-toggle-btn"
                                                onClick={() => setShowPassword(!showPassword)}
                                                title={showPassword ? "Hide password" : "Show password"}
                                            >
                                                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                            </button>
                                        </div>
                                        <div className="setting-description">
                                            Users will need this password to join the room.
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Room Type Indicator for Public Rooms */}
                            {!isPrivateRoom && (
                                <div className="settings-section">
                                    <h4>
                                        <FontAwesomeIcon icon={faLockOpen} />
                                        Public Room
                                    </h4>
                                    <div className="setting-description">
                                        This room is public and visible in the room list. Anyone can join without a password.
                                    </div>
                                </div>
                            )}


                            <div className="settings-modal-actions">
                                <Button variant="secondary" onClick={handleCancel}>
                                    Cancel
                                </Button>
                                <Button variant="primary" icon={faSave} onClick={handleSave}>
                                    Save Settings
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};