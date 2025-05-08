import React from 'react';
import './CardDeck.css';

export type CardValue = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '?' | '∞';

interface CardDeckProps {
    onSelectCard: (value: CardValue) => void;
    selectedCard?: CardValue;
}

const CARD_VALUES: CardValue[] = ['0', '1', '2', '3', '5', '8', '13', '?', '∞'];

export const CardDeck: React.FC<CardDeckProps> = ({ onSelectCard, selectedCard }) => {
    return (
        <div className="card-deck">
            {CARD_VALUES.map((value) => (
                <button
                    key={value}
                    className={`card ${selectedCard === value ? 'selected' : ''}`}
                    onClick={() => onSelectCard(value)}
                >
                    {value}
                </button>
            ))}
        </div>
    );
}; 
