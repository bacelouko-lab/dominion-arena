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
const disconnectTimers = new Map();

function generateShortCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Endpoint para Matchmaking Público
app.get('/api/games/public', (req, res) => {
  let availableGameId = null;

  for (const [gameId, game] of games.entries()) {
    const isLobbyPhase = game.turn === 0;
    const isNotFull = Object.keys(game.players).length < 6;
    
    if (game.isPublic && isLobbyPhase && isNotFull) {
      availableGameId = gameId;
      break;
    }
  }

  if (!availableGameId) {
    let exists = true;
    while (exists) {
      availableGameId = generateShortCode();
      exists = games.has(availableGameId);
    }
    const newGame = new GameLogic(availableGameId);
    newGame.isPublic = true;
    games.set(availableGameId, newGame);
    console.log(`🌍 Novo Lobby Público criado: ${availableGameId}`);
  } else {
    console.log(`🌍 Jogador encontrou Lobby Público existente: ${availableGameId}`);
  }

  res.json({ gameId: availableGameId, gameName: `Game ${availableGameId}` });
});

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

// Tabela de Pontos por Posição (Rank) e Número de Jogadores
const ELO_TABLE = {
  2: [+20, -20],
  3: [+25, -10, -15],
  4: [+25, +10, -10, -25],
  5: [+30, +15, -5, -15, -25],
  6: [+30, +20, +10, -10, -20, -30]
};

// ========== FUNÇÃO PARA SALVAR PARTIDA (RANKING) ==========
async function saveMatch(game, ranking) {
  console.log('🟢 saveMatch (Ranking) chamada!', { ranking });
  
  const { supabase } = require('./supabase');
  const numPlayers = ranking.length;
  const pointsTable = ELO_TABLE[numPlayers] || ELO_TABLE[2]; 

  try {
    for (let i = 0; i < numPlayers; i++) {
      const playerId = ranking[i];
      const rank = i + 1;
      const eloGain = pointsTable[i] || 0;
      const isWin = eloGain > 0;

      // Buscar ELO atual do jogador
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('elo, username, wins, losses')
        .eq('id', playerId)
        .single();

      if (userError) {
        console.error(`❌ Erro ao buscar jogador ${playerId}:`, userError);
        continue;
      }

      const oldElo = user.elo;
      const newElo = Math.max(0, oldElo + eloGain);

      console.log(`📊 ${user.username} - Rank ${rank} | ELO: ${oldElo} → ${newElo} (${eloGain > 0 ? '+' : ''}${eloGain})`);

      // Salvar entrada na tabela de matches (adaptado para ranking)
      const { error: matchError } = await supabase
        .from('matches')
        .insert({
          game_id: game.gameId,
          winner_id: playerId, // Aqui salvamos cada um mas com o rank no comentário ou nova coluna se existir
          winner_elo_before: oldElo,
          winner_elo_after: newElo,
          duration: game.turn,
          round: game.round
          // Nota: Seria ideal ter uma coluna 'rank' no banco futuramente.
        });

      // Atualizar o usuário
      const updateData = {
        elo: newElo
      };
      if (isWin) {
        updateData.wins = (user.wins || 0) + 1;
      } else {
        updateData.losses = (user.losses || 0) + 1;
      }

      await supabase
        .from('users')
        .update(updateData)
        .eq('id', playerId);

      // TELEMETRIA E BALANCEAMENTO
      const player = game.players[playerId];
      if (player) {
        const allCards = [...player.field, ...player.hand].filter(c => c !== null);
        for (const card of allCards) {
          await supabase.rpc('increment_card_stats', {
            p_card_id: card.id,
            p_card_name: card.nome.replace(' (Evoluída)', ''),
            p_is_win: isWin,
            p_is_evolved: card.isEvolved || false
          });
        }
        
        const synergies = player.synergies || { regions: {}, classes: {} };
        for (const [region, level] of Object.entries(synergies.regions)) {
          if (level > 0) {
            await supabase.rpc('increment_synergy_stats', {
              p_synergy_name: region, p_level: level, p_is_win: isWin
            });
          }
        }
        for (const [classe, level] of Object.entries(synergies.classes)) {
          if (level > 0) {
            await supabase.rpc('increment_synergy_stats', {
              p_synergy_name: classe, p_level: level, p_is_win: isWin
            });
          }
        }
      }
    }
    console.log('✅ saveMatch processada para todo o ranking!');
  } catch (err) {
    console.error('❌ Erro crítico em saveMatch:', err);
  }
}

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-game', ({ gameId, username, userId }) => {
    const game = games.get(gameId);
    if (!game) {
      socket.emit('error', 'Game not found');
      return;
    }
    const playerId = userId || uuidv4();
    game.addPlayer(playerId, username);
    playerSockets.set(playerId, socket.id);
    socket.join(gameId);
    socket.gameId = gameId;
    socket.playerId = playerId;
    
    // Cancela o timer de eliminação se ele existia
    const timerKey = `${gameId}-${playerId}`;
    if (disconnectTimers.has(timerKey)) {
      clearTimeout(disconnectTimers.get(timerKey));
      disconnectTimers.delete(timerKey);
      io.to(gameId).emit('player-reconnected', { playerId, username });
      console.log(`🔌 ${username} se reconectou a tempo na partida ${gameId}.`);
    }

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

  // ========== EVENTO DE VENDA DE CARTA ==========
  // ========== EVENTO DE POSICIONAMENTO LIVRE / TROCA ==========
  socket.on('reposition-card', ({ from, to }) => {
    const game = games.get(socket.gameId);
    if (!game) return;

    const result = game.repositionCard(socket.playerId, from, to);
    if (result.error) {
      socket.emit('error', result.error);
    } else {
      io.to(socket.gameId).emit('game-state', game.getGameState());
    }
  });

  socket.on('sell-card', ({ cardInstanceId, isField }) => {
    const game = games.get(socket.gameId);
    if (!game) return;

    const result = game.sellCard(socket.playerId, cardInstanceId, isField);
    if (result.error) {
      socket.emit('error', result.error);
    } else {
      io.to(socket.gameId).emit('game-state', game.getGameState());
      socket.emit('sell-success', { gold: result.gold });
    }
  });

  // ========== EVENTO DE ATAQUE MODIFICADO ==========
  socket.on('attack-player', async () => {
    const game = games.get(socket.gameId);
    if (!game || game.phase !== 'combat') return;

    // Trava de segurança: Verifica se é o dono do turno
    const currentPlayer = game.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.playerId !== socket.playerId) {
      console.log(`🚫 Tentativa de ataque inválida por ${socket.playerId}`);
      return;
    }
    
    // Muda a fase temporariamente para impedir cliques duplos durante o processamento do vídeo/animação no frontend
    game.phase = 'attacking';

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
    
    // Verifica se o defensor morreu
    if (defender.life <= 0) {
      console.log(`💀 Jogador morreu! ${defender.username} vida: ${defender.life}`);
      game.recordElimination(defender.playerId);
      
      const alivePlayers = Object.values(game.players).filter(p => p.life > 0);
      console.log(`👥 Jogadores vivos: ${alivePlayers.length}`);
      
      if (alivePlayers.length <= 1) {
        console.log(`🏆 FIM DE JOGO DETECTADO!`);
        const winner = alivePlayers[0];
        game.phase = 'end'; // Proteção contra sessões zumbi
        
        // Gerar Ranking Final: [Vencedor, ...Quem morreu por último, ..., Quem morreu primeiro]
        const finalRanking = [winner.playerId, ...[...game.eliminations].reverse()];
        
        try {
          await saveMatch(game, finalRanking);
        } catch (err) {
          console.error('❌ Erro ao salvar partida:', err);
        }
        io.to(socket.gameId).emit('game-over', { 
          winner: { playerId: winner.playerId, username: winner.username }, 
          ranking: finalRanking.map(id => ({ 
            playerId: id, 
            username: game.players[id]?.username 
          }))
        });
        
        // Limpa o jogo da memória após 2 minutos para dar tempo dos jogadores verem a tela de fim
        const finalGameId = socket.gameId;
        setTimeout(() => {
          if (games.has(finalGameId)) {
            console.log(`🧹 Limpeza: Removendo jogo finalizado ${finalGameId} da memória.`);
            games.delete(finalGameId);
            readyPlayersMap.delete(finalGameId);
          }
        }, 120000); 
        return;
      } else {
        console.log(`⚠️ Jogador eliminado, mas jogo continua. Vivos: ${alivePlayers.length}`);
        io.to(socket.gameId).emit('player-eliminated', { 
          playerId: defender.playerId, 
          username: defender.username 
        });
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
    
    // Bloqueia cliques duplos ou de pessoas que não estão no turno
    const currentPlayer = game.getCurrentPlayer();
    if (!currentPlayer || currentPlayer.playerId !== socket.playerId) {
      return; 
    }
    
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

  socket.on('reconnect-game', ({ gameId, username, playerId }) => {
    const game = games.get(gameId);
    if (!game) return;

    if (game.players[playerId]) {
      game.players[playerId].connected = true;
      socket.gameId = gameId;
      socket.playerId = playerId;
      socket.username = username;
      socket.join(gameId);
      
      // LIMPAR TIMER DE DESCONEXÃO
      const timerKey = `${gameId}-${playerId}`;
      if (disconnectTimers.has(timerKey)) {
        clearTimeout(disconnectTimers.get(timerKey));
        disconnectTimers.delete(timerKey);
        console.log(`✅ Timer de desconexão limpo para ${username}.`);
      }

      io.to(gameId).emit('player-reconnected', { playerId, username });
      io.to(gameId).emit('game-state', game.getGameState());
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    const gameId = socket.gameId;
    const playerId = socket.playerId;
    if (gameId && playerId) {
      const game = games.get(gameId);
      if (game) {
        if (game.phase === 'end') return;

        if (game.turn === 0) {
          delete game.players[playerId];
          game.playerOrder = game.playerOrder.filter(id => id !== playerId);
          io.to(gameId).emit('player-left', { playerId });
        } else {
          const player = game.players[playerId];
          if (player) {
            player.connected = false;
            
            // Notificar todos sobre a desconexão e o tempo de espera
            io.to(gameId).emit('player-disconnected', { 
              playerId, 
              username: player.username,
              timeoutMs: 60000 
            });
            
            console.log(`⏳ ${player.username} desconectou. Aguardando 60s antes de eliminar...`);

            const timerKey = `${gameId}-${playerId}`;
            const timerId = setTimeout(async () => {
              const checkGame = games.get(gameId);
              if (!checkGame || checkGame.phase === 'end') {
                disconnectTimers.delete(timerKey);
                return;
              }

              if (checkGame.players[playerId] && !checkGame.players[playerId].connected) {
                console.log(`💀 ${player.username} não voltou a tempo e foi eliminado.`);
                
                // IMPORTANTE: Verificar se era a vez dele ANTES de eliminar
                const currentPlayerBefore = checkGame.getCurrentPlayer();
                const wasHisTurn = currentPlayerBefore && currentPlayerBefore.playerId === playerId;
                
                checkGame.players[playerId].life = 0;
                checkGame.recordElimination(playerId);

                io.to(gameId).emit('player-eliminated', { playerId, username: player.username });
                io.to(gameId).emit('player-left', { playerId });
                disconnectTimers.delete(timerKey);
                
                // VERIFICAÇÃO DE VITÓRIA POR WO
                const alivePlayers = Object.values(checkGame.players).filter(p => p.life > 0);
                if (alivePlayers.length === 1 && checkGame.phase !== 'end') {
                  const winner = alivePlayers[0];
                  checkGame.phase = 'end';
                  
                  const finalRanking = [winner.playerId, ...[...checkGame.eliminations].reverse()];
                  try {
                    await saveMatch(checkGame, finalRanking);
                  } catch (err) { console.error('WO Save Error:', err); }

                  io.to(gameId).emit('game-over', { 
                    winner: { playerId: winner.playerId, username: winner.username },
                    ranking: finalRanking.map(id => ({ 
                      playerId: id, 
                      username: checkGame.players[id]?.username 
                    }))
                  });
                  return;
                }

                // FORÇAR PASSAGEM DE TURNO SE ERA A VEZ DELE
                if (wasHisTurn) {
                  console.log(`⏩ Passando turno do jogador eliminado por desconexão...`);
                  const result = checkGame.endCurrentTurn();
                  io.to(gameId).emit('game-state', checkGame.getGameState());
                  io.to(gameId).emit('turn-ended', result);
                } else {
                  // Apenas atualiza o estado para todos verem que ele morreu
                  io.to(gameId).emit('game-state', checkGame.getGameState());
                }
              }
            }, 60000);
            
            disconnectTimers.set(timerKey, timerId);
          }
        }
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