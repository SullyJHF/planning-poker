import React, { useEffect, useState } from 'react';
import './CardDeck.css';

export type CardValue = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '?' | '∞';
const CARD_VALUES: CardValue[] = ['0', '1', '2', '3', '5', '8', '13', '?', '∞'];

interface CardDeckProps {
    onSelectCard: (value: CardValue) => void;
    selectedCard?: CardValue;
    disabled?: boolean;
    isVisible?: boolean;
}

export const CardDeck: React.FC<CardDeckProps> = ({ onSelectCard, selectedCard, disabled = false, isVisible = true }) => {
    const [animatedCards, setAnimatedCards] = useState<boolean[]>(new Array(CARD_VALUES.length).fill(false));

    useEffect(() => {
        if (isVisible && !disabled) {
            // Reset animation state
            setAnimatedCards(new Array(CARD_VALUES.length).fill(false));
            
            // Animate cards sequentially from left to right with a slight delay
            CARD_VALUES.forEach((_, index) => {
                setTimeout(() => {
                    setAnimatedCards(prev => {
                        const newState = [...prev];
                        newState[index] = true;
                        return newState;
                    });
                }, index * 80); // 80ms delay between each card
            });
        } else if (!isVisible) {
            // Reset animation state when hiding
            setAnimatedCards(new Array(CARD_VALUES.length).fill(false));
        }
    }, [isVisible, disabled]);

    if (!isVisible) {
        return null;
    }
    return (
        <div className="card-deck">
            {CARD_VALUES.map((value, index) => (
                <div key={value} className={`card-container ${animatedCards[index] ? 'animated' : ''}`}>
                    <button
                        className="card-hover-area"
                        data-index={index}
                        onMouseEnter={(e) => {
                            const card = e.currentTarget.nextElementSibling;
                            if (card) card.classList.add('hover');
                        }}
                        onMouseLeave={(e) => {
                            const card = e.currentTarget.nextElementSibling;
                            if (card) card.classList.remove('hover');
                        }}
                        onClick={() => !disabled && onSelectCard(value)}
                        disabled={disabled}
                    />
                    <div
                        className={`card ${selectedCard === value ? 'selected' : ''} ${animatedCards[index] ? 'animated' : ''}`}
                        data-index={index}
                    >
                        {value}
                    </div>
                </div>
            ))}
        </div>
    );
};
