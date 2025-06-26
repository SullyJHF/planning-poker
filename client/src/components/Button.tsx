import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    title?: string;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
    icon?: IconDefinition;
    iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    onClick,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    title,
    type = 'button',
    className = '',
    icon,
    iconPosition = 'left'
}) => {
    const baseClass = 'btn';
    const variantClass = `btn--${variant}`;
    const sizeClass = `btn--${size}`;
    const disabledClass = disabled ? 'btn--disabled' : '';
    
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
            {icon && iconPosition === 'left' && (
                <FontAwesomeIcon icon={icon} className="btn__icon btn__icon--left" />
            )}
            <span className="btn__text">{children}</span>
            {icon && iconPosition === 'right' && (
                <FontAwesomeIcon icon={icon} className="btn__icon btn__icon--right" />
            )}
        </button>
    );
};