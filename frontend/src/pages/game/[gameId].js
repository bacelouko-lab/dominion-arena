import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { initSocket, getSocket } from '../../lib/socket';
import GameBoard from '../../components/GameBoard';

export default function GamePage() {
  const router = useRouter();
  const { gameId, username } = router.query;
  const [gameState, setGameState] = useState(null);
  const [playerState, setPlayerState] = useState(null);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [readyPlayers, setReadyPlayers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (!gameId || !username) return;

    const socket = initSocket();

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-game', { gameId, username });
    });

    socket.on('game-state', (state) => {
      setGameState(state);
      const currentPlayer = state.players.find(p => p.username === username);
      if (currentPlayer) setPlayerState(currentPlayer);
    });

    socket.on('player-joined', ({ players, readyList }) => {
      setGameState((prev) => prev ? { ...prev, players } : null);
      if (readyList) {
        setReadyPlayers(readyList);
        const currentPlayerId = players?.find(p => p.username === username)?.playerId;
        if (currentPlayerId && readyList.includes(currentPlayerId)) {
          setIsReady(true);
        }
      }
    });

    socket.on('player-ready', ({ readyList }) => {
      setReadyPlayers(readyList);
      const currentPlayerId = gameState?.players?.find(p => p.username === username)?.playerId;
      if (currentPlayerId && readyList.includes(currentPlayerId)) {
        setIsReady(true);
      }
    });

    socket.on('player-ready-update', ({ readyList }) => {
      setReadyPlayers(readyList);
      const currentPlayerId = gameState?.players?.find(p => p.username === username)?.playerId;
      if (currentPlayerId && readyList.includes(currentPlayerId)) {
        setIsReady(true);
      } else {
        setIsReady(false);
      }
    });

    socket.on('game-start', ({ gameState }) => {
      setGameStarted(true);
      setGameState(gameState);
    });

    socket.on('error', (msg) => {
      setError(msg);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    return () => {
      socket.off('connect');
      socket.off('game-state');
      socket.off('player-joined');
      socket.off('player-ready');
      socket.off('player-ready-update');
      socket.off('game-start');
      socket.off('error');
      socket.off('disconnect');
    };
  }, [gameId, username, gameState]);

  const markReady = () => {
    const socket = getSocket();
    if (socket && !isReady) {
      socket.emit('player-ready', { gameId });
      setIsReady(true);
    }
  };

  const cancelReady = () => {
    const socket = getSocket();
    if (socket && isReady) {
      socket.emit('cancel-ready', { gameId });
      setIsReady(false);
    }
  };

  if (!gameId || !username) {
    return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Carregando...</div>;
  }

  if (!connected) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ padding: '20px', background: '#2a2a3e', borderRadius: '8px' }}>
          <p>Conectando ao servidor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ padding: '20px', background: '#2a2a3e', borderRadius: '8px' }}>
          <div style={{ color: '#e94560' }}>{error}</div>
          <button onClick={() => router.push('/')} style={{ marginTop: '10px', padding: '8px 16px' }}>Voltar ao Menu</button>
        </div>
      </div>
    );
  }

  // Tela de LOBBY (espera)
  if (!gameStarted && gameState) {
    const players = gameState.players || [];
    const totalPlayers = players.length;
    const readyCount = readyPlayers.length;
    const allReady = totalPlayers >= 2 && readyCount === totalPlayers;

    return (
      <div style={{ minHeight: '100vh', padding: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '20px', background: '#1a1a2e', borderRadius: '16px' }}>
          <h2>🎮 Sala: {gameId}</h2>
          <p>Jogador: {username}</p>
          
          <hr style={{ margin: '20px 0' }} />
          
          <h3>👥 Jogadores na sala ({totalPlayers}/6):</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {players.map((p, idx) => (
              <li key={idx} style={{ 
                padding: '10px', 
                margin: '5px 0', 
                background: readyPlayers.includes(p.playerId) ? '#27ae6020' : '#2a2a3e',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{p.username}</span>
                <span style={{ color: readyPlayers.includes(p.playerId) ? '#27ae60' : '#f39c12' }}>
                  {readyPlayers.includes(p.playerId) ? '✅ Pronto' : '⏳ Aguardando'}
                </span>
              </li>
            ))}
          </ul>
          
          <div style={{ margin: '20px 0' }}>
            <p style={{ color: totalPlayers < 2 ? '#e94560' : '#27ae60' }}>
              {totalPlayers < 2 ? '⚠️ Mínimo de 2 jogadores' : '✅ Número OK'}
            </p>
            <p>{readyCount}/{totalPlayers} prontos</p>
          </div>
          
          {!isReady ? (
            <button onClick={markReady} disabled={totalPlayers < 2} style={{ width: '100%', padding: '15px', background: totalPlayers < 2 ? '#555' : '#27ae60' }}>
              ✅ Estou Pronto!
            </button>
          ) : (
            <button onClick={cancelReady} style={{ width: '100%', padding: '15px', background: '#e94560' }}>
              ❌ Cancelar Pronto
            </button>
          )}
          
          {allReady && (
            <div style={{ marginTop: '20px', padding: '10px', background: '#f39c1220', borderRadius: '5px' }}>
              🚀 Todos prontos! Iniciando jogo...
            </div>
          )}
        </div>
      </div>
    );
  }

  // JOGO INICIADO
  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <h2>Sala: {gameId}</h2>
      <p>Jogador: {username}</p>
      {gameState && playerState ? (
        <GameBoard gameState={gameState} gameId={gameId} username={username} />
      ) : (
        <div>Carregando jogo...</div>
      )}
    </div>
  );
}