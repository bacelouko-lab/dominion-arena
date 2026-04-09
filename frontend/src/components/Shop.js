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
        background: 'rgba(10, 10, 10, 0.9)',
        padding: '20px',
        borderRadius: '15px',
        border: '1px solid #e94560',
        boxShadow: '0 0 30px rgba(0,0,0,0.8)',
        margin: '10px 0',
        overflow: 'visible',
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(10px)'
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginBottom: '15px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <h2 style={{ color: '#e94560', margin: 0, fontSize: 'clamp(18px, 5vw, 24px)', textTransform: 'uppercase', letterSpacing: '2px' }}>🛒 Loja de Cartas</h2>
        <div style={{ 
          background: '#e94560', 
          color: '#fff', 
          padding: '5px 15px', 
          borderRadius: '4px', 
          fontWeight: 'bold',
          fontSize: 'clamp(14px, 4vw, 16px)',
          boxShadow: '0 0 10px rgba(233, 69, 96, 0.4)'
        }}>
          🪙 SEU OURO: {gold !== undefined ? gold : 0}
        </div>
      </div>
      
      {/* Container do scroll com altura maior para acomodar o zoom */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',
        gap: '20px', 
        overflowX: 'auto',
        overflowY: 'visible',
        padding: '60px 10px 40px 10px',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'thin',
        minHeight: '280px'
      }}>
        {cards.length === 0 ? (
          <div style={{ color: '#444', textAlign: 'center', width: '100%', padding: '20px', minWidth: '200px' }}>
            O mercado está vazio no momento...
          </div>
        ) : (
          cards.map((card, index) => (
            <div key={card.instanceId || index} style={{ 
              textAlign: 'center', 
              minWidth: '140px',
              flexShrink: 0,
              position: 'relative',
              zIndex: 100
            }}>
              <Card card={card} onClick={() => onBuy && onBuy(card, index)} isShop={true} />
            </div>
          ))
        )}
      </div>
      
      <div style={{ 
        marginTop: '15px', 
        fontSize: 'clamp(10px, 3vw, 11px)', 
        color: '#666', 
        textAlign: 'center',
        fontStyle: 'italic',
        borderTop: '1px solid #222',
        paddingTop: '10px'
      }}>
        💡 Dica: Arraste cartas do campo para cá para vendê-las e recuperar ouro
      </div>
    </div>
  );
}