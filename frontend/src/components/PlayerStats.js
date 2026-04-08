export default function PlayerStats({ player }) {
  if (!player) return null;

  return (
    <div className="card">
      <h3>{player.username}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', color: '#e74c3c' }}>❤️</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{player.life}</div>
          <div style={{ fontSize: '12px', color: '#95a5a6' }}>Vidas</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', color: '#f39c12' }}>💰</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{player.gold}</div>
          <div style={{ fontSize: '12px', color: '#95a5a6' }}>Ouro</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', color: '#3498db' }}>🎲</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{player.dice}</div>
          <div style={{ fontSize: '12px', color: '#95a5a6' }}>Dados</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', color: '#9b59b6' }}>🏦</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{player.savedPoints || 0}</div>
          <div style={{ fontSize: '12px', color: '#95a5a6' }}>Cofre</div>
        </div>
      </div>
      <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #34495e' }}>
        <p style={{ fontSize: '12px' }}>Cartas na mão: {player.hand?.length || 0}/5</p>
        <p style={{ fontSize: '12px' }}>Cartas no campo: {player.field?.filter(c => c)?.length || 0}/6</p>
      </div>
    </div>
  );
}
