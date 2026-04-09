const cardsData = require('./dominion_cards.json');

class GameLogic {
  constructor(gameId) {
    this.gameId = gameId;
    this.players = {};
    this.playerOrder = [];
    this.currentPlayerIndex = 0;
    this.phase = 'roll';
    this.turn = 0;
    this.shop = [];
    this.round = 1;
    this.attackedThisRound = [];
    this.eliminations = []; // Ordem de eliminação (quem morrer primeiro fica no início)
  }

  addPlayer(playerId, username) {
    if (this.players[playerId]) {
      this.players[playerId].connected = true;
      return;
    }
    this.players[playerId] = {
      playerId,
      username,
      life: 20,
      gold: 0,
      dice: 1,
      diceRolls: [],
      savedPoints: 0,
      hand: [],
      field: Array(6).fill(null),
      deck: [],
      discard: [],
      synergies: { regions: {}, classes: {} },
      choseShop: false,
      hasActedThisTurn: false,
      shield: 0,
      healingReceived: 0,
      costReduction: 0,
      hasUsedInvulnerable: false,
      extraDiceBonus: 0,
      anjoGovernanteSpent: 0,
      anjoGovernanteBonus: 0,
      monstroDirectDamage: 0,
      freeCardUsed: false,
      abilityDoubleUsed: false,
      ladinoUsedThisAttack: false,
      copiedSynergy: null,
      copiedSynergyLevel: 0,
      rerollsRemaining: 2,
      hasRerolled: false,
      consecutiveSaves: 0,
      connected: true
    };
    this.playerOrder.push(playerId);
  }

  getCurrentPlayer() {
    if (this.playerOrder.length === 0) return null;
    return this.players[this.playerOrder[this.currentPlayerIndex]];
  }

  calculateDiceCount(player) {
    let diceCount = 1;
    const bonusDice = Math.floor(player.savedPoints / 4);
    diceCount += bonusDice;
    
    // Proteção contra azar (Bad Luck Protection / Pity System)
    if (player.consecutiveSaves >= 2) {
      diceCount = Math.max(diceCount, 2);
    }
    
    if (player.synergies?.regions?.['Céu'] >= 3) {
      diceCount = Math.max(diceCount, 2);
    }
    
    return Math.min(diceCount, 3);
  }

  resetPlayerForNextTurn(playerId) {
    const player = this.players[playerId];
    if (player) {
      player.hasActedThisTurn = false;
      player.choseShop = false;
      player.gold = 0;
      player.shield = 0;
      player.costReduction = 0;
      player.hasUsedInvulnerable = false;
      player.extraDiceBonus = 0;
      player.monstroDirectDamage = 0;
      player.freeCardUsed = false;
      player.abilityDoubleUsed = false;
      player.ladinoUsedThisAttack = false;
      // Oráculo do Lago (id:19) - reseta rerolls
      player.rerollsRemaining = 2;
      player.hasRerolled = false;
      // Anjo Governante (id:16) - mantém bônus, mas reseta gasto do turno
      player.anjoGovernanteSpent = 0;
    }
  }

  nextPlayer() {
    if (this.phase === 'end') return null; // Proteção contra sessões zumbi

    let nextIndex = (this.currentPlayerIndex + 1) % this.playerOrder.length;
    let attempts = 0;
    
    console.log(`🔄 nextPlayer: procurando próximo jogador...`);
    
    while (this.players[this.playerOrder[nextIndex]]?.life <= 0 && attempts < this.playerOrder.length) {
      console.log(`   ⏭️ Pulando ${this.players[this.playerOrder[nextIndex]]?.username} (morto)`);
      nextIndex = (nextIndex + 1) % this.playerOrder.length;
      attempts++;
    }
    
    const wrappedAround = nextIndex <= this.currentPlayerIndex;
    this.currentPlayerIndex = nextIndex;
    
    if (wrappedAround) {
      this.round++;
      console.log(`🆕 NOVO ROUND ${this.round}!`);
      this.attackedThisRound = [];
      console.log(`   🔄 Lista de atacados resetada!`);
    }
    
    const nextPlayer = this.getCurrentPlayer();
    console.log(`   ✅ Próximo jogador: ${nextPlayer?.username} (vida: ${nextPlayer?.life})`);
    
    if (nextPlayer && nextPlayer.life > 0) {
      this.resetPlayerForNextTurn(nextPlayer.playerId);
    }
    
    return nextPlayer;
  }

  recordElimination(playerId) {
    if (!this.eliminations.includes(playerId)) {
      this.eliminations.push(playerId);
      console.log(`💀 ELO: Registro de eliminação de ${this.players[playerId]?.username}. Ranking atual das mortes: ${this.eliminations.length}`);
    }
  }

  endCurrentTurn() {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer) {
      currentPlayer.hasActedThisTurn = true;
      this.applyEndOfTurnEffects(currentPlayer);
      
      // O ouro não gasto SE PERDE conforme regra.
      currentPlayer.gold = 0;
    }
    
    const nextPlayer = this.nextPlayer();
    this.phase = 'roll';
    this.turn++;
    
    return {
      nextPlayerId: nextPlayer?.playerId,
      nextPlayerUsername: nextPlayer?.username,
      turn: this.turn,
      round: this.round,
      phase: this.phase
    };
  }

  applyEndOfTurnEffects(player) {
    if (player.life <= 0) return; // Mortos não recebem efeitos de fim de turno
    const synergies = player.synergies || { regions: {}, classes: {} };
    
    if (synergies.classes?.['Suporte'] >= 2) {
      player.life = Math.min(20, player.life + 2);
      console.log(`💚 Suporte: ${player.username} curou 2`);
    }
    if (synergies.classes?.['Suporte'] >= 4) {
      player.life = Math.min(20, player.life + 3);
      console.log(`💚 Suporte Nv4: ${player.username} curou +3`);
    }
    if (synergies.regions?.['Floresta'] >= 6) {
      player.life = Math.min(20, player.life + 5);
      console.log(`🌲 Floresta Nv6: ${player.username} curou 5`);
    }
  }

  rollDice(playerId) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer?.playerId !== playerId) return { error: 'Not your turn' };
    if (player.hasActedThisTurn) return { error: 'You already acted this turn' };

    const diceCount = this.calculateDiceCount(player);
    player.dice = diceCount;
    
    // Regra hardcore: se o jogador conseguiu o direito de rolar mais de 1 dado, 
    // ele 'paga' a dívida perdendo todo o cofre na hora! E volta para a estaca zero.
    // Ignoramos extraDiceBonus (se vier de outros cantos), o cofre zera se os pontos dele geraram o dado extra.
    if (player.savedPoints >= 4) {
      player.savedPoints = 0;
    }
    
    let totalGold = 0;
    const rolls = [];
    
    const hasLakeNv6 = (player.synergies?.regions?.['Lago'] || 0) >= 6;
    
    for (let i = 0; i < diceCount; i++) {
      let roll;
      if (hasLakeNv6) {
        roll = 6;
      } else {
        roll = Math.floor(Math.random() * 6) + 1;
      }
      
      const hasCelestialDragon = player.field.some(c => c && c.id === 33 && c.isEvolved);
      if (hasCelestialDragon) {
        roll = 6;
      }
      
      rolls.push(roll);
      totalGold += roll;
    }
    
    player.diceRolls = rolls;
    player.gold = totalGold;
    
    // Consumir proteção contra azar se rolou 2 ou mais dados
    if (diceCount >= 2 && player.consecutiveSaves >= 2) {
      console.log(`🍀 Proteção de Azar: ${player.username} rolou ${diceCount} dados por guardar pontos consecutivamente!`);
      player.consecutiveSaves = 0;
    }
    
    const rollsInfo = [];
    if (player.consecutiveSaves >= 2) rollsInfo.push("Proteção de Azar");
    if (Math.floor((player.savedPoints + player.gold) / 4) > 0) rollsInfo.push(`Cofre: +${Math.floor(player.savedPoints / 4)}`);
    if (player.synergies?.regions?.['Céu'] >= 3) rollsInfo.push("Sinergia Céu Nv3");
    
    console.log(`🎲 ${player.username} rolou ${rolls.join(', ')} = ${totalGold} pontos ${rollsInfo.length > 0 ? '(' + rollsInfo.join(', ') + ')' : ''}`);
    if (hasLakeNv6) console.log(`🌊 Lago Nv6: todos os dados são 6!`);
    
    return { gold: totalGold, rolls, totalGold: player.gold, diceCount, savedPoints: player.savedPoints };
  }

  // ========== REROLL DADOS (ORÁCULO DO LAGO) ==========
  rerollDice(playerId) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    
    const oracleCard = player.field.find(c => c && c.id === 19 && c.isEvolved);
    if (!oracleCard) {
      return { error: 'Oráculo do Lago não está no campo ou não está evoluído' };
    }
    
    if (player.rerollsRemaining <= 0) {
      return { error: 'Sem rerolls disponíveis neste turno' };
    }
    
    const diceCount = player.dice;
    const newRolls = [];
    for (let i = 0; i < diceCount; i++) {
      newRolls.push(Math.floor(Math.random() * 6) + 1);
    }
    
    player.rerollsRemaining--;
    player.diceRolls = newRolls;
    
    const newGold = newRolls.reduce((a, b) => a + b, 0);
    player.gold = newGold;
    
    console.log(`🎲 ${player.username} rerrolou dados: ${newRolls.join(', ')} = ${newGold} pontos (${player.rerollsRemaining} rerolls restantes)`);
    
    return { 
      success: true, 
      rolls: newRolls, 
      gold: newGold, 
      rerollsRemaining: player.rerollsRemaining 
    };
  }

  // ========== ATIVAR ANJO GOVERNANTE ==========
  activateAnjoGovernante(playerId) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    
    const anjoCard = player.field.find(c => c && c.id === 16 && c.isEvolved);
    if (!anjoCard) {
      return { error: 'Anjo Governante não está no campo ou não está evoluído' };
    }
    
    if (player.gold < 1) {
      return { error: 'Ouro insuficiente' };
    }
    
    if (player.anjoGovernanteBonus >= 12) {
      return { error: 'Bônus máximo atingido (+12 ATK)' };
    }
    
    player.gold -= 1;
    player.anjoGovernanteSpent += 1;
    player.anjoGovernanteBonus += 2;
    
    console.log(`👼 ${player.username} ativou Anjo Governante: +2 ATK (total: +${player.anjoGovernanteBonus}, gastou ${player.anjoGovernanteSpent} ouro)`);
    
    return { 
      success: true, 
      gold: player.gold, 
      bonus: player.anjoGovernanteBonus,
      spent: player.anjoGovernanteSpent
    };
  }

  initializePool() {
    let pool = [];
    cardsData.forEach(card => {
      let copies = card.custo === 2 ? 4 : card.custo === 3 ? 3 : card.custo === 4 ? 2 : 1;
      for (let i = 0; i < copies; i++) {
        pool.push({ ...card });
      }
    });
    return pool;
  }

  generateShop(playerId) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    
    this.calculateSynergies(playerId);
    
    let costReduction = 0;
    const mercadorCount = player.synergies?.classes?.['Mercador'] || 0;
    if (mercadorCount >= 4) {
      costReduction = 3;
      console.log(`💰 Mercador Nv4 ativo: -3 custo nas cartas`);
    } else if (mercadorCount >= 2) {
      costReduction = 1;
      console.log(`💰 Mercador Nv2 ativo: -1 custo nas cartas`);
    }
    
    let shopSize = 3;
    if (player.dice === 2) shopSize = 4;
    else if (player.dice === 3) shopSize = 5;
    
    this.shop = [];
    const pool = this.initializePool();
    
    for (let i = 0; i < shopSize; i++) {
      if (pool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * pool.length);
      const selectedCard = pool[randomIndex];
      
      let custo = selectedCard.custo;
      if (costReduction > 0) {
        custo = Math.max(0, custo - costReduction);
      }
      
      const hasSkyNv5 = (player.synergies?.regions?.['Céu'] || 0) >= 5;
      if (hasSkyNv5 && !player.freeCardUsed && custo > 0) {
        custo = 0;
        player.freeCardUsed = true;
        console.log(`☁️ Céu Nv5: primeira carta grátis!`);
      }
      
      const newCard = { 
        ...selectedCard, 
        custo: custo,
        instanceId: `${selectedCard.id}-${Date.now()}-${Math.random()}`
      };
      this.shop.push(newCard);
    }
    return this.shop;
  }

  rerollShop(playerId) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    if (player.gold < 1) return { error: 'Not enough gold' };

    player.gold -= 1;
    
    this.calculateSynergies(playerId);
    
    let costReduction = 0;
    const mercadorCount = player.synergies?.classes?.['Mercador'] || 0;
    if (mercadorCount >= 4) {
      costReduction = 3;
    } else if (mercadorCount >= 2) {
      costReduction = 1;
    }
    
    let shopSize = 3;
    if (player.dice === 2) shopSize = 4;
    else if (player.dice === 3) shopSize = 5;
    
    const pool = this.initializePool();
    const newShop = [];
    for (let i = 0; i < shopSize; i++) {
      if (pool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * pool.length);
      const selectedCard = pool[randomIndex];
      
      let custo = selectedCard.custo;
      if (costReduction > 0) {
        custo = Math.max(0, custo - costReduction);
      }
      
      const newCard = { 
        ...selectedCard, 
        custo: custo,
        instanceId: `${selectedCard.id}-${Date.now()}-${Math.random()}`
      };
      newShop.push(newCard);
    }
    this.shop = newShop;
    return { shop: this.shop, gold: player.gold };
  }

  chooseShopOption(playerId, choseShop) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };

    player.choseShop = choseShop;

    if (!choseShop) {
      const pointsToSave = player.gold;
      // O ouro deve apenas SOMA no cofre
      player.savedPoints += pointsToSave;
      player.gold = 0;
      player.consecutiveSaves++;
      this.phase = 'combat';
    } else {
      // Deletado: O cofre não pode ser zerado ao abrir a aba shop!
      player.consecutiveSaves = 0;
      this.generateShop(playerId);
      this.phase = 'buy';
    }
    return { 
      choseShop, 
      phase: this.phase, 
      shop: choseShop ? this.shop : null, 
      gold: player.gold, 
      savedPoints: player.savedPoints 
    };
  }

  buyCard(playerId, cardInstanceId) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    const shopCardIndex = this.shop.findIndex(c => c.instanceId === cardInstanceId);
    if (shopCardIndex === -1) return { error: 'Card not found in shop' };
    const card = this.shop[shopCardIndex];
    if (player.gold < card.custo) return { error: 'Not enough gold' };
    if (player.hand.length >= 7) return { error: 'Hand is full' };
    
    player.gold -= card.custo;
    player.hand.push(card);
    this.shop.splice(shopCardIndex, 1);
    this.checkEvolution(playerId);
    
    return { success: true, hand: player.hand, gold: player.gold };
  }

  checkEvolution(playerId) {
    const player = this.players[playerId];
    if (!player) return player.hand;
    
    let evolved = true;
    let maxLoops = 10;
    
    while (evolved && maxLoops-- > 0) {
      evolved = false;
      
      const cardCount = {};
      const cardPositions = {};
      
      for (let i = 0; i < player.hand.length; i++) {
        const card = player.hand[i];
        if (card && !card.isEvolved) {
          const key = card.id;
          cardCount[key] = (cardCount[key] || 0) + 1;
          if (!cardPositions[key]) cardPositions[key] = [];
          cardPositions[key].push({ type: 'hand', index: i, card });
        }
      }
      
      for (let i = 0; i < player.field.length; i++) {
        const card = player.field[i];
        if (card && !card.isEvolved) {
          const key = card.id;
          cardCount[key] = (cardCount[key] || 0) + 1;
          if (!cardPositions[key]) cardPositions[key] = [];
          cardPositions[key].push({ type: 'field', index: i, card });
        }
      }
      
      for (const cardId in cardCount) {
        if (cardCount[cardId] >= 2) {
          const positions = cardPositions[cardId];
          if (positions && positions.length >= 2) {
            const originalCard = positions[0].card;
            
            const evolvedCard = {
              ...originalCard,
              nome: `${originalCard.nome} (Evoluída)`,
              atk: originalCard.atk,
              def: originalCard.def,
              isEvolved: true,
              evolucao: originalCard.evolucao || `${originalCard.nome} evoluiu!`,
              habilidade_ativa: true
            };
            
            if (positions[1].type === 'hand') {
              player.hand.splice(positions[1].index, 1);
            } else {
              player.field[positions[1].index] = null;
            }
            if (positions[0].type === 'hand') {
              player.hand.splice(positions[0].index, 1);
            } else {
              player.field[positions[0].index] = null;
            }
            
            player.hand.push(evolvedCard);
            
            console.log(`✨ EVOLUÇÃO: ${originalCard.nome} evoluiu!`);
            evolved = true;
            break;
          }
        }
      }
    }
    
    return player.hand;
  }

  placeCard(playerId, cardIndex, fieldPosition) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    if (fieldPosition >= player.field.length) return { error: 'Invalid field position' };
    if (cardIndex >= player.hand.length) return { error: 'Invalid card' };
    if (player.field[fieldPosition] !== null) return { error: 'Position already occupied' };
    
    const card = player.hand.splice(cardIndex, 1)[0];
    player.field[fieldPosition] = card;
    this.checkEvolution(playerId);
    this.calculateSynergies(playerId);
    
    return { success: true, field: player.field, hand: player.hand };
  }

  calculateSynergies(playerId) {
    const player = this.players[playerId];
    const synergies = { regions: {}, classes: {} };
    const fieldCards = player.field.filter(c => c !== null);
    
    for (const card of fieldCards) {
      if (card.regiao) synergies.regions[card.regiao] = (synergies.regions[card.regiao] || 0) + 1;
      if (card.classe) synergies.classes[card.classe] = (synergies.classes[card.classe] || 0) + 1;
    }
    
    player.synergies = synergies;
    return synergies;
  }

  chooseCopiedSynergy(playerId, region, level) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    
    const forestLevel = player.synergies?.regions?.['Floresta'] || 0;
    const requiredLevel = level === 5 ? 4 : 5;
    
    if (forestLevel < requiredLevel) {
      return { error: 'Sinergia Floresta não ativada no nível necessário' };
    }
    
    const regionLevel = player.synergies?.regions?.[region] || 0;
    if (regionLevel < level) {
      return { error: `Região ${region} não tem nível ${level}` };
    }
    
    player.copiedSynergy = region;
    player.copiedSynergyLevel = level;
    
    console.log(`🌲 Floresta Nv${requiredLevel}: ${player.username} copiou sinergia ${region} Nv${level}`);
    
    return { success: true, copiedSynergy: region, copiedLevel: level };
  }

  getRegionBonus(region, level) {
    const bonuses = {
      Vulcão: { 3: { atk: 3, def: 0 }, 5: { atk: 2, def: 0 }, 6: { atkMulti: 1.5 } },
      Montanha: { 3: { atk: 0, def: 3 }, 5: { atk: 2, def: 5 }, 6: { def: 5 } },
      Céu: { 3: { atk: 2, def: 0 }, 5: { atk: 3, def: 0 }, 6: { atk: 4, def: 0 } },
      Lago: { 3: { atk: 2, def: 0 }, 5: { def: 3 }, 6: { def: 4 } },
      Floresta: { 3: { atk: 2, def: 2 } },
      Deserto: { 3: { atk: 2, def: 0 } }
    };
    
    const bonus = bonuses[region]?.[level] || { atk: 0, def: 0 };
    return { atk: bonus.atk || 0, def: bonus.def || 0, multi: bonus.atkMulti || 1 };
  }

  applySynergyBonuses(player, isAttacking = true) {
    let synergies = player.synergies || { regions: {}, classes: {} };
    let atkBonus = 0;
    let defBonus = 0;
    let directDamage = 0;
    
    // Bônus do Anjo Governante (id:16)
    if (player.anjoGovernanteBonus > 0) {
      atkBonus += player.anjoGovernanteBonus;
      console.log(`👼 Anjo Governante: +${player.anjoGovernanteBonus} ATK`);
    }
    
    if (player.copiedSynergy && player.copiedSynergyLevel >= 5) {
      const copiedBonus = this.getRegionBonus(player.copiedSynergy, player.copiedSynergyLevel);
      atkBonus += copiedBonus.atk;
      defBonus += copiedBonus.def;
      console.log(`🌲 Floresta: copiando sinergia ${player.copiedSynergy} Nv${player.copiedSynergyLevel}`);
    }
    
    for (const [region, count] of Object.entries(synergies.regions)) {
      if (count >= 3) {
        if (region === 'Vulcão') atkBonus += 3;
        if (region === 'Montanha') defBonus += 3;
        if (region === 'Céu') atkBonus += 2;
        if (region === 'Lago') atkBonus += 2;
        if (region === 'Floresta') { atkBonus += 2; defBonus += 2; }
        if (region === 'Deserto') atkBonus += 2;
      }
      if (count >= 5) {
        if (region === 'Vulcão') {
          atkBonus += 2;
          directDamage += 3;
          console.log(`🔥 Vulcão Nv5: +2 ATK, +3 dano direto!`);
        }
        if (region === 'Montanha') { atkBonus += 2; defBonus += 5; }
        if (region === 'Céu') atkBonus += 3;
        if (region === 'Lago') defBonus += 3;
      }
      if (count >= 6) {
        if (region === 'Vulcão') atkBonus = Math.floor(atkBonus * 1.5);
        if (region === 'Montanha') defBonus += 5;
        if (region === 'Céu') atkBonus += 4;
        if (region === 'Lago') defBonus += 4;
      }
    }
    
    for (const [className, count] of Object.entries(synergies.classes)) {
      if (count >= 2) {
        if (className === 'Guerreiro') atkBonus += 2;
        if (className === 'Mago') {
          atkBonus += 1;
          directDamage += 2;
          console.log(`🔮 Mago Nv2: +1 ATK, +2 dano direto!`);
        }
        if (className === 'Ladino') atkBonus += 3;
        if (className === 'Suporte') defBonus += 2;
        if (className === 'Monstro') {
          atkBonus += 1;
          directDamage += 1;
          console.log(`🐲 Monstro Nv2: +1 ATK, +1 dano direto!`);
        }
        if (className === 'Mercador') {
          atkBonus += 1;
        }
        if (className === 'Dragão') { atkBonus += 3; defBonus += 2; }
      }
      if (count >= 4) {
        if (className === 'Guerreiro') defBonus += 4;
        if (className === 'Mago') {
          atkBonus += 3;
          directDamage += 2;
          console.log(`🔮 Mago Nv4: +3 ATK, +2 dano direto adicional!`);
        }
        if (className === 'Ladino') atkBonus += 4;
        if (className === 'Suporte') defBonus += 4;
        if (className === 'Monstro') {
          atkBonus += 2;
          directDamage += 3;
          console.log(`🐲 Monstro Nv4: +2 ATK, +3 dano direto adicional!`);
        }
        if (className === 'Mercador') {
          atkBonus += 2;
        }
      }
    }
    
    player.monstroDirectDamage = directDamage;
    return { atkBonus, defBonus, directDamage };
  }

  applyPassiveAbilities(player) {
    let atkBonus = 0;
    let defBonus = 0;
    
    for (const card of player.field) {
      if (card && card.isEvolved) {
        if (card.id === 1) atkBonus += 1;
        if (card.id === 8) defBonus += 5;
        if (card.id === 9) atkBonus += 5;
        if (card.id === 10) {
          const maxDef = Math.max(...player.field.filter(c => c).map(c => c.def), 0);
          if (card.def >= maxDef) defBonus += 6;
        }
        if (card.id === 11) player.shield = (player.shield || 0) + 2;
      }
    }
    
    return { atkBonus, defBonus };
  }

  shouldDiceAbilityActivate(player, diceRolls, condition) {
    const hasLakeNv5 = (player.synergies?.regions?.['Lago'] || 0) >= 5;
    if (hasLakeNv5) return true;
    return condition(diceRolls);
  }

  applyActiveAbilities(attacker, defender) {
    let directDamage = 0;
    let healing = 0;
    let reduceDefense = 0;
    let atkBonus = 0;
    let defBonus = 0;
    let attackMultiplier = 1;
    let doubleAbility = false;
    
    const hasMageNv4 = (attacker.synergies?.classes?.['Mago'] || 0) >= 4;
    const hasLadinoNv2 = (attacker.synergies?.classes?.['Ladino'] || 0) >= 2;
    const hasLadinoNv4 = (attacker.synergies?.classes?.['Ladino'] || 0) >= 4;
    const hasDragonNv2 = (attacker.synergies?.classes?.['Dragão'] || 0) >= 2;
    
    if (hasLadinoNv2) {
      reduceDefense += 2;
      console.log(`🗡️ Ladino Nv2: ignorando 2 DEF`);
    }
    
    if (hasDragonNv2) {
      attackMultiplier = 2;
      console.log(`🐉 Dragão Nv2: dano de dragões multiplicado por 2!`);
    }
    
    if (hasLadinoNv4 && !attacker.ladinoUsedThisAttack) {
      const defenderCards = defender.field.filter(c => c !== null);
      if (defenderCards.length > 0) {
        const randomIndex = Math.floor(Math.random() * defender.field.length);
        if (defender.field[randomIndex]) {
          const removedCard = defender.field[randomIndex];
          defender.field[randomIndex] = null;
          console.log(`🗡️ Ladino Nv4: anulou a carta ${removedCard.nome} de ${defender.username}!`);
          attacker.ladinoUsedThisAttack = true;
        }
      }
    }
    
    for (const card of attacker.field) {
      if (card && card.isEvolved) {
        const multiplier = (hasMageNv4 && !attacker.abilityDoubleUsed) ? 2 : 1;
        
        if (card.id === 2) { reduceDefense += 4 * multiplier; }
        if (card.id === 3) { directDamage += 2 * multiplier; }
        if (card.id === 4) { atkBonus += 6 * multiplier; }
        if (card.id === 6) { atkBonus += attacker.dice * 3 * multiplier; }
        if (card.id === 7) { defBonus += attacker.dice * 3 * multiplier; }
        if (card.id === 12) {
          const ceuCount = attacker.synergies?.regions?.['Céu'] || 0;
          if (ceuCount >= 3) atkBonus += 4 * multiplier;
        }
        if (card.id === 14) {
          const ceuCount = attacker.synergies?.regions?.['Céu'] || 0;
          atkBonus += ceuCount * 2 * multiplier;
        }
        
        const shouldActivate = this.shouldDiceAbilityActivate(attacker, attacker.diceRolls, (rolls) => {
          if (card.id === 17) return rolls.some(r => r % 2 === 0);
          if (card.id === 18) return rolls.some(r => r >= 5);
          if (card.id === 21) return rolls.some(r => r >= 4);
          return false;
        });
        
        if (card.id === 17 && shouldActivate) {
          atkBonus += 4 * multiplier;
          defBonus += 2 * multiplier;
        }
        if (card.id === 18 && shouldActivate) {
          atkBonus += 6 * multiplier;
        }
        if (card.id === 20) { atkBonus += attacker.dice * 5 * multiplier; }
        if (card.id === 21 && shouldActivate) {
          directDamage += 4 * multiplier;
        }
        if (card.id === 22) {
          const florestaCount = attacker.synergies?.regions?.['Floresta'] || 0;
          if (florestaCount >= 2) atkBonus += 6 * multiplier;
        }
        if (card.id === 23) {
          const florestaCount = attacker.synergies?.regions?.['Floresta'] || 0;
          atkBonus += 3 * multiplier;
          defBonus += florestaCount * 2 * multiplier;
        }
        if (card.id === 24) {
          const florestaCount = attacker.synergies?.regions?.['Floresta'] || 0;
          atkBonus += florestaCount * 2 * multiplier;
        }
        if (card.id === 26) { reduceDefense += 3 * multiplier; }
        if (card.id === 28) {
          const desertoCount = attacker.synergies?.regions?.['Deserto'] || 0;
          reduceDefense += desertoCount * 2 * multiplier;
        }
        if (card.id === 29) { reduceDefense += 4 * multiplier; defBonus += 3 * multiplier; }
        if (card.id === 31) { directDamage += 3 * multiplier; }
        if (card.id === 32 && !defender.hasUsedInvulnerable) {
          defBonus += 999;
          defender.hasUsedInvulnerable = true;
        }
        if (card.id === 34) { attackMultiplier *= 0.5; }
      }
    }
    
    if (hasMageNv4 && !attacker.abilityDoubleUsed) {
      attacker.abilityDoubleUsed = true;
      console.log(`🔮 Mago Nv4: habilidades ativadas 2x neste turno!`);
    }
    
    if (hasDragonNv2) {
      atkBonus *= 2;
      directDamage *= 2;
    }
    
    return { directDamage, healing, reduceDefense, atkBonus, defBonus, attackMultiplier };
  }

  getRandomAttackTarget(attackerId) {
    if (this.round === 1) {
      console.log(`🚫 Round 1: Ataques bloqueados!`);
      return null;
    }
    
    console.log(`\n🎯 --- ATAQUE DE ${this.players[attackerId]?.username} ---`);
    console.log(`   Round atual: ${this.round}`);
    console.log(`   Jogadores atacados neste round: ${this.attackedThisRound.map(id => this.players[id]?.username).join(', ') || 'nenhum'}`);
    
    const alivePlayers = [];
    for (const [playerId, player] of Object.entries(this.players)) {
      if (player.life > 0) {
        alivePlayers.push(playerId);
      }
    }
    console.log(`   Jogadores vivos: ${alivePlayers.map(id => this.players[id]?.username).join(', ')}`);
    
    const availableTargets = [];
    for (const playerId of alivePlayers) {
      if (playerId !== attackerId && !this.attackedThisRound.includes(playerId)) {
        availableTargets.push(playerId);
      }
    }
    
    console.log(`   Alvos disponíveis: ${availableTargets.map(id => this.players[id]?.username).join(', ') || 'nenhum'}`);
    
    if (availableTargets.length === 0) {
      console.log(`   ⚠️ NENHUM ALVO DISPONÍVEL! ${this.players[attackerId]?.username} não atacará neste turno.`);
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * availableTargets.length);
    const targetId = availableTargets[randomIndex];
    
    this.attackedThisRound.push(targetId);
    
    console.log(`   ✅ ATAQUE: ${this.players[attackerId]?.username} → ${this.players[targetId]?.username}`);
    console.log(`   Jogadores atacados atualizado: ${this.attackedThisRound.map(id => this.players[id]?.username).join(', ')}`);
    
    return targetId;
  }

  calculateCombat(attacker, defender) {
    console.log(`\n========== INÍCIO DO COMBATE ==========`);
    
    // Sacerdote do Sol (id:30) - Anula sinergias do atacante
    const hasSunPriest = defender.field.some(c => c && c.id === 30 && c.isEvolved);
    const hasDesertNv6 = (defender.synergies?.regions?.['Deserto'] || 0) >= 6;
    
    const attackerSynBonuses = this.applySynergyBonuses(attacker, true);
    let defenderSynBonuses = this.applySynergyBonuses(defender, false);
    
    if (hasSunPriest) {
      console.log(`☀️ Sacerdote do Sol: ${defender.username} anulou as sinergias do atacante!`);
      attackerSynBonuses.atkBonus = 0;
      attackerSynBonuses.directDamage = 0;
    }
    
    if (hasDesertNv6) {
      console.log(`🏜️ Deserto Nv6: ${defender.username} anulou sinergias do atacante!`);
      attackerSynBonuses.atkBonus = 0;
      attackerSynBonuses.directDamage = 0;
    }
    
    const attackerPassiveBonuses = this.applyPassiveAbilities(attacker);
    const defenderPassiveBonuses = this.applyPassiveAbilities(defender);
    
    const evolvedEffects = this.applyActiveAbilities(attacker, defender);
    
    let defenderBaseDef = 0;
    for (const card of defender.field) {
      if (card && card.def) defenderBaseDef += card.def;
    }
    
    let defenderTotalDef = defenderBaseDef + defenderSynBonuses.defBonus + defenderPassiveBonuses.defBonus + evolvedEffects.defBonus;
    
    console.log(`   🛡️ DEF ${defender.username}: ${defenderBaseDef} (Base) + ${defenderSynBonuses.defBonus} (Sinergia) + ${defenderPassiveBonuses.defBonus} (Passiva) + ${evolvedEffects.defBonus} (Ativa) = ${defenderTotalDef}`);
    
    if (evolvedEffects.reduceDefense > 0) {
      defenderTotalDef = Math.max(0, defenderTotalDef - evolvedEffects.reduceDefense);
    }
    
    if (defender.shield > 0) {
      defenderTotalDef += defender.shield;
      defender.shield = 0;
    }
    
    let attackerBaseAtk = 0;
    for (const card of attacker.field) {
      if (card && card.atk) attackerBaseAtk += card.atk;
    }
    
    let attackerTotalAtk = attackerBaseAtk + attackerSynBonuses.atkBonus + attackerPassiveBonuses.atkBonus + evolvedEffects.atkBonus;
    
    console.log(`   ⚔️ ATK ${attacker.username}: ${attackerBaseAtk} (Base) + ${attackerSynBonuses.atkBonus} (Sinergia) + ${attackerPassiveBonuses.atkBonus} (Passiva) + ${evolvedEffects.atkBonus} (Ativa) = ${attackerTotalAtk}`);
    
    if (evolvedEffects.attackMultiplier < 1) {
      attackerTotalAtk = Math.floor(attackerTotalAtk * evolvedEffects.attackMultiplier);
    }
    
    let damage = attackerTotalAtk - defenderTotalDef;
    if (damage < 0) damage = 0;
    
    const hasAttackerCards = attacker.field.some(card => card !== null);
    if (damage === 0 && hasAttackerCards) {
      damage = 1;
      console.log(`   🔸 Dano mínimo aplicado (+1)`);
    }


    let totalDirectDamage = 0;
    if (attackerSynBonuses.directDamage) totalDirectDamage += attackerSynBonuses.directDamage;
    if (evolvedEffects.directDamage) totalDirectDamage += evolvedEffects.directDamage;
    
    if (totalDirectDamage > 0) {
      console.log(`   ✨ Dano Direto: +${totalDirectDamage}`);
    }
    
    damage += totalDirectDamage;
    
    const oldLife = defender.life;
    defender.life = Math.max(0, defender.life - damage);
    const actualDamage = oldLife - defender.life;
    
    console.log(`💥 Dano: ${damage} | Vida: ${oldLife} → ${defender.life}`);
    console.log(`========== FIM DO COMBATE ==========\n`);
    
    return {
      attacker: { 
        playerId: attacker.playerId, 
        username: attacker.username, 
        totalAtk: attackerTotalAtk, 
        life: attacker.life 
      },
      defender: { 
        playerId: defender.playerId, 
        username: defender.username, 
        totalDef: defenderTotalDef, 
        life: defender.life, 
        damageTaken: actualDamage 
      },
      netDamage: actualDamage
    };
  }

  getPlayerState(playerId) {
    return this.players[playerId] || null;
  }

  getGameState() {
    const currentPlayer = this.getCurrentPlayer();
    return {
      gameId: this.gameId,
      phase: this.phase,
      turn: this.turn,
      round: this.round,
      shop: this.shop,
      currentPlayerId: currentPlayer?.playerId,
      currentPlayerUsername: currentPlayer?.username,
      players: Object.values(this.players).map(p => ({
        playerId: p.playerId,
        username: p.username,
        life: p.life,
        gold: p.gold,
        hand: p.hand,
        field: p.field,
        dice: p.dice,
        savedPoints: p.savedPoints,
        choseShop: p.choseShop,
        synergies: p.synergies,
        copiedSynergy: p.copiedSynergy,
        copiedSynergyLevel: p.copiedSynergyLevel,
        anjoGovernanteBonus: p.anjoGovernanteBonus,
        rerollsRemaining: p.rerollsRemaining,
        isCurrentTurn: p.playerId === currentPlayer?.playerId
      }))
    };
  }
}

module.exports = GameLogic;