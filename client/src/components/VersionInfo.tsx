import React, { useState } from 'react';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Modal } from './Modal';
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
            
            <Modal
                isOpen={showModal}
                onClose={handleClose}
                title="Version Information"
                size="small"
            >
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
            </Modal>
        </>
    );
};