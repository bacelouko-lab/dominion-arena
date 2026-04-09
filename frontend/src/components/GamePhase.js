export default function GamePhase({ phase, turn, currentPlayer }) {
  const getPhaseName = () => {
    switch (phase) {
      case 'roll': return '🎲 Fase de Rolagem';
      case 'shop_decision': return '🛒 Decisão: Loja ou Guardar?';
      case 'buy': return '🛍️ Fase de Compra';
      case 'position': return '⚔️ Posicionamento';
      case 'combat': return '💥 Combate';
      case 'end': return '🏁 Fim do Turno';
      default: return '📋 Aguardando...';
    }
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'roll': return '#e94560';
      case 'shop_decision': return '#ff4d4d';
      case 'buy': return '#e94560';
      case 'position': return '#b30000';
      case 'combat': return '#ff0000';
      default: return '#444';
    }
  };

  return (
    <div style={{
      background: 'rgba(10, 10, 10, 0.9)',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '15px',
      textAlign: 'center',
      border: '1px solid #333',
      borderBottom: `3px solid ${getPhaseColor()}`,
      boxShadow: `0 4px 15px rgba(0,0,0,0.5)`
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: getPhaseColor(), textTransform: 'uppercase', letterSpacing: '1px' }}>
        {getPhaseName()}
      </div>
      <div style={{ fontSize: '14px', color: '#fff', marginTop: '8px' }}>
        🏟️ ROUND: <span style={{color: '#e94560'}}>{turn}</span> | 👤 ATUAL: <span style={{color: '#e94560'}}>{currentPlayer || '...'}</span>
      </div>
    </div>
  );
}