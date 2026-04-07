#!/bin/bash

echo "Iniciando Dominion Arena Tatica..."

# Start PostgreSQL
echo "Iniciando PostgreSQL..."
docker-compose up -d postgres
sleep 3

# Install and start backend
echo "Iniciando Backend..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!
cd ..

# Install and start frontend
echo "Iniciando Frontend..."
cd frontend
npm install
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "==============================================="
echo "Dominion Arena Tatica iniciado com sucesso!"
echo "==============================================="
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Para parar a aplicacao, pressione Ctrl+C"
echo ""

wait $BACKEND_PID $FRONTEND_PID
