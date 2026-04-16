import React, { useEffect, useState } from 'react';

export default function TimerHeader({ players, currentPlayerId, myPlayerId }) {
  const [localTimes, setLocalTimes] = useState({});

  // Sincronizar com os tempos do servidor quando eles mudam
  useEffect(() => {
    const times = {};
    players.forEach(p => {
      times[p.playerId] = p.timeLeft || 600;
    });
    setLocalTimes(times);
  }, [players]);

  // Efeito de "ticking" local para suavidade (opcional se o server já manda a cada 1s)
  // Mas vamos usar os dados que vem do prop para garantir autoridade
  
  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return "10:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const currentPlayer = players.find(p => p.playerId === currentPlayerId);
  const isMyTurn = currentPlayerId === myPlayerId;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '50px',
      background: 'linear-gradient(90deg, #0f0c29, #302b63, #24243e)',
      borderBottom: '2px solid #e94560',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.5)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ 
          color: '#e94560', 
          fontWeight: 'bold', 
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          ⏱️ Chess Timer
        </div>
      </div>

      {currentPlayer && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          background: isMyTurn ? 'rgba(233, 69, 96, 0.2)' : 'rgba(255, 255, 255, 0.1)',
          padding: '5px 20px',
          borderRadius: '20px',
          border: isMyTurn ? '1px solid #e94560' : '1px solid #444',
          transition: 'all 0.3s ease'
        }}>
          <span style={{ fontSize: '12px', color: '#ccc' }}>Vez de:</span>
          <strong style={{ color: isMyTurn ? '#e94560' : '#fff' }}>{currentPlayer.username}</strong>
          <span style={{ 
            fontSize: '18px', 
            fontFamily: 'monospace', 
            fontWeight: 'bold',
            color: (currentPlayer.timeLeft < 60) ? '#ff4d4d' : '#fff',
            textShadow: (currentPlayer.timeLeft < 30) ? '0 0 10px #ff4d4d' : 'none',
            animation: (currentPlayer.timeLeft < 30) ? 'pulse 1s infinite' : 'none'
          }}>
            {formatTime(currentPlayer.timeLeft)}
          </span>
        </div>
      )}

      <div style={{ fontSize: '12px', color: '#888' }}>
        Bônus: +5s/turno
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
