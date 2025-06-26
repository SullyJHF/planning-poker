import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import './IconButton.css';

export type IconButtonVariant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success' | 'warning';
export type IconButtonSize = 'small' | 'medium' | 'large';

interface IconButtonProps {
    icon: IconDefinition;
    onClick?: () => void;
    variant?: IconButtonVariant;
    size?: IconButtonSize;
    disabled?: boolean;
    title?: string;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    onClick,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    title,
    type = 'button',
    className = ''
}) => {
    const baseClass = 'icon-btn';
    const variantClass = `icon-btn--${variant}`;
    const sizeClass = `icon-btn--${size}`;
    const disabledClass = disabled ? 'icon-btn--disabled' : '';
    
    const classes = [baseClass, variantClass, sizeClass, disabledClass, className]
        .filter(Boolean)
        .join(' ');

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled}
            title={title}
        >
            <FontAwesomeIcon icon={icon} />
        </button>
    );
};