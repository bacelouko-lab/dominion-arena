import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Ranking() {
  const router = useRouter();
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    // Verificar se usuário está logado
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token || !savedUser) {
      router.push('/login');
      return;
    }
    
    setUser(JSON.parse(savedUser));
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ranking`);
      const data = await res.json();
      setRanking(data);
    } catch (err) {
      console.error('Erro ao carregar ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <p>Carregando ranking...</p>
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
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 1
      }}></div>

      {/* Header */}
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
          <span style={{ fontSize: '28px' }}>🏆</span>
          <h1 style={{ fontSize: '24px', margin: 0, color: '#e94560', textTransform: 'uppercase', letterSpacing: '2px' }}>Ranking</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: '#333',
              border: '1px solid #e94560',
              padding: '8px 16px',
              borderRadius: '6px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🎮 Jogar
          </button>
          <span style={{ color: '#fff' }}>👤 {user?.username}</span>
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

      {/* Conteúdo do Ranking */}
      <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 5 }}>
        <div style={{
          background: 'rgba(15, 15, 15, 0.9)',
          borderRadius: '16px',
          border: '1px solid #e94560',
          overflow: 'hidden',
          boxShadow: '0 0 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e94560', color: 'white' }}>
                <th style={{ padding: '15px', textAlign: 'center', width: '80px' }}>#</th>
                <th style={{ padding: '15px', textAlign: 'left' }}>Jogador</th>
                <th style={{ padding: '15px', textAlign: 'center', width: '100px' }}>ELO</th>
                <th style={{ padding: '15px', textAlign: 'center', width: '100px' }}>V/D</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((player, index) => (
                <tr
                  key={player.username}
                  style={{
                    borderBottom: '1px solid #333',
                    background: player.username === user?.username ? '#e9456020' : 'transparent'
                  }}
                >
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#e94560' }}>
                    {index + 1}º
                  </td>
                  <td style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>
                    {player.username}
                    {player.username === user?.username && (
                      <span style={{ marginLeft: '10px', fontSize: '12px', color: '#e94560' }}>(você)</span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', color: '#fff' }}>
                    {player.elo}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '14px', color: '#aaa' }}>
                    {player.wins || 0} / {player.losses || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {ranking.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#aaa' }}>
              Nenhum jogador no ranking ainda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}