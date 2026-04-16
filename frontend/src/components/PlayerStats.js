export default function PlayerStats({ player }) {
  if (!player) return null;

  return (
    <div className="card" style={{ background: 'rgba(20, 20, 20, 0.8)', border: '1px solid #e94560', boxShadow: '0 0 15px rgba(233, 69, 96, 0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ color: '#e94560', textTransform: 'uppercase', margin: 0 }}>{player.username}</h3>
        <div style={{ 
          background: player.timeLeft < 60 ? '#ff4d4d20' : '#ffffff10', 
          padding: '4px 10px', 
          borderRadius: '4px',
          border: `1px solid ${player.timeLeft < 60 ? '#ff4d4d' : '#444'}`,
          fontSize: '14px',
          fontFamily: 'monospace',
          color: player.timeLeft < 60 ? '#ff4d4d' : '#fff'
        }}>
          ⏱️ {Math.floor((player.timeLeft || 600) / 60)}:{(player.timeLeft || 600) % 60 < 10 ? '0' : ''}{(player.timeLeft || 600) % 60}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
        <div style={{ textAlign: 'center', background: '#000', padding: '8px', borderRadius: '8px', border: '1px solid #333' }}>
          <div style={{ fontSize: '20px', color: '#ff4d4d' }}>❤️</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{player.life}</div>
          <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Vidas</div>
        </div>
        <div style={{ textAlign: 'center', background: '#000', padding: '8px', borderRadius: '8px', border: '1px solid #333' }}>
          <div style={{ fontSize: '20px', color: '#ffcc00' }}>💰</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{player.gold}</div>
          <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Ouro</div>
        </div>
        <div style={{ textAlign: 'center', background: '#000', padding: '8px', borderRadius: '8px', border: '1px solid #333' }}>
          <div style={{ fontSize: '20px', color: '#e94560' }}>🎲</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{player.dice}</div>
          <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Dados</div>
        </div>
        <div style={{ textAlign: 'center', background: '#000', padding: '8px', borderRadius: '8px', border: '1px solid #333' }}>
          <div style={{ fontSize: '20px', color: '#b30000' }}>🏦</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{player.savedPoints || 0}</div>
          <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Cofre</div>
        </div>
      </div>
      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #333' }}>
        <p style={{ fontSize: '12px', color: '#ccc' }}>🃏 Cartas na mão: <span style={{color: '#fff'}}>{player.hand?.length || 0}/5</span></p>
        <p style={{ fontSize: '12px', color: '#ccc' }}>⚔️ No campo: <span style={{color: '#fff'}}>{player.field?.filter(c => c)?.length || 0}/6</span></p>
        
        {player.consecutiveSaves > 0 && (
          <div style={{ 
            marginTop: '10px', 
            padding: '5px 10px', 
            background: player.consecutiveSaves >= 2 ? '#ff4d4d20' : '#111',
            borderRadius: '4px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: player.consecutiveSaves >= 2 ? '1px solid #ff4d4d' : '1px solid #333'
          }}>
            <span style={{ filter: player.consecutiveSaves >= 2 ? 'none' : 'grayscale(1)' }}>🍀</span>
            {player.consecutiveSaves >= 2 
              ? <strong style={{color: '#ff4d4d'}}>Proteção Ativa! (+1 Dado)</strong>
              : <span style={{color: '#aaa'}}>Proteção contra Azar: {player.consecutiveSaves}/2</span>
            }
          </div>
        )}
      </div>
    </div>
  );
}
