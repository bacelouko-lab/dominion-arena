import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../lib/socket';

export default function BattleLog({ gameId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const socket = getSocket();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewLogs = (newLogs) => {
      setLogs(prev => [...prev, ...newLogs]);
    };

    socket.on('battle-logs', handleNewLogs);
    return () => socket.off('battle-logs', handleNewLogs);
  }, [socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const getLogColor = (msg) => {
    if (msg.includes('🎲')) return '#f39c12'; // Dados
    if (msg.includes('⚔️') || msg.includes('💀')) return '#e74c3c'; // Combate/Eliminação
    if (msg.includes('🛒')) return '#2ecc71'; // Compra
    if (msg.includes('✨')) return '#9b59b6'; // Evolução/Efeito Especial
    if (msg.includes('🔥')) return '#e67e22'; // Queimadura
    if (msg.includes('🛡️')) return '#3498db'; // Reflexão/Defesa
    if (msg.includes('➕') || msg.includes('🌿')) return '#27ae60'; // Cura
    return '#ecf0f1';
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          background: 'rgba(15, 15, 15, 0.9)',
          border: '2px solid #e94560',
          borderRadius: '50px',
          padding: '12px 24px',
          color: 'white',
          fontFamily: 'Cinzel, serif',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(233, 69, 96, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <span>📜 Historico</span>
        {logs.length > 0 && (
          <span style={{ 
            background: '#e94560', 
            borderRadius: '50%', 
            width: '20px', 
            height: '20px', 
            fontSize: '12px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>{logs.length}</span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(10px)'
        }} onClick={() => setIsOpen(false)}>
          <div style={{
            width: '600px',
            maxWidth: '90vw',
            height: '70vh',
            background: 'var(--card-bg, #0f0f0f)',
            border: '2px solid #e94560',
            borderRadius: '16px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 0 50px rgba(0,0,0,1)'
          }} onClick={e => e.stopPropagation()}>
            
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #333',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'rgba(233, 69, 96, 0.1)'
            }}>
              <h2 style={{ margin: 0, fontFamily: 'Cinzel, serif', color: '#e94560' }}>📜 Historico de Batalha</h2>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#888', fontSize: '24px', cursor: 'pointer' }}
              >✕</button>
            </div>

            <div 
              ref={scrollRef}
              style={{
                flex: 1,
                padding: '20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {logs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>A historia desta batalha ainda esta sendo escrita...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    borderLeft: `3px solid ${getLogColor(log)}`,
                    fontSize: '14px',
                    color: '#ddd',
                    lineHeight: '1.4'
                  }}>
                    {log}
                  </div>
                ))
              )}
            </div>

            <div style={{ padding: '15px', textAlign: 'center', borderTop: '1px solid #333' }}>
              <button 
                onClick={() => setLogs([])}
                style={{ 
                  background: 'transparent', 
                  border: '1px solid #444', 
                  padding: '5px 15px', 
                  fontSize: '12px',
                  color: '#888'
                }}
              >Limpar Historico</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
