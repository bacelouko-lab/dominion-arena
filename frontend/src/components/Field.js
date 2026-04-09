import React from 'react';
import Card from './Card';

export default function Field({ field, gameId, onDrop, onDragOver, isDropTarget = false }) {
  const handleDrop = (e, position) => {
    e.preventDefault();
    if (onDrop && isDropTarget) {
      onDrop(e, position);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (onDragOver) {
      onDragOver(e);
    }
  };

  const handleDragStart = (e, card, position) => {
    if (card && !isDropTarget) {
      e.dataTransfer.setData('application/json', JSON.stringify({
        ...card,
        fieldPosition: position,
        type: 'field'
      }));
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ color: '#fff', textTransform: 'uppercase', fontSize: '14px', marginBottom: '15px', letterSpacing: '1px' }}>⚔️ Arena de Combate</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: '20px',
        borderRadius: '12px',
        minHeight: '220px',
        border: '1px solid #222',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'
      }}>
        {field.map((card, index) => (
          <div
            key={index}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
            draggable={!!card && !isDropTarget}
            onDragStart={(e) => handleDragStart(e, card, index)}
            style={{
              backgroundColor: card ? '#111' : (isDropTarget ? 'rgba(233, 69, 96, 0.05)' : 'rgba(10,10,10,0.3)'),
              border: card ? (card.isEvolved ? '2px solid #ff4d4d' : '1px solid #e94560') : (isDropTarget ? '2px dashed #e94560' : '1px solid #222'),
              borderRadius: '12px',
              padding: '12px',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: isDropTarget ? 'pointer' : (card ? 'grab' : 'default'),
              transition: 'all 0.2s',
              boxShadow: card ? '0 4px 10px rgba(0,0,0,0.5)' : 'none'
            }}
          >
            {card ? (
              <>
                <div style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'center', color: '#e94560', marginBottom: '8px', width: '100%', borderBottom: '1px solid #333', paddingBottom: '5px', textTransform: 'uppercase' }}>
                  {card.nome?.length > 15 ? card.nome?.slice(0, 15) + '...' : card.nome}
                  {card.isEvolved && <span style={{ fontSize: '10px', marginLeft: '5px', color: '#ffcc00' }}>✨</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '8px', fontSize: '12px', color: '#fff' }}>
                  <span>⚔️ <strong>{card.atk}</strong></span>
                  <span>🛡️ <strong>{card.def}</strong></span>
                </div>
                <div style={{ fontSize: '9px', textAlign: 'center', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
                  {card.classe} • {card.regiao}
                </div>
                <div style={{ fontSize: '9px', color: card.isEvolved ? '#ffcc00' : '#aaa', textAlign: 'center', borderTop: '1px solid #222', paddingTop: '6px', width: '100%', lineHeight: '1.2', fontStyle: card.isEvolved ? 'normal' : 'italic' }}>
                  {card.isEvolved 
                    ? `🏆 ${card.evolucao?.slice(0, 35)}${card.evolucao?.length > 35 ? '...' : ''}` 
                    : card.evolucao?.slice(0, 25) || '—'}
                </div>
                {!isDropTarget && (
                  <div style={{ fontSize: '8px', color: '#444', marginTop: '5px', textAlign: 'center' }}>
                    🖱️ Arraste para devolver
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: '12px', color: isDropTarget ? '#e94560' : '#333', textAlign: 'center', fontWeight: isDropTarget ? 'bold' : 'normal' }}>
                {isDropTarget ? 'SOLTE AQUI' : 'VAZIO'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}