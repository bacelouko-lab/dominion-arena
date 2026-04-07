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
      <h3>⚔️ Campo de Batalha (6 posições)</h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '15px',
        backgroundColor: '#1a1a2e',
        padding: '20px',
        borderRadius: '12px',
        minHeight: '220px'
      }}>
        {field.map((card, index) => (
          <div
            key={index}
            onDrop={(e) => handleDrop(e, index)}
            onDragOver={handleDragOver}
            draggable={!!card && !isDropTarget}
            onDragStart={(e) => handleDragStart(e, card, index)}
            style={{
              backgroundColor: card ? (card.isEvolved ? '#2a1a3e' : '#2a2a3e') : (isDropTarget ? '#2a2a3e' : '#1a1a2e'),
              border: card ? (card.isEvolved ? '3px solid #f39c12' : '2px solid #e94560') : (isDropTarget ? '2px dashed #f39c12' : '1px solid #333'),
              borderRadius: '12px',
              padding: '12px',
              minHeight: '180px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: isDropTarget ? 'pointer' : (card ? 'grab' : 'default'),
              transition: 'all 0.2s'
            }}
          >
            {card ? (
              <>
                <div style={{ fontWeight: 'bold', fontSize: '12px', textAlign: 'center', color: '#f39c12', marginBottom: '8px', width: '100%', borderBottom: '1px solid #e94560', paddingBottom: '5px' }}>
                  {card.nome?.length > 15 ? card.nome?.slice(0, 15) + '...' : card.nome}
                  {card.isEvolved && <span style={{ fontSize: '10px', marginLeft: '5px' }}>✨</span>}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '8px', fontSize: '12px' }}>
                  <span>⚔️ <strong>{card.atk}</strong></span>
                  <span>🛡️ <strong>{card.def}</strong></span>
                  <span>💰 <strong>{card.custo}</strong></span>
                </div>
                <div style={{ fontSize: '9px', textAlign: 'center', color: '#aaa', marginBottom: '8px' }}>
                  {card.classe} • {card.regiao}
                </div>
                <div style={{ fontSize: '9px', color: card.isEvolved ? '#f39c12' : '#666', textAlign: 'center', borderTop: '1px solid #333', paddingTop: '6px', width: '100%', lineHeight: '1.2' }}>
                  {card.isEvolved 
                    ? `✨ ${card.evolucao?.slice(0, 35)}${card.evolucao?.length > 35 ? '...' : ''} ✨` 
                    : card.evolucao?.slice(0, 25) || '—'}
                </div>
                {!isDropTarget && (
                  <div style={{ fontSize: '8px', color: '#888', marginTop: '5px', textAlign: 'center' }}>
                    🖱️ Arraste para devolver
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: '12px', color: '#555', textAlign: 'center' }}>
                {isDropTarget ? '⬅️ Arraste aqui' : 'Vazio'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}