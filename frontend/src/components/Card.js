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
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
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
          boxShadow: isZoomed ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
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
            boxShadow: '0 4px 8px rgba(0,0,0,0.5)'
          }} 
          onError={(e) => {
            e.target.src = `https://via.placeholder.com/130x190?text=${card.nome?.slice(0, 10)}`;
          }}
        />

        {/* Tooltip com informações da carta */}
        {showTooltip && (
          <div className="card-evolution-tooltip" style={{
            position: 'absolute',
            bottom: '105%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '220px',
            background: 'rgba(15, 15, 35, 0.95)',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            border: '2px solid #ffd700',
            boxShadow: '0 10px 20px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            zIndex: 1001
          }}>
            <div style={{ color: '#ffd700', fontWeight: 'bold', borderBottom: '1px solid #444', marginBottom: '8px' }}>
              ✨ INFORMAÇÕES
            </div>
            <p style={{ margin: 0, lineHeight: '1.4' }}>
              <strong>{card.nome}</strong><br />
              ⚔️ ATK: {card.atk} | 🛡️ DEF: {card.def}<br />
              💰 Custo: {card.custo}<br />
              📍 {card.regiao} • {card.classe}
            </p>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#aaa', fontStyle: 'italic' }}>
              {card.evolucao || 'Sem habilidade especial'}
            </div>
          </div>
        )}

        <div style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          background: '#ffd700',
          color: '#000',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '12px',
          border: '1px solid #000'
        }}>
          {card.custo}
        </div>
      </div>
    </>
  );
}