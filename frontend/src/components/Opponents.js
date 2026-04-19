import { useState } from 'react';
import { getSocket } from '../lib/socket';

export default function Opponents({ opponents, currentUsername, gameId }) {
  const [selectedOpponent, setSelectedOpponent] = useState(null);
  const [showBoard, setShowBoard] = useState(false);

  const viewOpponentBoard = (opponent) => {
    setSelectedOpponent(opponent);
    setShowBoard(true);
  };

  const closeModal = () => {
    setShowBoard(false);
    setSelectedOpponent(null);
  };

  if (!opponents || opponents.length === 0) {
    return <p style={{ textAlign: 'center', color: '#aaa' }}>Aguardando oponentes...</p>;
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {opponents.map((opponent, idx) => (
          <div
            key={idx}
            onClick={() => viewOpponentBoard(opponent)}
            style={{
              background: opponent.life <= 0 ? 'rgba(30, 30, 30, 0.8)' : 'rgba(15, 15, 15, 0.9)',
              border: opponent.life <= 0 ? '2px solid #555' : '2px solid #e94560',
              borderRadius: '8px',
              padding: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              position: 'relative',
              boxShadow: opponent.life <= 0 ? 'none' : '0 0 10px rgba(233, 69, 96, 0.1)',
              filter: opponent.life <= 0 ? 'grayscale(100%) opacity(0.7)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (opponent.life <= 0) return;
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(233, 69, 96, 0.4)';
              e.currentTarget.style.borderColor = '#ff4d4d';
            }}
            onMouseLeave={(e) => {
              if (opponent.life <= 0) return;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 10px rgba(233, 69, 96, 0.1)';
              e.currentTarget.style.borderColor = '#e94560';
            }}
          >
            {opponent.life <= 0 && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                background: '#333',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '18px',
                border: '2px solid #555',
                zIndex: 10
              }}>
                💀
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: opponent.life <= 0 ? '#888' : '#e94560', textTransform: 'uppercase', fontSize: '16px' }}>
                  {opponent.username}
                </h3>
                <div style={{ fontSize: '14px', color: opponent.life <= 0 ? '#666' : '#fff', marginTop: '5px' }}>
                  {opponent.life <= 0 ? '💀 ELIMINADO' : `❤️ Vida: ${opponent.life}`}
                </div>
                <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>
                  🃏 Campo: {opponent.field?.filter(c => c !== null).length || 0}/6
                </div>
                {opponent.consecutiveSaves >= 2 && (
                  <div style={{ fontSize: '11px', color: '#ff4d4d', marginTop: '5px', fontWeight: 'bold' }}>
                    🍀 Proteção Ativa!
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  background: opponent.timeLeft < 60 ? '#ff4d4d20' : '#ffffff10', 
                  padding: '2px 8px', 
                  borderRadius: '4px',
                  border: `1px solid ${opponent.timeLeft < 60 ? '#ff4d4d' : '#444'}`,
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: opponent.timeLeft < 60 ? '#ff4d4d' : '#fff',
                  marginBottom: '5px'
                }}>
                  ⏱️ {Math.floor((opponent.timeLeft || 600) / 60)}:{(opponent.timeLeft || 600) % 60 < 10 ? '0' : ''}{(opponent.timeLeft || 600) % 60}
                </div>
                <div style={{ fontSize: '24px', opacity: 0.7 }}>👁️</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para visualizar o board do oponente */}
      {showBoard && selectedOpponent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(8px)'
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'rgba(10, 10, 10, 0.95)',
              border: '2px solid #e94560',
              borderRadius: '16px',
              padding: '25px',
              maxWidth: '90vw',
              maxHeight: '85vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 0 50px rgba(0,0,0,1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '15px',
                background: '#e94560',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#e94560', textTransform: 'uppercase' }}>
              ⚔️ {selectedOpponent.username}
            </h2>

            {/* Status do oponente */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '10px',
              marginBottom: '20px',
              padding: '15px',
              background: '#000',
              border: '1px solid #333',
              borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#e94560' }}>⏱️</div>
                <div style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>
                  {Math.floor((selectedOpponent.timeLeft || 600) / 60)}:{(selectedOpponent.timeLeft || 600) % 60 < 10 ? '0' : ''}{(selectedOpponent.timeLeft || 600) % 60}
                </div>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Tempo Restante</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#ff4d4d' }}>❤️</div>
                <div style={{ fontWeight: 'bold' }}>{selectedOpponent.life}</div>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Energia Vital</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#fff' }}>🃏</div>
                <div style={{ fontWeight: 'bold' }}>{selectedOpponent.field?.filter(c => c !== null).length || 0}/6</div>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Campo</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#ffcc00' }}>💰</div>
                <div style={{ fontWeight: 'bold' }}>{selectedOpponent.gold || 0}</div>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Ouro</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: '#b30000' }}>🏦</div>
                <div style={{ fontWeight: 'bold' }}>{selectedOpponent.savedPoints || 0}</div>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Cofre</div>
              </div>
            </div>

            {selectedOpponent.consecutiveSaves > 0 && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '10px', 
                background: selectedOpponent.consecutiveSaves >= 2 ? '#ff4d4d20' : '#111',
                borderRadius: '8px',
                textAlign: 'center',
                border: selectedOpponent.consecutiveSaves >= 2 ? '1px solid #ff4d4d' : '1px solid #333'
              }}>
                <span style={{ marginRight: '10px' }}>🍀</span>
                {selectedOpponent.consecutiveSaves >= 2 
                  ? <span style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Proteção Ativa!</span>
                  : <span style={{ color: '#aaa' }}>Azar: {selectedOpponent.consecutiveSaves}/2</span>
                }
              </div>
            )}

            {/* Campo de batalha do oponente */}
            <h3 style={{ marginBottom: '15px', color: '#e94560', textTransform: 'uppercase', fontSize: '14px' }}>⚔️ Arena de Combate</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              gap: '10px',
              marginBottom: '20px'
            }}>
              {selectedOpponent.field?.map((card, idx) => (
                <div
                  key={idx}
                  style={{
                    background: card ? '#111' : 'rgba(0,0,0,0.3)',
                    border: card ? '1px solid #e94560' : '1px dashed #333',
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center',
                    minHeight: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    boxShadow: card ? '0 0 10px rgba(233,69,96,0.2)' : 'none'
                  }}
                >
                  {card ? (
                    <>
                      <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#e94560' }}>
                        {card.nome?.slice(0, 15)}
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '5px', color: '#fff' }}>
                        P <span style={{color: '#ff4d4d'}}>{card.pow}</span> G <span style={{color: '#3498db'}}>{card.grd}</span>
                      </div>
                      {card.isEvolved && (
                        <div style={{ fontSize: '10px', color: 'var(--accent-color)', marginTop: '3px', fontWeight: 'bold' }}>
                          ✨ ASCENDIDO
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#444' }}>Vazio</div>
                  )}
                </div>
              ))}
            </div>

            {/* Mão do oponente */}
            <h3 style={{ marginBottom: '10px', color: '#fff', fontSize: '14px' }}>🃏 Recursos</h3>
            <div style={{
              padding: '10px',
              background: '#111',
              border: '1px solid #333',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px' }}>🃏 x {selectedOpponent.hand?.length || 0}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Cartas na mão</div>
            </div>

            {/* Sinergias */}
            {selectedOpponent.synergies && (
              <>
                <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#e94560', fontSize: '14px' }}>🔗 Sinergias Dominadas</h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  padding: '10px',
                  background: '#000',
                  border: '1px solid #222',
                  borderRadius: '8px'
                }}>
                  {Object.entries(selectedOpponent.synergies.regions || {}).map(([region, count]) => (
                    count >= 2 && (
                      <span key={region} style={{
                        background: '#e94560',
                        color: '#fff',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        border: '1px solid #ff4d4d'
                      }}>
                        🗺️ {region} x{count}
                      </span>
                    )
                  ))}
                  {Object.entries(selectedOpponent.synergies.classes || {}).map(([classe, count]) => (
                    count >= 2 && (
                      <span key={classe} style={{
                        background: '#333',
                        color: '#ffcc00',
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        border: '1px solid #444'
                      }}>
                        ⚔️ {classe} x{count}
                      </span>
                    )
                  ))}
                </div>
              </>
            )}

            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button
                onClick={closeModal}
                style={{
                  background: '#e94560',
                  border: 'none',
                  padding: '10px 30px',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}