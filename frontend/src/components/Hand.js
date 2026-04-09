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
      <h3 style={{ color: '#fff', textTransform: 'uppercase', fontSize: '14px', marginBottom: '15px', letterSpacing: '1px' }}>🃏 Suas Cartas</h3>
      <div style={{
        display: 'flex',
        gap: '15px',
        overflowX: 'auto',
        padding: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '8px',
        minHeight: '220px',
        border: '1px solid #222'
      }}>
        {hand.map((card, index) => (
          <div
            key={card.instanceId || index}
            draggable={isDraggable}
            onDragStart={(e) => handleDragStart(e, index)}
            onClick={() => handleClick(card, index)}
            style={{
              backgroundColor: '#111',
              border: card.isEvolved ? '2px solid #ff4d4d' : '1px solid #e94560',
              borderRadius: '12px',
              padding: '12px',
              minWidth: '160px',
              maxWidth: '180px',
              cursor: isDraggable ? 'grab' : 'pointer',
              transition: 'all 0.2s',
              position: 'relative',
              boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
            }}
          >
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '14px', 
              textAlign: 'center', 
              color: '#e94560', 
              marginBottom: '8px', 
              borderBottom: '1px solid #333', 
              paddingBottom: '5px',
              textTransform: 'uppercase'
            }}>
              {card.nome?.length > 20 ? card.nome?.slice(0, 20) + '...' : card.nome}
              {card.isEvolved && <span style={{ fontSize: '10px', marginLeft: '5px', color: '#ffcc00' }}>✨</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#fff' }}>
              <span>⚔️ <strong>{card.atk}</strong></span>
              <span>🛡️ <strong>{card.def}</strong></span>
              <span>💰 <strong style={{color: '#ffcc00'}}>{card.custo}</strong></span>
            </div>
            <div style={{ fontSize: '10px', textAlign: 'center', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
              {card.classe} • {card.regiao}
            </div>
            <div style={{ 
              fontSize: '10px', 
              color: card.isEvolved ? '#ffcc00' : '#aaa', 
              textAlign: 'center', 
              borderTop: '1px solid #222', 
              paddingTop: '8px', 
              marginTop: '5px', 
              lineHeight: '1.3'
            }}>
              {card.isEvolved 
                ? `🏆 ${card.evolucao?.slice(0, 40) || 'Habilidade de ELITE'} 🏆` 
                : card.evolucao?.slice(0, 40) || 'Sem habilidade'}
            </div>
            {isDraggable && (
              <div style={{ fontSize: '9px', color: '#666', marginTop: '8px', textAlign: 'center', fontStyle: 'italic' }}>
                🖱️ Arraste para o campo
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}