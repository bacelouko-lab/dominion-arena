import { useState, useEffect } from 'react';
import { getSocket } from '../lib/socket';
import PlayerStats from './PlayerStats';
import Shop from './Shop';
import Hand from './Hand';
import Field from './Field';
import GamePhase from './GamePhase';
import Synergies from './Synergies';
import Opponents from './Opponents';
import soundManager from '../lib/soundManager';

export default function GameBoard({ gameState, gameId, username }) {
  const socket = getSocket();
  const [players, setPlayers] = useState(gameState?.players || []);
  const [shop, setShop] = useState(gameState?.shop || []);
  const [phase, setPhase] = useState(gameState?.phase || 'roll');
  const [turn, setTurn] = useState(gameState?.turn || 0);
  const [round, setRound] = useState(gameState?.round || 1);
  const [currentPlayerId, setCurrentPlayerId] = useState(gameState?.currentPlayerId || null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [synergies, setSynergies] = useState({});
  const [gameWinner, setGameWinner] = useState(null);
  
  const [hasRolled, setHasRolled] = useState(false);
  const [hasChosen, setHasChosen] = useState(false);
  const [hasFinishedBuy, setHasFinishedBuy] = useState(false);
  const [hasFinishedPosition, setHasFinishedPosition] = useState(false);
  
  const [draggedCardIndex, setDraggedCardIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Estados para Anjo Governante (id:16)
  const [anjoBonus, setAnjoBonus] = useState(0);
  
  // Estados para Oráculo do Lago (id:19)
  const [rerollsRemaining, setRerollsRemaining] = useState(0);
  
  const [muted, setMuted] = useState(soundManager.isMuted());

  const [waitingForPlayer, setWaitingForPlayer] = useState(null);
  const [disconnectionCountdown, setDisconnectionCountdown] = useState(0);

  const effectiveCurrentPlayerId = currentPlayerId || (players.length > 0 ? players[0]?.playerId : null);
  const isMyTurn = effectiveCurrentPlayerId && currentPlayer?.playerId === effectiveCurrentPlayerId && currentPlayer?.username === username;
  const isMyTurnAndAlive = isMyTurn && phase !== 'end' && currentPlayer?.life > 0 && !gameWinner;

  useEffect(() => {
    let timer = null;
    if (waitingForPlayer && disconnectionCountdown > 0) {
      timer = setInterval(() => {
        setDisconnectionCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    } else if (disconnectionCountdown === 0) {
      setWaitingForPlayer(null);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [waitingForPlayer, disconnectionCountdown]);

  // ========== SISTEMA DE ÁUDIO & UNLOCK ==========
  useEffect(() => {
    const handleFirstClick = () => {
      soundManager.unlock();
      // Remove o listener após o primeiro clique bem sucedido
      window.removeEventListener('mousedown', handleFirstClick);
      window.removeEventListener('touchstart', handleFirstClick);
    };

    window.addEventListener('mousedown', handleFirstClick);
    window.addEventListener('touchstart', handleFirstClick);

    return () => {
      window.removeEventListener('mousedown', handleFirstClick);
      window.removeEventListener('touchstart', handleFirstClick);
    };
  }, []);

  // ========== SISTEMA DE RECONEXÃO ==========
  useEffect(() => {
    if (!socket) return;
    
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectInterval = null;
    
    const handleDisconnect = () => {
      console.log('⚠️ Desconectado do servidor. Tentando reconectar...');
      
      const tryReconnect = () => {
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          console.log(`🔄 Tentativa ${reconnectAttempts} de reconexão...`);
          
          setTimeout(() => {
            if (!socket.connected) {
              const savedPlayerId = localStorage.getItem(`player_${gameId}`);
              if (savedPlayerId) {
                socket.emit('reconnect-game', {
                  gameId,
                  username,
                  playerId: savedPlayerId
                });
              } else {
                socket.connect();
              }
              tryReconnect();
            }
          }, 2000);
        } else {
          console.log('❌ Falha na reconexão. Redirecionando...');
          alert('Conexão perdida. Voltando ao menu...');
          window.location.href = '/';
        }
      };
      
      tryReconnect();
    };
    
    const handleReconnected = ({ playerId, username: reconnectedUsername }) => {
      console.log(`✅ Jogador ${reconnectedUsername} reconectou!`);
      // Mostra uma notificação discreta
      const notification = document.createElement('div');
      notification.textContent = `${reconnectedUsername} reconectou à partida!`;
      notification.style.position = 'fixed';
      notification.style.bottom = '20px';
      notification.style.right = '20px';
      notification.style.background = '#27ae60';
      notification.style.color = 'white';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '8px';
      notification.style.zIndex = '2000';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    };
    
    socket.on('disconnect', handleDisconnect);
    socket.on('player-reconnected', handleReconnected);
    
    // Salva o playerId no localStorage para reconexão
    if (currentPlayer?.playerId) {
      localStorage.setItem(`player_${gameId}`, currentPlayer.playerId);
    }
    
    return () => {
      socket.off('disconnect', handleDisconnect);
      socket.off('player-reconnected', handleReconnected);
      if (reconnectInterval) clearInterval(reconnectInterval);
    };
  }, [socket, gameId, username, currentPlayer]);

  const toggleMute = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    soundManager.setMuted(newMuted);
    if (!newMuted) soundManager.play('click');
  };

  const handleSellCard = (card, isField) => {
    if (!isMyTurnAndAlive) return;
    socket.emit('sell-card', { cardInstanceId: card.instanceId, isField });
  };

  useEffect(() => {
    if (effectiveCurrentPlayerId) {
      const player = players.find(p => p.playerId === effectiveCurrentPlayerId);
      setCurrentPlayer(player);
      setAnjoBonus(player?.anjoGovernanteBonus || 0);
      setRerollsRemaining(player?.rerollsRemaining || 0);
    }
  }, [effectiveCurrentPlayerId, players]);

  useEffect(() => {
    if (gameState) {
      setPlayers(gameState.players || []);
      setPhase(gameState.phase || 'roll');
      setTurn(gameState.turn || 0);
      setRound(gameState.round || 1);
      setCurrentPlayerId(gameState.currentPlayerId || null);
      setShop(gameState.shop || []);
      if (gameState.currentPlayerId) {
        const current = gameState.players.find(p => p.playerId === gameState.currentPlayerId);
        if (current) setCurrentPlayer(current);
        setAnjoBonus(current?.anjoGovernanteBonus || 0);
        setRerollsRemaining(current?.rerollsRemaining || 0);
      }
    }
  }, [gameState]);

  const handleDragStart = (e, fromData) => {
    if (!isMyTurnAndAlive) return;
    
    // Permitimos arrastar na fase de compra APENAS se for para vender (da mão ou campo)
    // Na fase de posicionamento, permitimos tudo.
    if (phase !== 'buy' && phase !== 'position') return;
    
    setDraggedCardIndex(fromData); 
    setIsDragging(true);
    e.dataTransfer.setData('application/json', JSON.stringify(fromData));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedCardIndex(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, toData) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isMyTurnAndAlive || phase !== 'position') return;
    
    let fromData = draggedCardIndex;
    if (!fromData) {
      try {
        fromData = JSON.parse(e.dataTransfer.getData('application/json'));
      } catch (err) {
        return;
      }
    }

    if (fromData && toData) {
      // Evitar mover para o mesmo lugar
      if (fromData.type === toData.type && fromData.index === toData.index) return;
      
      socket.emit('reposition-card', { from: fromData, to: toData });
      setDraggedCardIndex(null);
    }
  };

  const handleSellDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isMyTurnAndAlive) return;

    const fromData = draggedCardIndex;
    if (!fromData) return;

    let card;
    if (fromData.type === 'hand') {
      card = currentPlayerObj?.hand[fromData.index];
    } else if (fromData.type === 'field') {
      card = currentPlayerObj?.field[fromData.index];
    }

    if (card) {
      handleSellCard(card, fromData.type === 'field');
    }
    setDraggedCardIndex(null);
  };

  const returnCardToShop = (card) => {
    if (isMyTurnAndAlive && phase === 'buy') {
      socket.emit('return-card', { 
        cardInstanceId: card.instanceId,
        cardCost: card.custo,
        fieldPosition: card.fieldPosition 
      });
    }
  };

  const activateAnjoGovernante = () => {
    if (isMyTurnAndAlive && phase === 'buy') {
      socket.emit('activate-anjo-governante');
    }
  };

  const rerollDice = () => {
    if (isMyTurnAndAlive && phase === 'roll' && hasRolled && rerollsRemaining > 0) {
      socket.emit('reroll-dice');
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('player-joined', ({ players }) => setPlayers(players));
    socket.on('player-left', ({ playerId }) => setPlayers(prev => prev.filter(p => p.playerId !== playerId)));
    socket.on('game-state', (state) => {
      setPlayers(state.players || []);
      setPhase(state.phase || 'roll');
      setTurn(state.turn || 0);
      setRound(state.round || 1);
      setCurrentPlayerId(state.currentPlayerId || null);
      setShop(state.shop || []);
      // Se mudo o turno, limpamos espera
      setWaitingForPlayer(null);
    });
    socket.on('dice-rolled', ({ playerId, rolls, totalGold, diceCount, savedPoints }) => {
      soundManager.play('dice');
      setPlayers(prev => prev.map(p => p.playerId === playerId ? { ...p, gold: totalGold, dice: diceCount, savedPoints } : p));
      if (playerId === effectiveCurrentPlayerId) setHasRolled(true);
    });
    
    socket.on('dice-rerolled', ({ playerId, rolls, gold, rerollsRemaining }) => {
      soundManager.play('dice');
      setPlayers(prev => prev.map(p => p.playerId === playerId ? { ...p, gold, diceRolls: rolls, rerollsRemaining } : p));
      if (playerId === effectiveCurrentPlayerId) {
        setRerollsRemaining(rerollsRemaining);
      }
    });
    
    socket.on('anjo-governante-activated', ({ playerId, gold, bonus, spent }) => {
      soundManager.play('evolve');
      setPlayers(prev => prev.map(p => p.playerId === playerId ? { ...p, gold, anjoGovernanteBonus: bonus, anjoGovernanteSpent: spent } : p));
      if (playerId === effectiveCurrentPlayerId) {
        setAnjoBonus(bonus);
      }
    });
    
    socket.on('shop-option-chosen', ({ playerId, choseShop, phase, shop, gold, savedPoints }) => {
      setPlayers(prev => prev.map(p => p.playerId === playerId ? { ...p, choseShop, gold, savedPoints } : p));
      if (shop) setShop(shop);
      setPhase(phase);
      if (playerId === effectiveCurrentPlayerId) setHasChosen(true);
    });
    socket.on('shop-updated', ({ shop, gold }) => {
      setShop(shop);
      if (effectiveCurrentPlayerId) setPlayers(prev => prev.map(p => p.playerId === effectiveCurrentPlayerId ? { ...p, gold } : p));
    });
    socket.on('card-bought', ({ playerId, hand, gold, shop }) => {
      soundManager.play('buy');
      setPlayers(prev => prev.map(p => p.playerId === playerId ? { ...p, hand, gold } : p));
      if (shop) setShop(shop);
    });
    socket.on('card-placed', ({ playerId, field, hand }) => {
      soundManager.play('place');
      setPlayers(prev => prev.map(p => p.playerId === playerId ? { ...p, field, hand } : p));
      if (playerId === effectiveCurrentPlayerId) {
        socket.emit('calculate-synergies');
      }
    });
    socket.on('card-returned', ({ playerId, field, gold, shop }) => {
      setPlayers(prev => prev.map(p => p.playerId === playerId ? { ...p, field, gold } : p));
      setShop(shop);
    });
    socket.on('phase-changed', ({ phase, turn, nextPlayerId }) => {
      if (nextPlayerId === (players.find(p => p.username === username)?.playerId)) {
        soundManager.play('turn');
      }
      setPhase(phase);
      if (turn) setTurn(turn);
      if (nextPlayerId) setCurrentPlayerId(nextPlayerId);
      if (phase === 'roll') {
        setHasRolled(false);
        setHasChosen(false);
        setHasFinishedBuy(false);
        setHasFinishedPosition(false);
      }
      if (phase === 'combat' || phase === 'roll') {
        socket.emit('calculate-synergies');
      }
    });
    socket.on('turn-ended', ({ nextPlayerId, turn, round }) => {
      if (nextPlayerId === (players.find(p => p.username === username)?.playerId)) {
        soundManager.play('turn');
      }
      setCurrentPlayerId(nextPlayerId);
      setTurn(turn);
      setRound(round);
      setHasRolled(false);
      setHasChosen(false);
      setHasFinishedBuy(false);
      setHasFinishedPosition(false);
      setPhase('roll');
      setWaitingForPlayer(null); // Limpa espera
      socket.emit('calculate-synergies');
    });
    socket.on('combat-resolved', ({ attacker, defender, netDamage }) => {
      soundManager.play('attack');
      setPlayers(prev => prev.map(p => {
        if (p.playerId === defender.playerId) return { ...p, life: Math.max(0, p.life - netDamage) };
        return p;
      }));
      if (attacker.username === username) alert(`⚔️ Você causou ${netDamage} de dano em ${defender.username}!`);
      else if (defender.username === username) alert(`💔 Você recebeu ${netDamage} de dano de ${attacker.username}!`);
    });
    socket.on('game-over', ({ winner, loser }) => {
      if (winner.username === username) {
        soundManager.play('victory');
        alert(`🏆 PARABÉNS! Você venceu!`);
      } else {
        soundManager.play('defeat');
        alert(`🏆 FIM DE JOGO! ${winner.username} venceu!`);
      }
      setGameWinner(winner);
      setPhase('end');
      setTimeout(() => { if (confirm('Deseja voltar ao menu?')) window.location.href = '/'; }, 3000);
    });
    socket.on('synergies-calculated', (data) => setSynergies(data));
    socket.on('synergy-copied', ({ playerId, copiedSynergy, copiedLevel }) => {
      setPlayers(prev => prev.map(p => p.playerId === playerId ? { ...p, copiedSynergy, copiedSynergyLevel: copiedLevel } : p));
    });
    socket.on('sell-success', ({ gold }) => {
      soundManager.play('coin');
    });
    // Evento de jogador desconectado (avisar que alguém caiu)
    socket.on('player-disconnected', ({ playerId, username, timeoutMs }) => {
      console.log(`⚠️ Jogador ${username} desconectou. Aguardando ${timeoutMs/1000}s...`);
      setWaitingForPlayer(username);
      setDisconnectionCountdown(timeoutMs / 1000);
    });

    socket.on('player-reconnected', ({ playerId, username }) => {
      console.log(`✅ Jogador ${username} reconectou!`);
      setWaitingForPlayer(null);
      setDisconnectionCountdown(0);
    });

    return () => {
      socket.off('player-joined');
      socket.off('player-left');
      socket.off('game-state');
      socket.off('dice-rolled');
      socket.off('dice-rerolled');
      socket.off('anjo-governante-activated');
      socket.off('shop-option-chosen');
      socket.off('shop-updated');
      socket.off('card-bought');
      socket.off('card-placed');
      socket.off('card-returned');
      socket.off('phase-changed');
      socket.off('turn-ended');
      socket.off('combat-resolved');
      socket.off('game-over');
      socket.off('synergies-calculated');
      socket.off('synergy-copied');
      socket.off('player-disconnected');
      socket.off('sell-success');
    };
  }, [socket, effectiveCurrentPlayerId]);

  const rollDice = () => {
    if (isMyTurnAndAlive && !hasRolled && phase === 'roll') {
      soundManager.play('click');
      socket.emit('roll-dice');
    }
  };

  const chooseShopOption = (choseShop) => {
    if (isMyTurnAndAlive && !hasChosen && phase === 'shop_decision') {
      soundManager.play('click');
      socket.emit('choose-shop-option', { choseShop });
    }
  };

  const rerollShop = () => {
    if (isMyTurnAndAlive && currentPlayer?.gold >= 1 && phase === 'buy') {
      soundManager.play('click');
      socket.emit('reroll-shop');
    }
  };

  const finishShopping = () => {
    if (isMyTurnAndAlive && !hasFinishedBuy && phase === 'buy') {
      soundManager.play('click');
      socket.emit('finish-shopping');
      setHasFinishedBuy(true);
    }
  };

  const finishPositioning = () => {
    if (isMyTurnAndAlive && !hasFinishedPosition && phase === 'position') {
      soundManager.play('click');
      socket.emit('finish-positioning');
      setHasFinishedPosition(true);
    }
  };

  const endTurn = () => {
    if (isMyTurnAndAlive && phase === 'combat') {
      soundManager.play('click');
      socket.emit('end-turn');
    }
  };

  const attackPlayer = () => {
    if (isMyTurnAndAlive && phase === 'combat') {
      soundManager.play('click');
      socket.emit('attack-player');
    }
  };

  if (gameWinner) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '500px', padding: '40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏆</div>
          <h1 style={{ color: '#f39c12' }}>{gameWinner.username === username ? 'VOCÊ VENCEU!' : `${gameWinner.username} VENCEU!`}</h1>
          <button onClick={() => window.location.href = '/'} style={{ padding: '12px 24px', cursor: 'pointer' }}>🔄 Voltar ao Menu</button>
        </div>
      </div>
    );
  }

  if (!currentPlayer) return <div>Carregando jogador...</div>;

  const opponents = players.filter(p => p.playerId !== effectiveCurrentPlayerId);
  const currentPlayerObj = players.find(p => p.playerId === effectiveCurrentPlayerId);
  const nextTurnDice = Math.min(1 + Math.floor((currentPlayer?.savedPoints || 0) / 4), 3);

  const hasAnjoGovernante = currentPlayerObj?.field?.some(c => c && c.id === 16 && c.isEvolved);
  const hasOracle = currentPlayerObj?.field?.some(c => c && c.id === 19 && c.isEvolved);

  if (phase === 'shop_decision' && isMyTurnAndAlive && !hasChosen) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '500px', padding: '30px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#e94560', textTransform: 'uppercase' }}>🎲 Você rolou {currentPlayer.dice || 1} dado(s)!</h2>
          <h3 style={{ color: '#fff' }}>⭐ Pontos: {currentPlayer.gold || 0}</h3>
          <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#111', border: '1px solid #444', borderRadius: '8px' }}>
            <div style={{ color: '#aaa' }}>💾 Pontos guardados: {currentPlayer.savedPoints || 0}</div>
            <div style={{ color: '#e94560', fontWeight: 'bold' }}>🎲 Próximo turno: {nextTurnDice} dado(s)</div>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
            <button onClick={() => chooseShopOption(true)} style={{ padding: '15px 30px', cursor: 'pointer', background: '#e94560' }}>🛒 Ir para a Loja</button>
            <button onClick={() => chooseShopOption(false)} style={{ padding: '15px 30px', background: '#333', border: '1px solid #e94560', cursor: 'pointer' }}>💾 Guardar Pontos</button>
          </div>
          <div style={{ marginTop: '15px', fontSize: '12px', color: '#888' }}>
            ⚠️ Pontos não gastos na loja serão perdidos
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ 
        position: 'relative',
        minHeight: '100vh',
        backgroundImage: 'url("/assets/board_bg.png")',
        backgroundSize: '800px', // Textura repetida ou ajustada
        backgroundRepeat: 'repeat',
        backgroundColor: '#000'
      }}
      onClick={() => {
        // Garantia extra: qualquer clique no tabuleiro tenta desbloquear o som
        if (!soundManager.initialized) soundManager.unlock();
      }}
    >
      {/* Overlay para dar profundidade */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle, transparent 20%, rgba(0,0,0,0.4) 100%)',
        pointerEvents: 'none',
        zIndex: 1
      }}></div>

      <div style={{ position: 'relative', zIndex: 2, padding: '20px' }}>
      
      {/* MODAL DE DESCONEXÃO / ESPERA */}
      {waitingForPlayer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          backdropFilter: 'blur(5px)'
        }}>
          <div className="card" style={{ padding: '40px', textAlign: 'center', border: '2px solid #e94560' }}>
            <h2 style={{ color: '#e94560', marginBottom: '10px' }}>⚠️ JOGADOR DESCONECTADO</h2>
            <p>Aguardando retorno de <strong>{waitingForPlayer}</strong></p>
            <div style={{ fontSize: '48px', fontWeight: 'bold', margin: '20px 0', color: '#fff' }}>
              {disconnectionCountdown}s
            </div>
            <p style={{ fontSize: '13px', color: '#888' }}>O jogador será eliminado após o tempo expirar.</p>
          </div>
        </div>
      )}

      <button 
        onClick={toggleMute}
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 1000,
          background: '#2a2a3e',
          border: '2px solid #e94560',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
        }}
        title={muted ? "Ativar Som" : "Mudar para Mudo"}
      >
        {muted ? '🔈' : '🔊'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 280px', gap: '20px' }}>
      <div style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h3>👥 Opositores</h3>
        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#aaa' }}>Rodada: {round} | Turno: {turn}</div>
        <Opponents opponents={opponents} currentUsername={username} />
      </div>

      <div style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <GamePhase phase={phase} turn={turn} currentPlayer={currentPlayerObj?.username} />
        <PlayerStats player={currentPlayerObj || currentPlayer} />
        
        {phase === 'buy' && (
          <>
            <Shop 
              shopCards={shop || []} 
              onBuy={(card, index) => socket.emit('buy-card', { cardInstanceId: card.instanceId })} 
              onReturnCard={returnCardToShop}
              gold={currentPlayerObj?.gold || 0} 
            />
            <div onDragOver={handleDragOver}>
              <Hand 
                hand={currentPlayerObj?.hand || []} 
                gameId={gameId} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onSell={handleSellCard} 
              />
            </div>
            <Field 
              field={currentPlayerObj?.field || []} 
              gameId={gameId} 
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onSell={handleSellCard} 
            />
            
            {hasAnjoGovernante && isMyTurnAndAlive && (
              <button 
                onClick={activateAnjoGovernante}
                disabled={currentPlayerObj?.gold < 1 || currentPlayerObj?.anjoGovernanteBonus >= 12}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '10px',
                  background: currentPlayerObj?.gold < 1 || currentPlayerObj?.anjoGovernanteBonus >= 12 ? '#555' : '#e94560',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: currentPlayerObj?.gold < 1 || currentPlayerObj?.anjoGovernanteBonus >= 12 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
              >
                👼 Anjo Governante: Gastar 1 Ouro (+2 ATK) [{currentPlayerObj?.anjoGovernanteBonus || 0}/12]
              </button>
            )}
          </>
        )}
        
        {phase === 'position' && (
          <>
            <div onDragOver={handleDragOver}>
              <Hand 
                hand={currentPlayerObj?.hand || []} 
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDrop}
                onSell={handleSellCard}
              />
            </div>
            <Field 
              field={currentPlayerObj?.field || []} 
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onSell={handleSellCard}
              isDropTarget={true}
            />
          </>
        )}
        
        {phase === 'combat' && (
          <Field 
            field={currentPlayerObj?.field || []} 
            gameId={gameId} 
            onSell={handleSellCard}
          />
        )}
      </div>

      <div style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="card">
          <h3>🎮 Controles</h3>
          
          {!isMyTurnAndAlive && phase !== 'combat' && !gameWinner && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#f39c12' }}>
              ⏳ Aguardando vez de {currentPlayerObj?.username}...
            </div>
          )}
          
          {isMyTurnAndAlive && phase === 'roll' && !hasRolled && (
            <button onClick={rollDice} style={{ width: '100%', marginBottom: '10px', fontSize: '18px', padding: '15px', cursor: 'pointer' }}>
              🎲 Rolar Dados
            </button>
          )}
          
          {isMyTurnAndAlive && phase === 'roll' && hasRolled && rerollsRemaining > 0 && (
            <button 
              onClick={rerollDice}
              style={{ 
                width: '100%', 
                marginBottom: '10px', 
                background: '#333',
                border: '1px solid #e94560', 
                cursor: 'pointer',
                padding: '10px',
                color: '#fff'
              }}
            >
              🔄 Rerrolar Dados ({rerollsRemaining}/2)
            </button>
          )}
          
          {isMyTurnAndAlive && phase === 'buy' && (
            <>
              <button onClick={rerollShop} disabled={currentPlayerObj?.gold < 1} style={{ width: '100%', marginBottom: '10px', cursor: 'pointer', background: '#222', border: '1px solid #444' }}>
                🔄 Reroll Loja (1 ponto)
              </button>
              <button onClick={finishShopping} style={{ width: '100%', marginBottom: '10px', background: '#e94560', cursor: 'pointer' }}>
                ✅ Finalizar Compras
              </button>
            </>
          )}
          
          {isMyTurnAndAlive && phase === 'position' && (
            <button onClick={finishPositioning} style={{ width: '100%', marginBottom: '10px', background: '#b30000', cursor: 'pointer' }}>
              ⚔️ Confirmar Estratégia
            </button>
          )}
          
          {isMyTurnAndAlive && phase === 'combat' && opponents.length > 0 && round > 1 && (
            <button 
              onClick={attackPlayer} 
              style={{ width: '100%', marginBottom: '10px', background: '#e94560', cursor: 'pointer' }}
            >
              ⚔️ Atacar (Aleatório)
            </button>
          )}
          
          {isMyTurnAndAlive && phase === 'combat' && (
            <button onClick={endTurn} style={{ width: '100%', marginBottom: '10px', background: '#f39c12', cursor: 'pointer' }}>
              🔄 Encerrar Turno
            </button>
          )}
          
          {currentPlayerObj?.life <= 0 && !gameWinner && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#e94560', fontWeight: 'bold' }}>
              💀 VOCÊ FOI DERROTADO!
            </div>
          )}
        </div>
        
        <Synergies synergies={synergies} />
      </div>

      {/* ZONA DE VENDA (SELL ZONE) */}
      {isDragging && (phase === 'buy' || phase === 'position') && (
        <div 
          onDragOver={handleDragOver}
          onDrop={handleSellDrop}
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '400px',
            height: '100px',
            background: 'linear-gradient(180deg, rgba(233, 69, 96, 0.2) 0%, rgba(233, 69, 96, 0.4) 100%)',
            border: '2px dashed #e94560',
            borderRadius: '15px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            animation: 'pulse-red 1.5s infinite ease-in-out',
            color: 'white',
            backdropFilter: 'blur(5px)'
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '5px' }}>💰</div>
          <div style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Vender Carta</div>
          <div style={{ fontSize: '12px', color: '#ffcc00' }}>Receba 100% do valor de volta</div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(233, 69, 96, 0.7); }
          70% { box-shadow: 0 0 0 20px rgba(233, 69, 96, 0); }
          100% { box-shadow: 0 0 0 0 rgba(233, 69, 96, 0); }
        }
      `}</style>

     </div>
    </div>
   </div>
  );
}