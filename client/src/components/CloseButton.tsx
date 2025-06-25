import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './CloseButton.css';

interface CloseButtonProps {
    onClick: () => void;
    className?: string;
}

export const CloseButton: React.FC<CloseButtonProps> = ({ onClick, className = '' }) => {
    return (
        <button 
            className={`close-btn ${className}`.trim()}
            onClick={onClick}
            type="button"
            aria-label="Close"
        >
            <FontAwesomeIcon icon={faTimes} />
        </button>
    );
};