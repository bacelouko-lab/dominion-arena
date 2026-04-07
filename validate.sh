#!/bin/bash

echo "========================================"
echo "Validando Dominion Arena Tatica"
echo "========================================"
echo ""

# Check structure
echo "Verificando estrutura do projeto..."
files=(
  "backend/server.js"
  "backend/gameLogic.js"
  "backend/database.js"
  "backend/package.json"
  "frontend/src/pages/index.js"
  "frontend/src/pages/game/[gameId].js"
  "frontend/src/components/GameBoard.js"
  "frontend/package.json"
  "dominion_cards.json"
  "docker-compose.yml"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  [OK] $file"
  else
    echo "  [ERRO] $file NAO ENCONTRADO"
  fi
done

echo ""
echo "========================================"
echo "Estrutura validada!"
echo "========================================"
echo ""
echo "Proximos passos:"
echo "1. cd backend && npm install"
echo "2. cd ../frontend && npm install"
echo "3. docker-compose up -d (para PostgreSQL)"
echo "4. npm run dev (em cada pasta)"
echo ""
