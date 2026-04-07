import React from 'react';
import Card from './Card';

export default function Shop({ shopCards, onBuy, onReturnCard, gold }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const cardData = e.dataTransfer.getData('application/json');
    if (cardData && onReturnCard) {
      try {
        const card = JSON.parse(cardData);
        onReturnCard(card);
      } catch (err) {
        console.log('Erro ao processar carta devolvida');
      }
    }
  };

  const cards = shopCards || [];

  return (
    <div 
      className="shop-container" 
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        background: 'rgba(0,0,0,0.6)',
        padding: '20px',
        borderRadius: '15px',
        border: '2px solid #444',
        margin: '10px 0',
        overflow: 'visible',  // Permite que o zoom saia do container
        position: 'relative',
        zIndex: 10
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '15px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h2 style={{ color: '#ffd700', margin: 0, fontSize: 'clamp(18px, 5vw, 24px)' }}>🛒 MERCADO</h2>
        <div style={{ 
          background: '#ffd700', 
          color: '#000', 
          padding: '5px 15px', 
          borderRadius: '20px', 
          fontWeight: 'bold',
          fontSize: 'clamp(14px, 4vw, 16px)'
        }}>
          🪙 OURO: {gold !== undefined ? gold : 0}
        </div>
      </div>
      
      {/* Container do scroll com altura maior para acomodar o zoom */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',
        gap: '20px', 
        overflowX: 'auto',
        overflowY: 'visible',  // Importante: permite o zoom vertical
        padding: '60px 10px 40px 10px',  // Mais padding embaixo para o zoom
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        minHeight: '280px'  // Altura maior para o zoom
      }}>
        {cards.length === 0 ? (
          <div style={{ color: '#666', textAlign: 'center', width: '100%', padding: '20px', minWidth: '200px' }}>
            Nenhuma carta na loja no momento
          </div>
        ) : (
          cards.map((card, index) => (
            <div key={card.instanceId || index} style={{ 
              textAlign: 'center', 
              minWidth: '140px',  // Ligeiramente maior
              flexShrink: 0,
              position: 'relative',
              zIndex: 100  // Garante que o zoom fique acima
            }}>
              <Card card={card} onClick={() => onBuy && onBuy(card, index)} isShop={true} />
              <div style={{ 
                marginTop: '10px', 
                color: gold >= card.custo ? '#00ff00' : '#ff4d4d',
                fontWeight: 'bold',
                fontSize: 'clamp(12px, 3.5vw, 14px)'
              }}>
                🪙 {card.custo}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: 'clamp(10px, 3vw, 12px)', 
        color: '#888', 
        textAlign: 'center' 
      }}>
        💡 Arraste uma carta do campo para a loja para devolver e receber o reembolso
      </div>
    </div>
  );
}