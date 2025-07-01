import React, { useState } from 'react';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CloseButton } from './CloseButton';
import './VersionInfo.css';

interface VersionInfoProps {
    className?: string;
}

export const VersionInfo: React.FC<VersionInfoProps> = ({ className }) => {
    const [showModal, setShowModal] = useState(false);
    
    const version = process.env.REACT_APP_VERSION || 'dev';
    const buildHash = process.env.REACT_APP_BUILD_HASH || 'local';
    const buildBranch = process.env.REACT_APP_BUILD_BRANCH || 'unknown';
    const buildTime = process.env.REACT_APP_BUILD_TIME || 'unknown';
    const environment = process.env.NODE_ENV === 'production' ? 'Production' : 'Development';

    const handleClick = () => {
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    return (
        <>
            <div className={`version-info ${className || ''}`}>
                <button 
                    className="version-button"
                    onClick={handleClick}
                    type="button"
                    aria-label="Version Information"
                >
                    <FontAwesomeIcon icon={faQuestionCircle} />
                </button>
            </div>
            
            {showModal && (
                <div className="settings-modal-overlay" onClick={handleBackdropClick}>
                    <div className="settings-modal">
                        <div className="settings-modal-header">
                            <h3>Version Information</h3>
                            <CloseButton onClick={handleClose} />
                        </div>
                        <div className="settings-modal-content">
                            <div className="version-item">
                                <span className="version-label">Version:</span>
                                <span className="version-value">Planning Poker v{version}</span>
                            </div>
                            <div className="version-item">
                                <span className="version-label">Build:</span>
                                <span className="version-value">{buildHash} ({buildBranch})</span>
                            </div>
                            <div className="version-item">
                                <span className="version-label">Built:</span>
                                <span className="version-value">{buildTime}</span>
                            </div>
                            <div className="version-item">
                                <span className="version-label">Environment:</span>
                                <span className="version-value">{environment}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};