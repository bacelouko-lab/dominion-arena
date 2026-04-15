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
      className={`dominion-card ${materialClass} ${auraClass} ${isSynergyMatch ? 'synergy-match' : ''} ${isAscendido ? 'is-evolved' : ''}`}
      onClick={() => onClick && onClick(card)}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      style={{
        zIndex: isZoomed ? 1000 : 1,
        cursor: 'pointer',
        pointerEvents: 'auto',
        transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        transform: isZoomed ? 'scale(1.4) translateY(-20px)' : 'scale(1)'
      }}
    >
      <div className="card-inner-layout" style={{ pointerEvents: 'none', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* TOPO: Nome e Custo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '24px', padding: '0 2px' }}>
          <div className="card-title" style={{ flex: 1, marginRight: '8px' }}>
            {card.nome}
          </div>
          <div className="card-cost-badge" style={{ flexShrink: 0 }}>
            {card.custo}
          </div>
        </div>

        {/* MEIO: Arte */}
        <div className="card-art-frame">
          <img 
            src={card.imagem.startsWith('http') ? card.imagem : `/assets/cards/${card.imagem}`} 
            alt={card.nome} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            onError={(e) => {
              e.target.src = `https://via.placeholder.com/150x110/1a1a1a/fff?text=${card.nome?.slice(0, 8)}`;
            }}
          />
          {isAscendido && (
            <div style={{
              position: 'absolute', top: '4px', left: '4px',
              background: 'linear-gradient(45deg, #b9f2ff, #fff)', color: '#000',
              fontSize: '8px', padding: '2px 6px', borderRadius: '12px',
              fontWeight: '900', textTransform: 'uppercase', boxShadow: '0 0 10px rgba(185,242,255,1)',
              border: '1px solid #000'
            }}>
              ✨ Ascendido
            </div>
          )}
          <div style={{
            position: 'absolute', top: '2px', right: '4px',
            fontSize: '7px', color: 'rgba(255, 215, 0, 0.8)', textTransform: 'uppercase',
            fontWeight: 'bold', textShadow: '0 1px 2px #000', zIndex: 5
          }}>
            {card.regiao}
          </div>
        </div>

        {/* MEDALHÕES DE STATUS (DISCRETOS) */}
        <div className="stats-container">
          <div className="stat-shield pow">
            <span style={{ fontSize: '4.5px', color: '#ff4d4d', fontWeight: 'bold', marginBottom: '-2px' }}>POW</span>
            <span className="stat-value">{card.atk}</span>
          </div>
          <div className="stat-shield grd">
            <span style={{ fontSize: '4.5px', color: '#4d94ff', fontWeight: 'bold', marginBottom: '-2px' }}>GRD</span>
            <span className="stat-value">{card.def}</span>
          </div>
        </div>

        {/* INFERIOR: Dádiva */}
        <div className="card-dadiva-box">
          <div className="card-dadiva-label">Dádiva</div>
          <div className="card-dadiva-text">
            {card.evolucao || 'Nenhuma dádiva ativa.'}
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