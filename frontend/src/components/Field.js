import React from 'react';
import Card from './Card';

export default function Field({ field, onDrop, onDragStart, onDragEnd, onDragOver, onSell, isDropTarget = false }) {
  const handleSlotDrop = (e, index) => {
    e.preventDefault();
    if (onDrop) {
      onDrop(e, { type: 'field', index });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (onDragOver) onDragOver(e);
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ 
        color: '#e94560', 
        textTransform: 'uppercase', 
        fontSize: '14px', 
        marginBottom: '15px', 
        letterSpacing: '2px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        ⚔️ Arena de Combate <span style={{ color: '#444', fontSize: '12px' }}>(Seu Exército)</span>
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 152px)',
        justifyContent: 'center',
        gridTemplateRows: 'repeat(2, 1fr)',
        gap: '20px',
        background: 'rgba(10, 10, 10, 0.4)',
        padding: '20px',
        borderRadius: '12px',
        minHeight: '600px',
        border: '1px solid #333',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
        position: 'relative'
      }}>
        {field.map((card, index) => (
          <div
            key={index}
            onDrop={(e) => handleSlotDrop(e, index)}
            onDragOver={handleDragOver}
            style={{
              background: card ? 'transparent' : 'rgba(233, 69, 96, 0.03)',
              border: card ? 'none' : '2px dashed #222',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              width: '151px',
              height: '260px',
              transition: 'all 0.3s ease'
            }}
          >
            {card ? (
              <div 
                draggable={true} 
                onDragStart={(e) => onDragStart && onDragStart(e, { type: 'field', index })}
                onDragEnd={onDragEnd}
                onDrop={(e) => handleSlotDrop(e, index)}
                onDragOver={handleDragOver}
              >
                <Card 
                  card={card} 
                  onSell={(card) => onSell && onSell(card, true)} 
                />
              </div>
            ) : (
              <div style={{ color: '#222', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Slot Vazio
              </div>
            )}
            
            {/* Overlay de Posição */}
            <div style={{
              position: 'absolute',
              top: '5px',
              left: '5px',
              fontSize: '9px',
              color: '#333',
              fontWeight: 'bold'
            }}>
              #{index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}