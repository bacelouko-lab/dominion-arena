# Setup - Dominion Arena Tatica

## Requisitos

- Node.js 16+ (https://nodejs.org/)
- PostgreSQL 12+ (https://www.postgresql.org/)
- Docker (opcional, para PostgreSQL)
- Git

## Instalacao Local

### 1. Clonar Repositorio
```bash
git clone <seu-repositorio>
cd dominion_arena_tatica
```

### 2. Setup do Backend

```bash
cd backend
npm install
cp .env.example .env
```

Editar `.env`:
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dominion_arena
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Setup do Frontend

```bash
cd ../frontend
npm install
cp .env.local.example .env.local
```

### 4. Setup do PostgreSQL

#### Opcao A: Docker (Recomendado)
```bash
cd ..
docker-compose up -d
```

#### Opcao B: PostgreSQL Instalado Localmente
```bash
psql -U postgres -c "CREATE DATABASE dominion_arena;"
```

### 5. Iniciar Servidores

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Acesse http://localhost:3000

## Verificacao

- Backend: http://localhost:5000/api/health
- Frontend: http://localhost:3000
- Banco de dados: psql -U postgres dominion_arena

## Problemas Comuns

### Porta 5000 ja em uso
```bash
lsof -i :5000
kill -9 <PID>
```

### Banco de dados nao conecta
```bash
# Verificar conexao
psql -U postgres -h localhost dominion_arena
```

### WebSocket nao conecta
- Verificar se backend esta rodando
- Verificar CORS em server.js
- Verificar URL em .env.local
