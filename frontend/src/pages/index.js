import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { api } from '../lib/api';

export default function Home() {
  const router = useRouter();
  const [gameId, setGameId] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Carregar usuário logado
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUserStr = localStorage.getItem('user');
    
    if (token && savedUserStr) {
      const savedUser = JSON.parse(savedUserStr);
      setUser(savedUser);

      // Buscar status mais recente no backend (para atualizar o ELO na tela)
      if (savedUser.id) {
        // Tenta usar a url da variável de ambiente, e faz fallback para a de prod.
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dominion-arena-1.onrender.com';
        fetch(`${apiUrl}/api/auth/me/${savedUser.id}`)
          .then(res => res.json())
          .then(freshUser => {
            if (!freshUser.error) {
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
            }
          })
          .catch(err => console.error('Erro ao atualizar usuário:', err));
      }
    } else {
      router.push('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleCreateGame = async () => {
    if (!username.trim()) {
      setError('Digite seu nome');
      return;
    }
    setLoading(true);
    try {
      const response = await api.createGame(`Game by ${username}`);
      router.push(`/game/${response.gameId}?username=${encodeURIComponent(username)}&userId=${user.id}`);
    } catch (err) {
      setError('Erro ao criar jogo');
    }
    setLoading(false);
  };

  const handleJoinGame = async () => {
    if (!gameId.trim()) {
      setError('Digite o ID da sala');
      return;
    }
    if (!username.trim()) {
      setError('Digite seu nome');
      return;
    }
    setLoading(true);
    try {
      await api.getGame(gameId);
      router.push(`/game/${gameId}?username=${encodeURIComponent(username)}&userId=${user.id}`);
    } catch (err) {
      setError('Sala não encontrada');
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f0f1b 0%, #1a1a2e 100%)' }}>
      {/* Header com nome do usuário */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        background: '#1a1a2e',
        borderBottom: '2px solid #e94560'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🐉</span>
          <h1 style={{ fontSize: '24px', margin: 0, color: '#f39c12' }}>Dominion Arena</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => router.push('/ranking')}
            style={{
              background: '#f39c12',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              color: '#000',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            🏆 Ranking
          </button>
          <span style={{ color: '#fff' }}>👤 {user.username}</span>
          <span style={{ color: '#f39c12' }}>⭐ ELO: {user.elo || 1200}</span>
          <button
            onClick={handleLogout}
            style={{
              background: '#e94560',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: '#1a1a2e',
          borderRadius: '16px',
          padding: '30px',
          border: '1px solid rgba(233,69,96,0.3)'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#f39c12' }}>⚔️ Dominion Arena Tática</h2>
          <p style={{ textAlign: 'center', color: '#aaa', marginBottom: '25px' }}>
            Jogo estratégico de cartas com evolução, combate automático e sinergias
          </p>

          {error && <div style={{ color: '#e94560', textAlign: 'center', marginBottom: '15px' }}>{error}</div>}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ddd' }}>Nome do Jogador</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Digite seu nome"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#2a2a3e',
                color: 'white'
              }}
            />
          </div>

          <button
            onClick={handleCreateGame}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#e94560',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px'
            }}
          >
            {loading ? 'Carregando...' : '+ Criar Nova Sala'}
          </button>

          <div style={{ textAlign: 'center', margin: '15px 0', color: '#666' }}>OU</div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#ddd' }}>ID da Sala</label>
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Cole o ID da sala"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #444',
                background: '#2a2a3e',
                color: 'white'
              }}
            />
          </div>

          <button
            onClick={handleJoinGame}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Carregando...' : '🚪 Entrar em Sala'}
          </button>
        </div>
      </div>
    </div>
  );
}