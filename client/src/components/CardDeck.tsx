import React from 'react';
import './CardDeck.css';

export type CardValue = '0' | '1' | '2' | '3' | '5' | '8' | '13' | '?' | '∞';
const CARD_VALUES: CardValue[] = ['0', '1', '2', '3', '5', '8', '13', '?', '∞'];

interface CardDeckProps {
    onSelectCard: (value: CardValue) => void;
    selectedCard?: CardValue;
}

export const CardDeck: React.FC<CardDeckProps> = ({ onSelectCard, selectedCard }) => {
    return (
        <div className="card-deck">
            {CARD_VALUES.map((value, index) => (
                <div key={value} className="card-container">
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
                        onClick={() => onSelectCard(value)}
                    />
                    <div
                        className={`card ${selectedCard === value ? 'selected' : ''}`}
                        data-index={index}
                    >
                        {value}
                    </div>
                </div>
            ))}
        </div>
    );
};
