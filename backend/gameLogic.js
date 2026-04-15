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
    this.eliminations = [];
    this.pool = this.initializePool(); // Deck Global compartilhado
    this.shufflePool();
  }

  shufflePool() {
    for (let i = this.pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pool[i], this.pool[j]] = [this.pool[j], this.pool[i]];
    }
  }

  returnCardToPool(card) {
    if (!card) return;

    // Se a carta for evoluída, ela conta como 2 cópias no pool
    const numCopies = card.isEvolved ? 2 : 1;

    // Limpar propriedades temporárias
    const baseCard = cardsData.find(c => c.id === card.id);
    if (!baseCard) return;

    for (let i = 0; i < numCopies; i++) {
      this.pool.push({ ...baseCard });
    }

    this.shufflePool();
    console.log(`♻️ Pool: ${numCopies} cópia(s) de ${baseCard.nome} retornaram ao deck global. Total no deck: ${this.pool.length}`);
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

    if (player.synergies?.regions?.['Aether'] >= 3) {
      diceCount = Math.max(diceCount, 2);
    }

    return Math.min(diceCount, 3);
  }

  resetPlayerForNextTurn(playerId) {
    const player = this.players[playerId];
    if (player) {
      player.hasActedThisTurn = false;
      player.choseShop = false;
      player.shield = 0;
      player.costReduction = 0;
      player.goldBonus = 0;
      player.healingEndOfTurn = 0;
      player.reflectDamage = 0;
      player.extraMaxLife = 0;
      player.ignoreDefense = false;
      player.maxDamageTaken = 0;
      player.symbiosisActive = false;
      player.wisdomBonus = false;
      player.transcendence = false;
      player.damageReduction = 0;
      player.critChance = 0;
      player.hasExecutionAbility = false;
      player.directDamageBlocked = false;
      player.hasUsedInvulnerable = false;
      player.extraDiceBonus = 0;
      player.monstroDirectDamage = 0;
      player.freeCardUsed = false;
      player.abilityDoubleUsed = false;
      player.ladinoUsedThisAttack = false;
      // Oráculo (Arquimago Celeste id:22)
      player.rerollsRemaining = 2;
      player.hasRerolled = false;
      // Anjo Governante (Avatar de Helios id:8)
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

      // DEVOLVER CARTAS AO POOL GLOBAL
      const player = this.players[playerId];
      if (player) {
        player.hand.forEach(card => this.returnCardToPool(card));
        player.field.forEach(card => this.returnCardToPool(card));
        player.hand = [];
        player.field = Array(6).fill(null);
        console.log(`♻️ Pool: Todas as cartas de ${player.username} foram devolvidas ao deck global.`);
      }
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

    if (synergies.classes?.['Zelador'] >= 2) {
      player.life = Math.min(20, player.life + 2);
      console.log(`💚 Zelador: ${player.username} curou 2`);
    }
    if (synergies.classes?.['Zelador'] >= 4) {
      player.life = Math.min(20, player.life + 3);
      console.log(`💚 Zelador Nv4: ${player.username} curou +3`);
    }
    if (synergies.regions?.['Veridian'] >= 2) {
      const heal = (player.healingEndOfTurn || 0) + 2;
      const maxL = player.extraMaxLife ? 20 + player.extraMaxLife : 20;
      player.life = Math.min(maxL, player.life + heal);
      console.log(`🌿 Veridian: ${player.username} curou ${heal} (Limite: ${maxL})`);
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

    const hasAetherNv5 = (player.synergies?.regions?.['Aether'] || 0) >= 5;

    for (let i = 0; i < diceCount; i++) {
      let roll;
      if (hasAetherNv5) {
        roll = 6;
      } else {
        roll = Math.floor(Math.random() * 6) + 1;
      }

      const hasSoberanoEter = player.field.some(c => c && c.id === 14 && c.isEvolved);
      if (hasSoberanoEter) {
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
    if (player.synergies?.regions?.['Aether'] >= 3) rollsInfo.push("Sinergia Aether Nv3");

    console.log(`🎲 ${player.username} rolou ${rolls.join(', ')} = ${totalGold} pontos ${rollsInfo.length > 0 ? '(' + rollsInfo.join(', ') + ')' : ''}`);
    if (hasAetherNv5) console.log(`🪄 Aether Nv5: todos os dados são 6!`);

    return { gold: totalGold, rolls, totalGold: player.gold, diceCount, savedPoints: player.savedPoints };
  }

  // ========== REROLL DADOS (ORÁCULO DO LAGO) ==========
  rerollDice(playerId) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };

    const oracleCard = player.field.find(c => c && c.id === 13 && c.isEvolved);
    if (!oracleCard) {
      return { error: 'Arquimago Celeste não está no campo ou não está evoluído' };
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

    const anjoCard = player.field.find(c => c && (c.id === 3 || c.id === 6) && c.isEvolved);
    if (!anjoCard) {
      return { error: 'Invocador do Sol ou Colosso de Aço não está no campo ou não está evoluído' };
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
      let copies = card.custo === 2 ? 4 : card.custo === 3 ? 3 : card.custo === 5 ? 2 : 1;
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
    const eruditoCount = player.synergies?.classes?.['Erudito'] || 0;
    if (eruditoCount >= 4) {
      costReduction = 4;
    } else if (eruditoCount >= 2) {
      costReduction = 2;
    }

    let shopSize = 3;
    if (player.dice === 2) shopSize = 4;
    else if (player.dice === 3) shopSize = 5;

    this.shop = [];

    for (let i = 0; i < shopSize; i++) {
      if (this.pool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * this.pool.length);
      const selectedCard = this.pool.splice(randomIndex, 1)[0];

      let custo = selectedCard.custo;
      if (costReduction > 0) {
        custo = Math.max(0, custo - costReduction);
      }

      const hasAetherNv4 = (player.synergies?.regions?.['Aether'] || 0) >= 4;
      if (hasAetherNv4 && !player.freeCardUsed && custo > 0) {
        custo = 0;
        player.freeCardUsed = true;
        console.log(`🪄 Aether Nv4: primeira carta grátis!`);
      }

      const newCard = {
        ...selectedCard,
        custo: custo,
        instanceId: `${selectedCard.id}-${Date.now()}-${Math.random()}`
      };
      this.shop.push(newCard);
    }
    console.log(`🛒 Shop: ${this.shop.length} cartas geradas para ${player.username}. Deck restante: ${this.pool.length}`);
    return this.shop;
  }

  rerollShop(playerId) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    if (player.gold < 1) return { error: 'Not enough gold' };

    player.gold -= 1;

    // Devolver cartas atuais da loja ao pool antes do reroll
    this.shop.forEach(card => this.returnCardToPool(card));
    this.shop = [];

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

    const newShop = [];
    for (let i = 0; i < shopSize; i++) {
      if (this.pool.length === 0) break;
      const randomIndex = Math.floor(Math.random() * this.pool.length);
      const selectedCard = this.pool.splice(randomIndex, 1)[0];

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
    console.log(`🎲 Reroll: Loja atualizada. Deck restante: ${this.pool.length}`);
    return { shop: this.shop, gold: player.gold };
  }

  chooseShopOption(playerId, choseShop) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };

    player.choseShop = choseShop;

    if (!choseShop) {
      // Devolver cartas que estavam na loja ao pool se escolher NÃO ver a loja
      if (this.shop && this.shop.length > 0) {
        this.shop.forEach(card => this.returnCardToPool(card));
        this.shop = [];
      }
      const pointsToSave = player.gold;
      player.savedPoints += pointsToSave;
      player.gold = 0;
      player.consecutiveSaves++;
      this.phase = 'combat';
    } else {
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

    // Armazenar o preço pago para a recompra (venda) correta
    const cardToBuy = { ...card, purchasePrice: card.custo };

    player.hand.push(cardToBuy);
    this.shop.splice(shopCardIndex, 1);
    this.checkEvolution(playerId);

    return { success: true, hand: player.hand, gold: player.gold };
  }

  sellCard(playerId, cardInstanceId, isField) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };

    let card = null;
    let cardIndex = -1;

    if (isField) {
      cardIndex = player.field.findIndex(c => c && c.instanceId === cardInstanceId);
      if (cardIndex !== -1) {
        card = player.field[cardIndex];
        player.field[cardIndex] = null;
      }
    } else {
      cardIndex = player.hand.findIndex(c => c && c.instanceId === cardInstanceId);
      if (cardIndex !== -1) {
        card = player.hand[cardIndex];
        player.hand.splice(cardIndex, 1);
      }
    }

    if (!card) return { error: 'Carta não encontrada para venda' };

    // Devolver o ouro gasto (ou 1 se não houver purchasePrice por algum erro)
    const refund = card.purchasePrice !== undefined ? card.purchasePrice : 1;
    player.gold += refund;

    // Devolver carta ao pool global
    this.returnCardToPool(card);

    this.calculateSynergies(playerId);

    console.log(`💰 VENDA: ${player.username} vendeu ${card.nome} por ${refund} ouro.`);

    return {
      success: true,
      gold: player.gold,
      hand: player.hand,
      field: player.field,
      synergies: player.synergies
    };
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

            // Determinar posição do destino: se alguma estava no FIELD, a evoluída fica no FIELD
            const fieldPos = positions.find(p => p.type === 'field');
            
            // Remover as originais
            positions.sort((a, b) => (b.type === 'hand' ? b.index : 99) - (a.type === 'hand' ? a.index : 99));
            
            positions.slice(0, 2).forEach(pos => {
              if (pos.type === 'hand') {
                player.hand.splice(pos.index, 1);
              } else {
                player.field[pos.index] = null;
              }
            });

            if (fieldPos) {
              player.field[fieldPos.index] = evolvedCard;
            } else {
              player.hand.push(evolvedCard);
            }

            console.log(`✨ EVOLUÇÃO: ${originalCard.nome} evoluiu no ${fieldPos ? 'Campo' : 'Mão'}!`);
            evolved = true;
            break;
          }
        }
      }
    }

    return player.hand;
  }

  repositionCard(playerId, from, to) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };

    let cardFrom = null;
    let cardTo = null;

    // 1. Obter a carta de origem
    if (from.type === 'hand') {
      if (from.index >= player.hand.length) return { error: 'Invalid hand index' };
      cardFrom = player.hand[from.index];
    } else if (from.type === 'field') {
      if (from.index >= player.field.length) return { error: 'Invalid field index' };
      cardFrom = player.field[from.index];
    }

    if (!cardFrom) return { error: 'No card found at source' };

    // 2. Obter a carta de destino (para Swap)
    if (to.type === 'hand') {
      if (to.index !== undefined && to.index < player.hand.length) {
        cardTo = player.hand[to.index];
      }
    } else if (to.type === 'field') {
      if (to.index >= player.field.length) return { error: 'Invalid target field index' };
      cardTo = player.field[to.index];
    }

    // 3. Executar o Mover ou Trocar
    // Remover a carta da origem
    if (from.type === 'hand') {
      player.hand.splice(from.index, 1);
    } else {
      player.field[from.index] = null;
    }

    // Lógica para o Destino
    if (to.type === 'hand') {
      // Se estamos movendo para a mão, apenas damos um push (não importa o index do drop na mão)
      player.hand.push(cardFrom);
      // Se havia uma carta no destino (apenas se for Swap de campo para mão, o que é raro mas possível)
      if (cardTo && from.type === 'field') {
        player.field[from.index] = cardTo;
      }
    } else if (to.type === 'field') {
      if (cardTo) {
        // SWAP: Colocar a carta que estava no destino na origem
        if (from.type === 'hand') {
          player.hand.splice(from.index, 0, cardTo);
        } else {
          player.field[from.index] = cardTo;
        }
      }
      player.field[to.index] = cardFrom;
    }

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
      Solari: { 2: { atk: 4, def: 0 }, 4: { directDamage: 4 }, 5: { attackMultiplier: 1.5 } },
      Gladius: { 2: { atk: 0, def: 4 }, 4: { reflectDamage: 0.5 }, 5: { maxDamageTaken: 5 } },
      Aether: { 2: { goldBonus: 2 }, 4: { freeReroll: true }, 5: { ignoreDefense: true } },
      Veridian: { 2: { healingEndOfTurn: 2 }, 4: { extraMaxLife: 8 }, 5: { symbiosisActive: true } },
      Umbra: { 2: { atk: 2, def: 0 }, 4: { atk: 0, def: 6 }, 5: { directDamage: 6 } }
    };

    const bonus = bonuses[region]?.[level] || { atk: 0, def: 0 };
    return { 
      atk: bonus.atk || 0, 
      def: bonus.def || 0, 
      multi: bonus.attackMultiplier || 1,
      directDamage: bonus.directDamage || 0,
      reflectDamage: bonus.reflectDamage || 0,
      maxDamageTaken: bonus.maxDamageTaken || 0,
      ignoreDefense: bonus.ignoreDefense || false
    };
  }

  applySynergyBonuses(player) {
    let synergies = player.synergies || { regions: {}, classes: {} };
    let bonuses = {
      atkBonus: 0,
      defBonus: 0,
      directDamage: 0,
      attackMultiplier: 1,
      shield: 0,
      reflectDamage: 0,
      goldBonus: 0,
      healingEndOfTurn: 0,
      extraMaxLife: 0,
      ignoreDefense: false,
      maxDamageTaken: 0,
      symbiosisActive: false,
      wisdomBonus: false,
      transcendence: false,
      damageReduction: 0,
      critChance: 0
    };

    // Bônus do Anjo Governante
    if (player.anjoGovernanteBonus > 0) {
      bonuses.atkBonus += player.anjoGovernanteBonus;
    }

    // Novas Sinergias de Região (2, 4, 5)
    for (const [region, count] of Object.entries(synergies.regions)) {
      if (count >= 2) {
        if (region === 'Solari') bonuses.atkBonus += 4;
        if (region === 'Gladius') bonuses.defBonus += 4;
        if (region === 'Aether') bonuses.goldBonus += 2;
        if (region === 'Veridian') bonuses.healingEndOfTurn += 2;
        if (region === 'Umbra') bonuses.atkBonus += 2; 
      }
      if (count >= 4) {
        if (region === 'Solari') bonuses.directDamage += 4;
        if (region === 'Gladius') bonuses.reflectDamage = 0.5;
        if (region === 'Aether') bonuses.freeReroll = true;
        if (region === 'Veridian') bonuses.extraMaxLife = 8;
        if (region === 'Umbra') bonuses.defBonus += 6;
      }
      if (count >= 5) {
        if (region === 'Solari') bonuses.attackMultiplier *= 1.5;
        if (region === 'Gladius') bonuses.maxDamageTaken = 5;
        if (region === 'Aether') bonuses.ignoreDefense = true;
        if (region === 'Veridian') bonuses.symbiosisActive = true;
        if (region === 'Umbra') bonuses.directDamage += 6;
      }
    }

    // Novas Sinergias de Classe (2, 4)
    for (const [className, count] of Object.entries(synergies.classes)) {
      if (count >= 2) {
        if (className === 'Vanguarda') bonuses.defBonus += 5;
        if (className === 'Algoz') bonuses.atkBonus += 5;
        if (className === 'Erudito') bonuses.wisdomBonus = true;
        if (className === 'Zelador') bonuses.shield = 4;
      }
      if (count >= 4) {
        if (className === 'Vanguarda') bonuses.damageReduction = 2;
        if (className === 'Algoz') bonuses.critChance = 0.4;
        if (className === 'Erudito') bonuses.transcendence = true;
        if (className === 'Zelador') {
          // A cura aqui é um efeito "on-combat-start", vamos processar no final do cálculo
          bonuses.healingOnCombat = 3;
          bonuses.atkBonus += 2;
        }
      }
    }

    // Cálculo de Simbiose (Veridian 5)
    if (bonuses.symbiosisActive) {
      let vanguardaCount = synergies.classes['Vanguarda'] || 0;
      bonuses.atkBonus += vanguardaCount * 2;
    }

    return bonuses;
  }

  // As habilidades passivas agora são processadas diretamente em applyActiveAbilities ou applySynergyBonuses para simplificar o fluxo.
  applyPassiveAbilities(player) {
    return { atkBonus: 0, defBonus: 0 };
  }

  shouldDiceAbilityActivate(player, diceRolls, condition) {
    return condition(diceRolls);
  }

  applyActiveAbilities(attacker, defender) {
    let directDamage = 0;
    let healing = 0;
    let reduceDefense = 0;
    let atkBonus = 0;
    let defBonus = 0;
    let attackMultiplier = 1;

    // Erudito Nv4: Transcendência (Dobra habilidades)
    const multiplier = attacker.transcendence ? 2 : 1;

    for (const card of attacker.field) {
      if (card && card.isEvolved) {
        // SOLARI (1-5)
        if (card.id === 1) { defBonus += 4 * multiplier; directDamage += 2 * multiplier; }
        if (card.id === 2) { /* Fênix: logic in player death or combat end */ }
        if (card.id === 3 || card.id === 15) { /* Transcendence logic already handled by 'multiplier' variable if we assume it stacks */ }
        if (card.id === 4) { healing += 4 * multiplier; }
        if (card.id === 5) { defBonus += 3 * multiplier; directDamage += 1 * multiplier; }

        // GLADIUS (6-10)
        if (card.id === 6) { defender.directDamageBlocked = true; }
        if (card.id === 7) { attacker.ignoreDefensePercent = (attacker.ignoreDefensePercent || 0) + 0.5 * multiplier; }
        if (card.id === 8) { attacker.reflectDamage = (attacker.reflectDamage || 0) + 0.5 * multiplier; }
        if (card.id === 9) { attacker.damageReduction = (attacker.damageReduction || 0) + 5 * multiplier; }
        if (card.id === 10) { 
          const gladiusCount = attacker.synergies?.regions?.['Gladius'] || 0;
          if (gladiusCount >= 2) atkBonus += 5 * multiplier;
        }

        // AETHER (11-15)
        if (card.id === 11) { directDamage += 3 * multiplier; }
        if (card.id === 12) { attacker.ignoreDefense = true; }
        if (card.id === 13) { /* Reroll bonus handled in rerollShop/rerollDice functions? */ }
        if (card.id === 14) { /* Gold dice 6 handled in rollDice */ }

        // VERIDIAN (16-20)
        if (card.id === 16) { defBonus += 6 * multiplier; healing += 2 * multiplier; }
        if (card.id === 17) { atkBonus += Math.floor(attacker.life * 0.2) * multiplier; }
        if (card.id === 18) { healing += 5 * multiplier; }
        if (card.id === 19) { /* Revive logic in combat end */ }
        if (card.id === 20) { healing += 5 * multiplier; }

        // UMBRA (21-25)
        if (card.id === 21) { attacker.reflectDamage = (attacker.reflectDamage || 0) + 0.5 * multiplier; }
        if (card.id === 22) { attacker.hasExecutionAbility = true; }
        if (card.id === 23) { directDamage += 5 * multiplier; }
        if (card.id === 24) { attacker.swapStatsAbility = true; }
        if (card.id === 25) { healing += 4 * multiplier; directDamage += 4 * multiplier; }
      }
    }

    // Algoz Nv4: Crítico
    if (attacker.critChance > 0) {
      if (Math.random() < attacker.critChance) {
        attackMultiplier *= 2;
        console.log(`🎯 CRÍTICO! Dano multiplicado por 2.`);
      }
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
    console.log(`\n========== INÍCIO DO COMBATE (ASCENSÃO) ==========`);
    
    // Novas sinergias e bônus
    const attackerSynBonuses = this.applySynergyBonuses(attacker, true);
    let defenderSynBonuses = this.applySynergyBonuses(defender, false);
    
    const attackerActiveEffects = this.applyActiveAbilities(attacker, defender);
    const defenderActiveEffects = this.applyActiveAbilities(defender, attacker); 
    
    // --- APLICAÇÃO DE BÔNUS PASSIVOS NO JOGADOR PARA O COMBATE ---
    attacker.transcendence = attackerSynBonuses.transcendence;
    attacker.critChance = attackerSynBonuses.critChance;
    attacker.extraMaxLife = attackerSynBonuses.extraMaxLife;
    attacker.ignoreDefense = attackerSynBonuses.ignoreDefense;

    defender.damageReduction = defenderSynBonuses.damageReduction;
    defender.reflectDamage = defenderSynBonuses.reflectDamage;
    defender.maxDamageTaken = defenderSynBonuses.maxDamageTaken;
    defender.extraMaxLife = defenderSynBonuses.extraMaxLife;

    // Cura Zelador Nv4 (Ocorre no início do combate)
    if (attackerSynBonuses.healingOnCombat) {
      attacker.life = Math.min(attacker.extraMaxLife ? 20 + attacker.extraMaxLife : 20, attacker.life + attackerSynBonuses.healingOnCombat);
    }
    if (defenderSynBonuses.healingOnCombat) {
      defender.life = Math.min(defender.extraMaxLife ? 20 + defender.extraMaxLife : 20, defender.life + defenderSynBonuses.healingOnCombat);
    }

    // --- CÁLCULO DA GUARDA (GRD) ---
    let defenderBaseGrd = 0;
    for (const card of defender.field) {
      if (card && card.def) defenderBaseGrd += card.def;
    }
    
    let defenderTotalGrd = defenderBaseGrd + defenderSynBonuses.defBonus + defenderActiveEffects.defBonus;
    
    if (attacker.ignoreDefense || attackerSynBonuses.ignoreDefense) {
      console.log(`🛡️ Singularidade/Diferencial: ${attacker.username} ignorou a Guarda de ${defender.username}!`);
      defenderTotalGrd = 0;
    }
    
    if (attackerActiveEffects.reduceDefense > 0) {
      defenderTotalGrd = Math.max(0, defenderTotalGrd - attackerActiveEffects.reduceDefense);
      console.log(`   📉 Redução de Guarda: -${attackerActiveEffects.reduceDefense}`);
    }
    
    console.log(`   🛡️ GUARDA ${defender.username}: ${defenderBaseGrd} (Base) + ${defenderSynBonuses.defBonus} (Sinergia) + ${defenderActiveEffects.defBonus} (Ativa) = ${defenderTotalGrd}`);
    
    // Escudo Zelador (Adicionado à guarda total e consumido)
    let currentShield = defenderSynBonuses.shield;
    if (currentShield > 0) {
      defenderTotalGrd += currentShield;
      console.log(`   🧱 Escudo Ativo: +${currentShield}`);
    }
    
    // --- CÁLCULO DO PODER (POW) ---
    let attackerBasePow = 0;
    for (const card of attacker.field) {
      if (card && card.atk) attackerBasePow += card.atk;
    }
    
    let attackerTotalPow = attackerBasePow + attackerSynBonuses.atkBonus + attackerActiveEffects.atkBonus;
    
    // Multiplicadores (Supernova, Crítico, etc)
    const finalMultiplier = attackerSynBonuses.attackMultiplier * attackerActiveEffects.attackMultiplier;
    if (finalMultiplier !== 1) {
      attackerTotalPow = Math.floor(attackerTotalPow * finalMultiplier);
      console.log(`   ⚡ Multiplicador de Poder: x${finalMultiplier}`);
    }
    
    console.log(`   ⚔️ PODER ${attacker.username}: ${attackerBasePow} (Base) + ${attackerSynBonuses.atkBonus} (Sinergia) + ${attackerActiveEffects.atkBonus} (Ativa) = ${attackerTotalPow}`);
    
    // --- DANO FINAL ---
    let damage = attackerTotalPow - defenderTotalGrd;
    if (damage < 0) damage = 0;
    
    // Dano Mínimo
    const hasAttackerCards = attacker.field.some(card => card !== null);
    if (damage === 0 && hasAttackerCards && !attacker.ignoreDefense) {
      damage = 1;
      console.log(`   🔸 Dano mínimo aplicado (+1)`);
    }

    // Dano Direto (Queimadura, etc)
    let totalDirectDamage = (attackerSynBonuses.directDamage || 0) + (attackerActiveEffects.directDamage || 0);
    if (defender.directDamageBlocked) {
       console.log(`🛡️ Colosso de Aço: ${defender.username} bloqueou todo o Dano Direto!`);
       totalDirectDamage = 0;
    }
    if (totalDirectDamage > 0) {
      console.log(`   ✨ Dano Direto: +${totalDirectDamage}`);
      damage += totalDirectDamage;
    }
    
    // Redução de Dano (Vanguarda Nv4)
    const reduction = (defender.damageReduction || 0);
    if (reduction > 0 && damage > 0) {
      damage = Math.max(1, damage - reduction);
      console.log(`   🛡️ Redução de Dano: -${reduction}`);
    }

    // Limite de Dano (Gladius 5: Inquebrável)
    if (defender.maxDamageTaken && damage > defender.maxDamageTaken) {
      console.log(`   🧱 Inquebrável: Dano limitado de ${damage} para ${defender.maxDamageTaken}`);
      damage = defender.maxDamageTaken;
    }

    // Execução (Assassino do Vazio id:22)
    if (attacker.hasExecutionAbility && defender.life <= Math.floor(20 * 0.2)) {
       console.log(`💀 EXECUÇÃO: ${defender.username} foi executado pelo Assassino do Vazio!`);
       damage = defender.life;
    }

    // --- APLICAÇÃO DE DANO E REFLETIR ---
    const oldLife = defender.life;
    defender.life = Math.max(0, defender.life - damage);
    const actualDamage = oldLife - defender.life;
    
    // Refletir Dano (Retaliação)
    const reflectPercent = (defender.reflectDamage || 0);
    if (reflectPercent > 0 && actualDamage > 0) {
      const reflectedDamageTotal = Math.floor(actualDamage * reflectPercent);
      if (reflectedDamageTotal > 0) {
        attacker.life = Math.max(0, attacker.life - reflectedDamageTotal);
        console.log(`   🪞 Retaliação: ${defender.username} refletiu ${reflectedDamageTotal} de dano em ${attacker.username}!`);
      }
    }

    // Cura Ativa (Bênçãos/Alentos)
    if (attackerActiveEffects.healing > 0) {
      const maxL = attacker.extraMaxLife ? 20 + attacker.extraMaxLife : 20;
      attacker.life = Math.min(maxL, attacker.life + attackerActiveEffects.healing);
      console.log(`   💚 Cura Ativa: ${attacker.username} recuperou ${attackerActiveEffects.healing} de vida.`);
    }

    console.log(`💥 RESULTADO: ${actualDamage} de Dano causado | Vida de ${defender.username}: ${defender.life}`);
    console.log(`========== FIM DO COMBATE ==========\n`);
    
    // Reset de bônus temporários de turno
    attacker.ignoreDefense = false;
    attacker.reflectDamage = 0;
    attacker.damageReduction = 0;
    attacker.maxDamageTaken = 0;
    attacker.hasExecutionAbility = false;
    attacker.swapStatsAbility = false;
    defender.directDamageBlocked = false;

    return {
      attacker: { 
        playerId: attacker.playerId, 
        username: attacker.username, 
        totalPow: attackerTotalPow, 
        life: attacker.life 
      },
      defender: { 
        playerId: defender.playerId, 
        username: defender.username, 
        totalGrd: defenderTotalGrd, 
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
        isCurrentTurn: p.playerId === currentPlayer?.playerId,
        connected: p.connected
      }))
    };
  }
}

module.exports = GameLogic;