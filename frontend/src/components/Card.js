import React, { useState } from 'react';

export default function Card({ card, onClick, isShop = false }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!card) return <div className="card-placeholder" style={{ 
    width: '120px', height: '170px', border: '2px dashed #444', 
    borderRadius: '10px', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', color: '#444' 
  }}>Vazio</div>;

  return (
    <>
      {/* Carta normal */}
      <div 
        className={`dominion-card ${card.regiao.toLowerCase()}`}
        onClick={() => onClick && onClick(card)}
        onMouseEnter={() => {
          setIsZoomed(true);
          setShowTooltip(true);
        }}
        onMouseLeave={() => {
          setIsZoomed(false);
          setShowTooltip(false);
        }}
        style={{
          position: 'relative',
          cursor: 'pointer',
          width: '130px',
          height: '190px',
          borderRadius: '8px',
          overflow: 'visible',
          transition: 'transform 0.2s ease-in-out, z-index 0.2s',
          zIndex: isZoomed ? 1000 : 1,
          transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
          boxShadow: isZoomed ? '0 10px 40px rgba(0,0,0,0.8)' : 'none'
        }}
      >
        <img 
          src={`/Uploads/${card.imagem}`} 
          alt={card.nome} 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain', 
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
            border: card.isEvolved ? '2px solid #ff4d4d' : '1px solid #333'
          }} 
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/130x190/000000/e94560?text=${card.nome?.slice(0, 10)}`;
          }}
        />

        {/* Tooltip com informações da carta */}
        {showTooltip && (
          <div className="card-evolution-tooltip" style={{
            position: 'absolute',
            bottom: '105%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            background: 'rgba(10, 10, 10, 0.95)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            border: '2px solid #e94560',
            boxShadow: '0 10px 30px rgba(0,0,0,1)',
            pointerEvents: 'none',
            zIndex: 1001,
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ color: '#e94560', fontWeight: 'bold', borderBottom: '1px solid #333', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              ⚔️ {card.nome}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>⚔️ <span style={{color: '#ff4d4d'}}>{card.atk}</span></span>
              <span>🛡️ <span style={{color: '#fff'}}>{card.def}</span></span>
              <span>💰 <span style={{color: '#ffcc00'}}>{card.custo}</span></span>
            </div>
            <div style={{ fontSize: '11px', color: '#aaa', borderTop: '1px solid #333', paddingTop: '8px' }}>
              <span style={{color: '#e94560'}}>Habilidade:</span> {card.evolucao || 'Nenhuma habilidade passiva'}
            </div>
            <div style={{ marginTop: '5px', fontSize: '10px', color: '#666' }}>
              {card.regiao} • {card.classe}
            </div>
          </div>
        )}

        <div style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          background: '#ffcc00',
          color: '#000',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '12px',
          border: '1px solid #000',
          boxShadow: '0 0 10px rgba(255, 204, 0, 0.3)'
        }}>
          {card.custo}
        </div>
      </div>
    </>
  );
}