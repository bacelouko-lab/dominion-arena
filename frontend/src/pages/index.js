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

  const handleJoinPublicGame = async () => {
    if (!username.trim()) {
      setError('Digite seu nome primeiro');
      return;
    }
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dominion-arena-1.onrender.com';
      const res = await fetch(`${apiUrl}/api/games/public`);
      const data = await res.json();
      router.push(`/game/${data.gameId}?username=${encodeURIComponent(username)}&userId=${user.id}`);
    } catch (err) {
      setError('Erro ao procurar partida pública');
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
    <div style={{ 
      minHeight: '100vh', 
      backgroundImage: 'url("/assets/login_bg.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative'
    }}>
      {/* Overlay para escurecer */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        zIndex: 1
      }}></div>

      {/* Header com nome do usuário */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        background: 'rgba(10, 10, 10, 0.95)',
        borderBottom: '2px solid #e94560',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '28px' }}>🐉</span>
          <h1 style={{ fontSize: '24px', margin: 0, color: '#e94560', textTransform: 'uppercase', letterSpacing: '2px' }}>Dominion Arena</h1>
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
              fontWeight: 'bold',
              boxShadow: '0 0 10px rgba(243, 156, 18, 0.3)'
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px', position: 'relative', zIndex: 5 }}>
        <div style={{
          maxWidth: '500px',
          width: '100%',
          background: 'rgba(15, 15, 15, 0.9)',
          borderRadius: '16px',
          padding: '30px',
          border: '1px solid rgba(233,69,96,0.5)',
          boxShadow: '0 0 40px rgba(0,0,0,0.8)',
          backdropFilter: 'blur(12px)'
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#e94560', textTransform: 'uppercase' }}>⚔️ Dominion Arena Tática</h2>
          <p style={{ textAlign: 'center', color: '#bbb', marginBottom: '25px' }}>
            Jogo estratégico de cartas com evolução, combate automático e sinergias
          </p>

          {error && <div style={{ color: '#e94560', textAlign: 'center', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#eee' }}>Nome do Jogador</label>
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
                background: '#111',
                color: 'white'
              }}
            />
          </div>

          <button
            onClick={handleJoinPublicGame}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px 12px',
              background: 'linear-gradient(90deg, #e94560, #b30000)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '15px',
              boxShadow: '0 4px 15px rgba(233, 69, 96, 0.4)',
              transition: 'transform 0.2s'
            }}
          >
            {loading ? 'Buscando...' : '🕹️ Procurar Partida Pública'}
          </button>

          <div style={{ textAlign: 'center', margin: '20px 0', color: '#888', borderBottom: '1px solid #333', lineHeight: '0.1em' }}>
            <span style={{ background: '#111', padding: '0 10px' }}>Salas Privadas</span>
          </div>

          <button
            onClick={handleCreateGame}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: 'transparent',
              color: '#e94560',
              border: '2px solid #e94560',
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
            <label style={{ display: 'block', marginBottom: '5px', color: '#eee' }}>ID da Sala</label>
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
                background: '#111',
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
              background: '#333',
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