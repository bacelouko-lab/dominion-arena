import React from 'react';
import Card from './Card';

export default function Hand({ hand, onDragStart, onDragEnd, onDrop, onSell }) {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleContainerDrop = (e) => {
    e.preventDefault();
    if (onDrop) {
      onDrop(e, { type: 'hand', index: hand.length });
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDrop={handleContainerDrop}
      style={{
        width: '100%',
        padding: '20px',
        background: 'rgba(10, 10, 10, 0.8)',
        border: '1px solid #333',
        borderRadius: '12px',
        minHeight: '340px',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        transition: 'background 0.3s'
      }}
    >
      <h3 style={{ 
        margin: 0, 
        color: '#e94560', 
        fontSize: '14px', 
        textTransform: 'uppercase', 
        letterSpacing: '2px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        🎴 Sua Mão <span style={{ color: '#444', fontSize: '12px' }}>({hand.length}/7)</span>
      </h3>

      <div style={{
        display: 'flex',
        gap: '15px',
        paddingBottom: '10px'
      }}>
        {hand.length === 0 ? (
          <div style={{ color: '#444', padding: '40px', textAlign: 'center', width: '100%', fontStyle: 'italic' }}>
            Sua mão está vazia. Role os dados e visite a loja!
          </div>
        ) : (
          hand.map((card, index) => (
            <div 
              key={card.instanceId || index}
              draggable={true}
              onDragStart={(e) => onDragStart && onDragStart(e, { type: 'hand', index })}
              onDragEnd={onDragEnd}
            >
              <Card 
                card={card} 
                onSell={(card) => onSell && onSell(card, false)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}