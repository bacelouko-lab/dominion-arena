const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  async createGame(name) {
    const response = await fetch(`${API_URL}/api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) throw new Error('Erro ao criar sala');
    const data = await response.json();
    console.log('API createGame retornou:', data);
    return data;
  },

  async getGame(gameId) {
    const response = await fetch(`${API_URL}/api/games/${gameId}`);
    if (!response.ok) throw new Error('Sala não encontrada');
    return response.json();
  },
};