import React, { useState } from 'react';

export default function Card({ card, onClick, onSell, isShop = false, isSynergyMatch = false }) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!card) return (
    <div className="card-placeholder" style={{ 
      width: '130px', height: '190px', border: '2px dashed #444', 
      borderRadius: '10px', display: 'flex', alignItems: 'center', 
      justifyContent: 'center', color: '#444', fontSize: '10px' 
    }}>Vazio</div>
  );

  // Mapeamento de Material por Custo
  const getMaterialClass = (cost) => {
    if (cost >= 8) return 'frame-diamond';
    if (cost >= 5) return 'frame-gold';
    if (cost >= 3) return 'frame-silver';
    return 'frame-bronze';
  };

  // Mapeamento de Aura por Região
  const getAuraClass = (region) => {
    if (!region) return '';
    return `aura-${region.toLowerCase()}`;
  };

  const materialClass = getMaterialClass(card.custo);
  const auraClass = getAuraClass(card.regiao);
  const isAscendido = card.isEvolved;

  return (
    <div 
      className={`dominion-card ${materialClass} ${auraClass} ${isSynergyMatch ? 'synergy-match' : ''}`}
      onClick={() => onClick && onClick(card)}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      style={{
        zIndex: isZoomed ? 1000 : 1,
        transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
        cursor: 'pointer'
      }}
    >
      <div className="card-inner-layout">
        {/* TOPO: Nome, Custo, Região */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', height: '28px' }}>
          <div className="card-title" style={{ marginTop: '2px' }}>
            {card.nome}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', top: '-4px' }}>
            <div style={{ 
              background: 'radial-gradient(circle, #ffd700 0%, #b8860b 100%)',
              width: '20px', height: '20px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #000', boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
              color: '#000', fontWeight: '900', fontSize: '11px'
            }}>
              {card.custo}
            </div>
            <div style={{ fontSize: '7px', opacity: 0.8, color: '#fff', textTransform: 'uppercase', marginTop: '1px' }}>
              {card.regiao}
            </div>
          </div>
        </div>

        {/* MEIO: Arte */}
        <div className="card-art-frame">
          <img 
            src={card.imagem.startsWith('http') ? card.imagem : `/assets/cards/${card.imagem}`} 
            alt={card.nome} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/130x100/1a1a1a/fff?text=${card.nome?.slice(0, 8)}`;
            }}
          />
          {isAscendido && (
            <div style={{
              position: 'absolute', top: '2px', left: '2px',
              background: 'rgba(185, 242, 255, 0.9)', color: '#000',
              fontSize: '7px', padding: '1px 4px', borderRadius: '3px',
              fontWeight: '900', textTransform: 'uppercase', boxShadow: '0 0 5px #000'
            }}>
              Ascendido
            </div>
          )}
        </div>

        {/* INFERIOR: Dádiva */}
        <div className="card-dadiva-box">
          <div className="card-dadiva-label">Dádiva</div>
          <div className="card-dadiva-text">
            {card.evolucao || 'Nenhuma dádiva ativa.'}
          </div>
        </div>

        {/* CANTOS: POW e GRD */}
        <div className="stats-container">
          <div className="stat-shield pow">
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>POW</span>
            <span className="stat-value">{card.atk}</span>
          </div>
          <div className="stat-shield grd">
            <span style={{ fontSize: '7px', color: 'rgba(255,255,255,0.7)', fontWeight: 'bold' }}>GRD</span>
            <span className="stat-value">{card.def}</span>
          </div>
        </div>

        {/* RODAPÉ: Classe */}
        <div className="card-footer-class">
          {card.classe}
        </div>
      </div>
    </div>
  );
}