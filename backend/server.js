const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const GameLogic = require('./gameLogic');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS TOTALMENTE LIBERADO
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('ngrok-skip-browser-warning', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ['GET', 'POST']
  }
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rotas de autenticação
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Rota de ranking
app.get('/api/ranking', async (req, res) => {
  const { supabase } = require('./supabase');
  
  const { data, error } = await supabase
    .from('users')
    .select('username, elo, wins, losses')
    .order('elo', { ascending: false })
    .limit(50);
  
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  res.json(data);
});

const games = new Map();
const playerSockets = new Map();
const readyPlayersMap = new Map();

function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/games', (req, res) => {
  let gameId;
  let exists = true;
  while (exists) {
    gameId = generateShortCode();
    exists = games.has(gameId);
  }
  const game = new GameLogic(gameId);
  games.set(gameId, game);
  res.json({ gameId, gameName: `Game ${gameId}` });
});

app.get('/api/games/:gameId', (req, res) => {
  const game = games.get(req.params.gameId);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  res.json(game.getGameState());
});

// ========== FUNÇÃO PARA SALVAR PARTIDA ==========
async function saveMatch(game, winnerId, loserId) {
  const { supabase } = require('./supabase');
  
  // Buscar ELO atual dos jogadores
  const { data: winner } = await supabase
    .from('users')
    .select('elo, username')
    .eq('id', winnerId)
    .single();
  
  const { data: loser } = await supabase
    .from('users')
    .select('elo, username')
    .eq('id', loserId)
    .single();
  
  if (!winner || !loser) return;
  
  // Calcular novo ELO
  const K = 32;
  const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winner.elo - loser.elo) / 400));
  
  const newWinnerElo = Math.round(winner.elo + K * (1 - expectedWinner));
  const newLoserElo = Math.round(loser.elo + K * (0 - expectedLoser));
  
  // Salvar partida
  const { error: matchError } = await supabase
    .from('matches')
    .insert({
      game_id: game.gameId,
      winner_id: winnerId,
      loser_id: loserId,
      winner_elo_before: winner.elo,
      winner_elo_after: newWinnerElo,
      loser_elo_before: loser.elo,
      loser_elo_after: newLoserElo,
      duration: game.turn,
      round: game.round
    });
  
  if (matchError) {
    console.error('Erro ao salvar partida:', matchError);
  } else {
    console.log(`✅ Partida salva: ${winner.username} (${winner.elo}→${newWinnerElo}) vs ${loser.username} (${loser.elo}→${newLoserElo})`);
  }
  
  // Atualizar ELO e vitórias/derrotas dos jogadores
  await supabase
    .from('users')
    .update({ 
      elo: newWinnerElo,
      wins: (winner.wins || 0) + 1
    })
    .eq('id', winnerId);
  
  await supabase
    .from('users')
    .update({ 
      elo: newLoserElo,
      losses: (loser.losses || 0) + 1
    })
    .eq('id', loserId);
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-game', ({ gameId, username }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }
    const playerId = uuidv4();
    game.addPlayer(playerId, username);
    playerSockets.set(playerId, socket.id);
    socket.join(gameId);
    socket.gameId = gameId;
    socket.playerId = playerId;
    socket.emit('game-state', game.getGameState());
    const readyList = readyPlayersMap.get(gameId) || [];
    io.to(gameId).emit('player-joined', { players: Object.values(game.players), readyList });
  });

  socket.on('player-ready', ({ gameId }) => {
    const game = games.get(gameId);
    if (!game) return;
    if (!readyPlayersMap.has(gameId)) readyPlayersMap.set(gameId, []);
    const readyList = readyPlayersMap.get(gameId);
    if (!readyList.includes(socket.playerId)) readyList.push(socket.playerId);
    const players = Object.values(game.players);
    const totalPlayers = players.length;
    const readyCount = readyList.length;
    io.to(gameId).emit('player-ready', { playerId: socket.playerId, username: game.players[socket.playerId]?.username, readyCount, totalPlayers, readyList });
    if (readyCount === totalPlayers && totalPlayers >= 2) {
      game.phase = 'roll';
      game.turn = 0;
      game.round = 1;
      game.currentPlayerIndex = 0;
      for (const playerId in game.players) {
        game.players[playerId].life = 20;
        game.players[playerId].gold = 0;
        game.players[playerId].hand = [];
        game.players[playerId].field = Array(6).fill(null);
        game.players[playerId].hasActedThisTurn = false;
        game.players[playerId].choseShop = false;
        game.players[playerId].savedPoints = 0;
        game.players[playerId].freeCardUsed = false;
        game.players[playerId].abilityDoubleUsed = false;
        game.players[playerId].ladinoUsedThisAttack = false;
        game.players[playerId].copiedSynergy = null;
        game.players[playerId].copiedSynergyLevel = 0;
        game.players[playerId].anjoGovernanteBonus = 0;
        game.players[playerId].anjoGovernanteSpent = 0;
        game.players[playerId].rerollsRemaining = 2;
        game.players[playerId].hasRerolled = false;
      }
      readyPlayersMap.delete(gameId);
      io.to(gameId).emit('game-start', { gameState: game.getGameState() });
      console.log(`Game ${gameId} started with ${totalPlayers} players`);
    }
  });

  socket.on('cancel-ready', ({ gameId }) => {
    const readyList = readyPlayersMap.get(gameId);
    if (readyList) {
      const index = readyList.indexOf(socket.playerId);
      if (index !== -1) readyList.splice(index, 1);
      io.to(gameId).emit('player-ready-update', { readyList, playerId: socket.playerId, isReady: false });
    }
  });

  socket.on('roll-dice', () => {
    const game = games.get(socket.gameId);
    if (!game) return;
    const result = game.rollDice(socket.playerId);
    if (result.error) socket.emit('error', result.error);
    else {
      io.to(socket.gameId).emit('dice-rolled', { playerId: socket.playerId, ...result });
      game.phase = 'shop_decision';
      io.to(socket.gameId).emit('phase-changed', { phase: 'shop_decision', turn: game.turn });
    }
  });

  socket.on('reroll-dice', () => {
    const game = games.get(socket.gameId);
    if (!game) return;
    const result = game.rerollDice(socket.playerId);
    if (result.error) socket.emit('error', result.error);
    else {
      io.to(socket.gameId).emit('dice-rerolled', {
        playerId: socket.playerId,
        rolls: result.rolls,
        gold: result.gold,
        rerollsRemaining: result.rerollsRemaining
      });
    }
  });

  socket.on('activate-anjo-governante', () => {
    const game = games.get(socket.gameId);
    if (!game) return;
    const result = game.activateAnjoGovernante(socket.playerId);
    if (result.error) socket.emit('error', result.error);
    else {
      io.to(socket.gameId).emit('anjo-governante-activated', {
        playerId: socket.playerId,
        gold: result.gold,
        bonus: result.bonus,
        spent: result.spent
      });
    }
  });

  socket.on('choose-shop-option', ({ choseShop }) => {
    const game = games.get(socket.gameId);
    if (!game) return;
    const result = game.chooseShopOption(socket.playerId, choseShop);
    if (result.error) socket.emit('error', result.error);
    else io.to(socket.gameId).emit('shop-option-chosen', { playerId: socket.playerId, ...result });
  });

  socket.on('reroll-shop', () => {
    const game = games.get(socket.gameId);
    if (!game) return;
    const result = game.rerollShop(socket.playerId);
    if (result.error) socket.emit('error', result.error);
    else io.to(socket.gameId).emit('shop-updated', { shop: result.shop, gold: result.gold });
  });

  socket.on('buy-card', ({ cardInstanceId }) => {
    const game = games.get(socket.gameId);
    if (!game) return;
    const result = game.buyCard(socket.playerId, cardInstanceId);
    if (result.error) socket.emit('buy-error', result.error);
    else io.to(socket.gameId).emit('card-bought', { playerId: socket.playerId, hand: result.hand, gold: result.gold, shop: game.shop });
  });

  socket.on('place-card', ({ cardIndex, fieldPosition }) => {
    const game = games.get(socket.gameId);
    if (!game) return;
    const result = game.placeCard(socket.playerId, cardIndex, fieldPosition);
    if (result.error) socket.emit('place-error', result.error);
    else io.to(socket.gameId).emit('card-placed', { playerId: socket.playerId, field: result.field, hand: result.hand });
  });

  socket.on('return-card', ({ cardInstanceId, cardCost, fieldPosition }) => {
    const game = games.get(socket.gameId);
    if (!game) return;
    const player = game.getPlayerState(socket.playerId);
    if (!player) return;
    if (fieldPosition !== undefined && player.field[fieldPosition]) {
      const card = player.field[fieldPosition];
      if (card.instanceId === cardInstanceId) {
        player.field[fieldPosition] = null;
        player.gold += cardCost;
        game.shop.push(card);
        io.to(socket.gameId).emit('card-returned', { playerId: socket.playerId, field: player.field, gold: player.gold, shop: game.shop });
      }
    }
  });

  socket.on('finish-shopping', () => {
    const game = games.get(socket.gameId);
    if (!game) return;
    if (game.phase === 'buy') {
      game.phase = 'position';
      io.to(socket.gameId).emit('phase-changed', { phase: 'position', turn: game.turn });
    }
  });

  socket.on('finish-positioning', () => {
    const game = games.get(socket.gameId);
    if (!game) return;
    if (game.phase === 'position') {
      game.phase = 'combat';
      io.to(socket.gameId).emit('phase-changed', { phase: 'combat', turn: game.turn });
    }
  });

  socket.on('attack-player', () => {
    const game = games.get(socket.gameId);
    if (!game) return;
    
    const targetPlayerId = game.getRandomAttackTarget(socket.playerId);
    
    if (!targetPlayerId) {
      console.log(`⚠️ Nenhum alvo disponível para ${socket.playerId}. Encerrando turno...`);
      const result = game.endCurrentTurn();
      const updatedGameState = game.getGameState();
      io.to(socket.gameId).emit('game-state', updatedGameState);
      io.to(socket.gameId).emit('turn-ended', result);
      io.to(socket.gameId).emit('phase-changed', { phase: 'roll', turn: result.turn, nextPlayerId: result.nextPlayerId });
      return;
    }
    
    const attacker = game.getPlayerState(socket.playerId);
    const defender = game.getPlayerState(targetPlayerId);
    
    if (!attacker || !defender) return;
    
    const hasDesertNv5 = (attacker.synergies?.regions?.['Deserto'] || 0) >= 5;
    let annulledCard = null;
    
    if (hasDesertNv5 && defender.field.some(c => c !== null)) {
      for (let i = 0; i < defender.field.length; i++) {
        if (defender.field[i] !== null) {
          annulledCard = { position: i, card: defender.field[i] };
          defender.field[i] = null;
          console.log(`🏜️ Deserto Nv5: ${attacker.username} anulou a carta ${annulledCard.card.nome} de ${defender.username}!`);
          break;
        }
      }
    }
    
    const combatResult = game.calculateCombat(attacker, defender);
    
    io.to(socket.gameId).emit('combat-resolved', {
      attacker: combatResult.attacker,
      defender: combatResult.defender,
      netDamage: combatResult.netDamage,
      annulledCard: annulledCard
    });
    
    if (defender.life <= 0) {
      const alivePlayers = Object.values(game.players).filter(p => p.life > 0);
      
      if (alivePlayers.length <= 1) {
        const winner = alivePlayers[0];
        // Salvar partida no banco
        saveMatch(game, winner.playerId, defender.playerId);
        io.to(socket.gameId).emit('game-over', { 
          winner: { playerId: winner.playerId, username: winner.username }, 
          loser: { playerId: defender.playerId, username: defender.username } 
        });
        return;
      } else {
        io.to(socket.gameId).emit('player-eliminated', { 
          playerId: defender.playerId, 
          username: defender.username 
        });
        console.log(`💀 ${defender.username} foi eliminado!`);
      }
    }
    
    setTimeout(() => {
      const result = game.endCurrentTurn();
      const updatedGameState = game.getGameState();
      io.to(socket.gameId).emit('game-state', updatedGameState);
      io.to(socket.gameId).emit('turn-ended', result);
      io.to(socket.gameId).emit('phase-changed', { phase: 'roll', turn: result.turn, nextPlayerId: result.nextPlayerId });
    }, 2000);
  });

  socket.on('end-turn', () => {
    const game = games.get(socket.gameId);
    if (!game) return;
    
    const result = game.endCurrentTurn();
    const updatedGameState = game.getGameState();
    
    io.to(socket.gameId).emit('game-state', updatedGameState);
    io.to(socket.gameId).emit('turn-ended', result);
    io.to(socket.gameId).emit('phase-changed', { 
      phase: 'roll', 
      turn: result.turn, 
      nextPlayerId: result.nextPlayerId 
    });
  });

  socket.on('calculate-synergies', () => {
    const game = games.get(socket.gameId);
    if (!game) return;
    const synergies = game.calculateSynergies(socket.playerId);
    socket.emit('synergies-calculated', synergies);
  });

  socket.on('choose-copied-synergy', ({ region, level }) => {
    const game = games.get(socket.gameId);
    if (!game) return;
    
    const result = game.chooseCopiedSynergy(socket.playerId, region, level);
    if (result.error) {
      socket.emit('error', result.error);
    } else {
      io.to(socket.gameId).emit('synergy-copied', {
        playerId: socket.playerId,
        copiedSynergy: result.copiedSynergy,
        copiedLevel: result.copiedLevel
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const gameId = socket.gameId;
    const playerId = socket.playerId;
    if (gameId && playerId) {
      const game = games.get(gameId);
      if (game) {
        delete game.players[playerId];
        game.playerOrder = game.playerOrder.filter(id => id !== playerId);
        io.to(gameId).emit('player-left', { playerId });
      }
      const readyList = readyPlayersMap.get(gameId);
      if (readyList) {
        const index = readyList.indexOf(playerId);
        if (index !== -1) readyList.splice(index, 1);
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  console.log('Database disabled - running without database');
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};
startServer();

module.exports = { app, io, games };