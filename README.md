# Dominion Arena Tatica

Um jogo estrategico de cartas com evolucao, combate automatico e sinergias de regioes e classes.

## Caracteristicas

- **Sistema de Dados**: Cada jogador comeca com 1 dado, pode ter ate 3
- **Economia**: Rolar dados gera ouro para comprar cartas
- **Loja Dinamica**: 6 cartas aleatorias disponiveis a cada turno
- **Evolucao**: 2 cartas identicas = 1 carta evoluida com +30% ATK/DEF
- **Campo de Batalha**: Ate 6 cartas no campo
- **Combate Automatico**: Dano = ATK total - DEF total do adversario
- **Sinergias**: Bonus por regiao e classe
- **WebSocket em Tempo Real**: Sincronizacao instantanea entre jogadores
- **Dados Persistentes**: PostgreSQL para salvar estados

## Estrutura do Projeto

```
dominion_arena_tatica/
├── backend/             # Node.js com Express e Socket.io
│   ├── server.js        # Servidor principal
│   ├── gameLogic.js    # Logica de jogo
│   ├── database.js     # Conexao PostgreSQL
│   ├── package.json
│   └── .env.example
├── frontend/           # Next.js
│   ├── src/
│   │   ├── pages/      # Paginas
│   │   │   ├── index.js      # Menu principal
│   │   │   └── game/[gameId].js
│   │   ├── components/   # Componentes React
│   │   ├── styles/      # CSS
│   │   └── lib/         # Utilitarios
│   ├── package.json
│   └── next.config.js
├── dominion_cards.json  # Banco de cartas
└── README.md
```

## Instalacao

### Pre-requisitos
- Node.js 16+
- PostgreSQL 12+

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Editar .env com suas configuracoes
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Editar .env.local se necessario
npm run dev
```

## Como Jogar

### Preparacao
1. Acesse http://localhost:3000
2. Digite seu nome de usuario
3. Crie uma nova sala ou entre em uma existente

## Mecanicas

### Inicio
- 20 vidas
- 1 dado
- Maximo 3 dados
- Limite de 5 cartas na mao
- Limite de 6 cartas no campo

### Calculo de Combate
```
Dano = Max(0, Seu ATK - DEF Adversario)
```

### Evolucao
```
Carta Evoluida ATK = Carta Original ATK * 1.3
Carta Evoluida DEF = Carta Original DEF * 1.3
```

## Sincronizacao em Tempo Real

O jogo usa WebSocket (Socket.io) para sincronizacao instantanea.

## Banco de Dados

O PostgreSQL armazena:

- **games**: Informacoes das salas
- **players**: Estado de cada jogador
- **game_states**: Estado da sala (fase, loja, turno)
