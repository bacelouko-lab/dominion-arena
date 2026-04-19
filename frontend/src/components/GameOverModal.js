import React, { useEffect, useState } from 'react';

const GameOverModal = ({ ranking, eloChanges, myPlayerId, onBackToMenu }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Pequeno delay para transição suave
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!ranking || ranking.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.92)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.6s ease-out',
      backdropFilter: 'blur(10px)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '550px',
        width: '100%',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(233, 69, 96, 0.4)',
        boxShadow: '0 0 50px rgba(233, 69, 96, 0.3)',
        padding: '40px',
        textAlign: 'center',
        transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        {/* Header Vitória/Fim de Jogo */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '64px', marginBottom: '10px' }}>🏆</div>
          <h1 style={{ 
            fontSize: '32px', 
            margin: 0, 
            color: '#fff', 
            textTransform: 'uppercase', 
            letterSpacing: '4px',
            textShadow: '0 0 20px rgba(255,255,255,0.3)'
          }}>
            Fim de Batalha
          </h1>
          <p style={{ color: '#888', marginTop: '5px' }}>O destino da arena foi selado</p>
        </div>

        {/* Lista de Ranking */}
        <div style={{ 
          background: 'rgba(0,0,0,0.3)', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          marginBottom: '30px',
          border: '1px solid rgba(255,255,255,0.05)'
        }}>
          {ranking.map((player, index) => {
            const isMe = player.playerId === myPlayerId;
            const eloData = eloChanges[player.playerId] || { gain: 0, newElo: 1200 };
            const isWinner = index === 0;

            return (
              <div key={player.playerId} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '15px 25px',
                borderBottom: index === ranking.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.05)',
                background: isMe ? 'rgba(233, 69, 96, 0.15)' : 'transparent',
                position: 'relative'
              }}>
                {/* Posição */}
                <div style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  background: isWinner ? '#f39c12' : '#333',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  marginRight: '20px',
                  boxShadow: isWinner ? '0 0 15px rgba(243, 156, 18, 0.5)' : 'none',
                  color: isWinner ? '#000' : '#fff'
                }}>
                  {player.rank || index + 1}º
                </div>

                {/* Nome do Jogador */}
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 'bold', color: isMe ? '#e94560' : '#fff', fontSize: '18px' }}>
                    {player.username} {isMe && <span style={{ fontSize: '12px', opacity: 0.7 }}>(Você)</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Elo Final: {eloData.newElo}</div>
                </div>

                {/* PDL Ganho/Perdido */}
                <div style={{ 
                  textAlign: 'right', 
                  fontWeight: 'bold', 
                  color: eloData.gain >= 0 ? '#27ae60' : '#e94560',
                  fontSize: '18px',
                  fontFamily: 'monospace'
                }}>
                  {eloData.gain >= 0 ? `+${eloData.gain}` : eloData.gain} PDL
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão de Retorno */}
        <button
          onClick={onBackToMenu}
          style={{
            width: '100%',
            padding: '18px',
            borderRadius: '12px',
            border: 'none',
            background: 'linear-gradient(90deg, #e94560, #b30000)',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Retornar ao Salão
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
