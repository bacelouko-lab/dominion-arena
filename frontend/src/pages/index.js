import { useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [gameId, setGameId] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateGame = async () => {
    if (!username.trim()) {
      setError('Por favor, insira seu nome de usuário');
      return;
    }

    setLoading(true);
    try {
      const response = await api.createGame(`Game by ${username}`);
      console.log('Sala criada:', response);
      const gameId = response.gameId;
      router.push(`/game/${gameId}?username=${encodeURIComponent(username)}`);
    } catch (err) {
      console.error('Erro detalhado:', err);
      setError('Erro ao criar jogo: ' + err.message);
    }
    setLoading(false);
  };

  const handleJoinGame = async () => {
    if (!gameId.trim()) {
      setError('Por favor, insira o ID da sala');
      return;
    }
    if (!username.trim()) {
      setError('Por favor, insira seu nome de usuário');
      return;
    }

    setLoading(true);
    try {
      await api.getGame(gameId);
      router.push(`/game/${gameId}?username=${encodeURIComponent(username)}`);
    } catch (err) {
      setError('Sala não encontrada');
    }
    setLoading(false);
  };

  return (
    <div className="flex-col flex-center h-full" style={{ minHeight: '100vh' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 className="text-center mb-2">⚔️ Dominion Arena Tática</h1>
        <p className="text-center mb-2" style={{ color: '#bdc3c7' }}>
          Um jogo estratégico de cartas com evolução, combate automático e sinergias
        </p>

        {error && <div className="error">{error}</div>}

        <div className="gap-2 flex-col mb-2">
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>Nome do Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button
          onClick={handleCreateGame}
          disabled={loading}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          {loading ? 'Carregando...' : '+ Criar Nova Sala'}
        </button>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#95a5a6' }}>OU</div>

        <div className="gap-2 flex-col mb-2">
          <div>
            <label style={{ display: 'block', marginBottom: '5px' }}>ID da Sala</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Cole o ID da sala"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button
          onClick={handleJoinGame}
          disabled={loading}
          style={{ width: '100%' }}
        >
          {loading ? 'Carregando...' : '🚪 Entrar em Sala'}
        </button>
      </div>
    </div>
  );
}