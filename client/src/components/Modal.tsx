import React, { ReactNode } from 'react';
import { CloseButton } from './CloseButton';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose?: () => void;
    title?: string | ReactNode;
    children: ReactNode;
    size?: 'small' | 'medium' | 'large';
    showCloseButton?: boolean;
    allowBackdropClose?: boolean;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    showCloseButton = true,
    allowBackdropClose = true,
    className = ''
}) => {
    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && allowBackdropClose && onClose) {
            onClose();
        }
    };

    const handleClose = () => {
        if (onClose) {
            onClose();
        }
    };

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className={`modal ${size} ${className}`}>
                {(title || showCloseButton) && (
                    <div className="modal-header">
                        {title && (
                            typeof title === 'string' ? <h3>{title}</h3> : <div className="modal-title">{title}</div>
                        )}
                        {showCloseButton && onClose && (
                            <CloseButton onClick={handleClose} />
                        )}
                    </div>
                )}
                <div className="modal-content">
                    {children}
                </div>
            </div>
        </div>
    );
};