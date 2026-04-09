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
              background: 'linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%)',
              border: '2px solid #e94560',
              borderRadius: '8px',
              padding: '15px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(233, 69, 96, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#f39c12' }}>{opponent.username}</h3>
                <div style={{ fontSize: '14px', color: '#aaa', marginTop: '5px' }}>
                  ❤️ Vida: {opponent.life}
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                  🃏 Cartas no campo: {opponent.field?.filter(c => c !== null).length || 0}/6
                </div>
                {opponent.consecutiveSaves >= 2 && (
                  <div style={{ fontSize: '12px', color: '#2ecc71', marginTop: '5px', fontWeight: 'bold' }}>
                    🍀 Proteção Ativa!
                  </div>
                )}
              </div>
              <div style={{ fontSize: '24px' }}>👁️</div>
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
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(5px)'
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '3px solid #f39c12',
              borderRadius: '16px',
              padding: '25px',
              maxWidth: '90vw',
              maxHeight: '85vh',
              overflowY: 'auto',
              position: 'relative'
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

            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#f39c12' }}>
              🎮 {selectedOpponent.username}
            </h2>

            {/* Status do oponente */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              marginBottom: '20px',
              padding: '15px',
              background: '#2a2a3e',
              borderRadius: '8px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px' }}>❤️</div>
                <div style={{ fontWeight: 'bold' }}>{selectedOpponent.life}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>Vida</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px' }}>🃏</div>
                <div style={{ fontWeight: 'bold' }}>{selectedOpponent.field?.filter(c => c !== null).length || 0}/6</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>Cartas em Campo</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px' }}>💰</div>
                <div style={{ fontWeight: 'bold' }}>{selectedOpponent.gold || 0}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>Ouro Livre</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px' }}>🏦</div>
                <div style={{ fontWeight: 'bold' }}>{selectedOpponent.savedPoints || 0}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>Cofre</div>
              </div>
            </div>

            {selectedOpponent.consecutiveSaves > 0 && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '10px', 
                background: selectedOpponent.consecutiveSaves >= 2 ? '#2ecc7133' : '#2a2a3e',
                borderRadius: '8px',
                textAlign: 'center',
                border: selectedOpponent.consecutiveSaves >= 2 ? '1px solid #2ecc71' : '1px solid #444'
              }}>
                <span style={{ marginRight: '10px' }}>🍀</span>
                {selectedOpponent.consecutiveSaves >= 2 
                  ? <span style={{ color: '#2ecc71', fontWeight: 'bold' }}>Proteção contra Azar ATIVA (Rolará 2+ dados)</span>
                  : <span style={{ color: '#aaa' }}>Acúmulo de Azar: {selectedOpponent.consecutiveSaves}/2</span>
                }
              </div>
            )}

            {/* Campo de batalha do oponente */}
            <h3 style={{ marginBottom: '15px' }}>⚔️ Campo de Batalha</h3>
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
                    background: card ? '#2a2a3e' : '#1a1a2e',
                    border: card ? '2px solid #e94560' : '1px dashed #444',
                    borderRadius: '8px',
                    padding: '10px',
                    textAlign: 'center',
                    minHeight: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                >
                  {card ? (
                    <>
                      <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#f39c12' }}>
                        {card.nome?.slice(0, 15)}
                      </div>
                      <div style={{ fontSize: '11px', marginTop: '5px' }}>
                        ⚔️ {card.atk} 🛡️ {card.def}
                      </div>
                      {card.isEvolved && (
                        <div style={{ fontSize: '10px', color: '#f39c12', marginTop: '3px' }}>
                          ✨ EVOLUÍDA
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#555' }}>Vazio</div>
                  )}
                </div>
              ))}
            </div>

            {/* Mão do oponente */}
            <h3 style={{ marginBottom: '10px' }}>🃏 Mão</h3>
            <div style={{
              padding: '10px',
              background: '#2a2a3e',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px' }}>🃏 x {selectedOpponent.hand?.length || 0}</div>
              <div style={{ fontSize: '12px', color: '#aaa' }}>Cartas na mão (ocultas)</div>
            </div>

            {/* Sinergias */}
            {selectedOpponent.synergies && (
              <>
                <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>🔗 Sinergias Ativas</h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  padding: '10px',
                  background: '#2a2a3e',
                  borderRadius: '8px'
                }}>
                  {Object.entries(selectedOpponent.synergies.regions || {}).map(([region, count]) => (
                    count >= 2 && (
                      <span key={region} style={{
                        background: '#e94560',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px'
                      }}>
                        🗺️ {region} x{count}
                      </span>
                    )
                  ))}
                  {Object.entries(selectedOpponent.synergies.classes || {}).map(([classe, count]) => (
                    count >= 2 && (
                      <span key={classe} style={{
                        background: '#f39c12',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        color: '#000'
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