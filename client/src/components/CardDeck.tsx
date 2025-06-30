import React, { useEffect, useState, useRef, useCallback } from 'react';
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
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [lastRotation, setLastRotation] = useState(0);
    const deckRef = useRef<HTMLDivElement>(null);
    const lastUpdateRef = useRef<number>(0);
    
    // Check if device is mobile with responsive update
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Touch and mouse event handlers for direct scroll behavior
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (disabled || !isMobile) return;
        
        setIsDragging(true);
        setStartX(e.touches[0].clientX);
        setLastRotation(rotation);
        console.log(`Touch start: startX=${e.touches[0].clientX}, rotation=${rotation}`);
    }, [disabled, isMobile, rotation]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (disabled || !isMobile) return;
        
        setIsDragging(true);
        setStartX(e.clientX);
        setLastRotation(rotation);
        console.log(`Mouse down: startX=${e.clientX}, rotation=${rotation}`);
    }, [disabled, isMobile, rotation]);

    // Note: Touch move is handled by native event listener for better preventDefault support

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging || disabled || !isMobile) return;
        
        const currentX = e.clientX;
        const deltaX = currentX - startX;
        
        // Adjust sensitivity so card stays under finger as you drag around the circle
        const sensitivity = 0.5; // Half speed feels more natural
        // Drag left should make cards move left (like rifling through deck)
        const rotationFromDrag = deltaX * sensitivity;
        let newRotation = lastRotation + rotationFromDrag;
        
        // Normalize rotation to 0-360 range
        newRotation = ((newRotation % 360) + 360) % 360;
        
        console.log(`Mouse move: deltaX=${deltaX}, rotationFromDrag=${rotationFromDrag}, newRotation=${newRotation}, currentX=${currentX}, startX=${startX}`);
        setRotation(newRotation);
    }, [isDragging, disabled, isMobile, startX, lastRotation]);

    const handleTouchEnd = useCallback(() => {
        if (!isMobile) return;
        setIsDragging(false);
        console.log('Touch end');
        // No momentum - just stop where the finger lifted
    }, [isMobile]);

    const handleMouseUp = useCallback(() => {
        if (!isMobile) return;
        setIsDragging(false);
        console.log('Mouse up');
    }, [isMobile]);

    // Calculate card position in circular layout
    const getCardStyle = (index: number) => {
        if (!isMobile) {
            // Use original fan layout for desktop
            return {};
        }

        const totalCards = CARD_VALUES.length;
        const angleStep = 360 / totalCards;
        
        // Calculate card position
        let cardAngle;
        if (selectedCard) {
            // If a card is selected, arrange cards with selected card at center
            const selectedIndex = CARD_VALUES.indexOf(selectedCard);
            const relativeIndex = (index - selectedIndex + totalCards) % totalCards;
            // Keep same rotation direction as when no card is selected
            cardAngle = relativeIndex * angleStep + rotation;
        } else {
            // No selection, just use rotation for all cards
            cardAngle = index * angleStep + rotation;
        }
        
        // Normalize the card angle
        cardAngle = ((cardAngle % 360) + 360) % 360;
        const radius = 140; // Distance from center - increased
        
        // Convert angle to radians
        const rad = (cardAngle * Math.PI) / 180;
        
        // Calculate 3D position
        const x = Math.sin(rad) * radius;
        const z = Math.cos(rad) * radius;
        
        // Scale and opacity based on z-position (depth)
        const scale = Math.max(0.7, (z + radius) / (radius * 2));
        
        // More aggressive opacity curve - front 3 cards reach 100% opacity sooner
        const normalizedZ = (z + radius) / (radius * 2); // 0 to 1 range
        const opacity = Math.max(0.4, Math.pow(normalizedZ, 0.5)); // Square root for steeper curve
        
        // Debug logging for problematic cards
        if (index === 0) {
            console.log(`Card 0 position: cardAngle=${cardAngle}, x=${x}, z=${z}, scale=${scale}, opacity=${opacity}, rotation=${rotation}`);
        }
        
        return {
            transform: `translateX(${x}px) translateZ(${z}px) scale(${scale})`,
            opacity,
            zIndex: Math.round(z + radius),
        };
    };

    // Get the card that's closest to center (for visual highlighting)
    const getCenterCardIndex = () => {
        if (!isMobile) return -1;
        
        const totalCards = CARD_VALUES.length;
        const angleStep = 360 / totalCards;
        const normalizedRotation = ((rotation % 360) + 360) % 360;
        
        if (selectedCard) {
            // When a card is selected, we need to account for the different positioning logic
            const selectedIndex = CARD_VALUES.indexOf(selectedCard);
            // Find which card has the smallest absolute angle (closest to 0 degrees = front)
            let centerIndex = 0;
            let minAngle = Infinity;
            
            for (let i = 0; i < totalCards; i++) {
                const relativeIndex = (i - selectedIndex + totalCards) % totalCards;
                let cardAngle = relativeIndex * angleStep + normalizedRotation;
                cardAngle = ((cardAngle % 360) + 360) % 360;
                
                // Find the angle closest to 0 (front of circle)
                const angleFromFront = Math.min(cardAngle, 360 - cardAngle);
                if (angleFromFront < minAngle) {
                    minAngle = angleFromFront;
                    centerIndex = i;
                }
            }
            return centerIndex;
        } else {
            // No selection, use simple calculation
            return Math.round((360 - normalizedRotation) / angleStep) % totalCards;
        }
    };

    // Reset rotation when a card is selected to center it
    useEffect(() => {
        if (selectedCard && isMobile) {
            setRotation(0);
        }
    }, [selectedCard, isMobile]);

    // Add native touch event listener for better control
    useEffect(() => {
        if (!deckRef.current || !isMobile) return;

        const handleNativeTouchMove = (e: TouchEvent) => {
            if (!isDragging || disabled) return;
            
            e.preventDefault(); // This works on native events
            
            const currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            
            // Adjust sensitivity so card stays under finger as you drag around the circle
            const sensitivity = 0.5; // Half speed feels more natural
            // Drag left should make cards move left (like rifling through deck)
            const rotationFromDrag = deltaX * sensitivity;
            let newRotation = lastRotation + rotationFromDrag;
            
            // Normalize rotation
            newRotation = ((newRotation % 360) + 360) % 360;
            
            console.log(`Native touch move: deltaX=${deltaX}, rotationFromDrag=${rotationFromDrag}, newRotation=${newRotation}, currentX=${currentX}, startX=${startX}`);
            setRotation(newRotation);
        };

        const element = deckRef.current;
        element.addEventListener('touchmove', handleNativeTouchMove, { passive: false });
        
        return () => {
            element.removeEventListener('touchmove', handleNativeTouchMove);
        };
    }, [isDragging, disabled, isMobile, startX, lastRotation]);

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
            setRotation(0);
        }
    }, [isVisible, disabled]);

    if (!isVisible) {
        return null;
    }

    const centerCardIndex = getCenterCardIndex();

    return (
        <div 
            ref={deckRef}
            className={`card-deck ${isMobile ? 'circular' : ''} ${isDragging ? 'dragging' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            style={{ touchAction: 'none' }}
        >
            {CARD_VALUES.map((value, index) => {
                const cardStyle = getCardStyle(index);
                const isCenter = isMobile && index === centerCardIndex;
                
                return (
                    <div 
                        key={value} 
                        className={`card-container ${animatedCards[index] ? 'animated' : ''} ${isMobile ? 'circular-card' : ''} ${isCenter ? 'center' : ''}`}
                        style={isMobile ? cardStyle : {}}
                    >
                        <button
                            className="card-hover-area"
                            data-index={index}
                            onMouseEnter={(e) => {
                                if (!isMobile) {
                                    const card = e.currentTarget.nextElementSibling;
                                    if (card) card.classList.add('hover');
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isMobile) {
                                    const card = e.currentTarget.nextElementSibling;
                                    if (card) card.classList.remove('hover');
                                }
                            }}
                            onClick={(e) => {
                                if (!disabled) {
                                    // On both mobile and desktop, select the card
                                    onSelectCard(value);
                                    // Remove focus to prevent highlight after click
                                    e.currentTarget.blur();
                                }
                            }}
                            disabled={disabled}
                        />
                        <div
                            className={`card ${selectedCard === value ? 'selected' : ''} ${animatedCards[index] ? 'animated' : ''} ${isCenter ? 'center-highlight' : ''}`}
                            data-index={index}
                        >
                            {value}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
