import React from 'react';
import Card from './Card';

export default function Hand({ hand, gameId, isDraggable = false, onDragStart, onPlay }) {
  const handleDragStart = (e, index) => {
    if (isDraggable && onDragStart) {
      onDragStart(e, index);
    }
  };

  const handleClick = (card, index) => {
    if (onPlay) {
      onPlay(card, index);
    }
  };

  if (!hand || hand.length === 0) {
    return (
      <div style={{ marginTop: '20px' }}>
        <h3>🃏 Mão (0/7)</h3>
        <div style={{
          backgroundColor: '#1a1a2e',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          color: '#555'
        }}>
          Nenhuma carta na mão
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px' }}>
      <h3>🃏 Mão ({hand.length}/7)</h3>
      <div style={{
        display: 'flex',
        gap: '15px',
        overflowX: 'auto',
        padding: '15px',
        backgroundColor: '#1a1a2e',
        borderRadius: '8px',
        minHeight: '220px'
      }}>
        {hand.map((card, index) => (
          <div
            key={card.instanceId || index}
            draggable={isDraggable}
            onDragStart={(e) => handleDragStart(e, index)}
            onClick={() => handleClick(card, index)}
            style={{
              backgroundColor: card.isEvolved ? '#2a1a3e' : '#2a2a3e',
              border: card.isEvolved ? '3px solid #f39c12' : '2px solid #e94560',
              borderRadius: '12px',
              padding: '12px',
              minWidth: '160px',
              maxWidth: '180px',
              cursor: isDraggable ? 'grab' : 'pointer',
              transition: 'all 0.2s',
              position: 'relative'
            }}
          >
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '14px', 
              textAlign: 'center', 
              color: '#f39c12', 
              marginBottom: '8px', 
              borderBottom: '1px solid #e94560', 
              paddingBottom: '5px'
            }}>
              {card.nome?.length > 20 ? card.nome?.slice(0, 20) + '...' : card.nome}
              {card.isEvolved && <span style={{ fontSize: '10px', marginLeft: '5px' }}>✨</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span>⚔️ <strong>{card.atk}</strong></span>
              <span>🛡️ <strong>{card.def}</strong></span>
              <span>💰 <strong>{card.custo}</strong></span>
            </div>
            <div style={{ fontSize: '10px', textAlign: 'center', color: '#aaa', marginBottom: '8px' }}>
              {card.classe} • {card.regiao}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: card.isEvolved ? '#f39c12' : '#888', 
              textAlign: 'center', 
              borderTop: '1px solid #333', 
              paddingTop: '8px', 
              marginTop: '5px', 
              lineHeight: '1.3'
            }}>
              {card.isEvolved 
                ? `✨ ${card.evolucao?.slice(0, 40) || 'Habilidade ativada'} ✨` 
                : card.evolucao?.slice(0, 40) || 'Sem habilidade'}
            </div>
            {isDraggable && (
              <div style={{ fontSize: '9px', color: '#888', marginTop: '8px', textAlign: 'center' }}>
                🖱️ Arraste para o campo
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}