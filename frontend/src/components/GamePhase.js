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
      case 'roll': return '#f39c12';
      case 'shop_decision': return '#e94560';
      case 'buy': return '#3498db';
      case 'position': return '#27ae60';
      case 'combat': return '#e94560';
      default: return '#95a5a6';
    }
  };

  return (
    <div style={{
      background: '#2a2a3e',
      padding: '15px',
      borderRadius: '8px',
      marginBottom: '15px',
      textAlign: 'center',
      borderLeft: `4px solid ${getPhaseColor()}`
    }}>
      <div style={{ fontSize: '18px', fontWeight: 'bold', color: getPhaseColor() }}>
        {getPhaseName()}
      </div>
      <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>
        Turno: {turn} | Jogador: {currentPlayer || '...'}
      </div>
    </div>
  );
}