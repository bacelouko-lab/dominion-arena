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
    this.pool = this.initializePool();
    this.shufflePool();
    this.isPublic = false;
  }

  shufflePool() {
    for (let i = this.pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.pool[i], this.pool[j]] = [this.pool[j], this.pool[i]];
    }
  }

  returnCardToPool(card) {
    if (!card) return;
    const numCopies = card.isEvolved ? 2 : 1;
    const baseCard = cardsData.find(c => c.id === card.id);
    if (!baseCard) return;
    for (let i = 0; i < numCopies; i++) {
      this.pool.push({ ...baseCard });
    }
    this.shufflePool();
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
      synergies: { regions: {}, classes: {} },
      choseShop: false,
      hasActedThisTurn: false,
      burnStacks: 0,
      connected: true,
      rerollsRemaining: 2,
      anjoGovernanteBonus: 0,
      anjoGovernanteSpent: 0,
      freeCardUsed: false,
      consecutiveSaves: 0,
      // Status temporários de combate (resetados a cada apply)
      immuneDirect: false,
      reflect: 0,
      ignoreGrd: 0,
      exec: false,
      swap: false
    };
    this.playerOrder.push(playerId);
  }

  getGameState() {
    const currentPlayer = this.getCurrentPlayer();
    return {
      gameId: this.gameId,
      players: Object.values(this.players),
      playerOrder: this.playerOrder,
      currentPlayerIndex: this.currentPlayerIndex,
      currentPlayerId: currentPlayer ? currentPlayer.playerId : null,
      turn: this.turn,
      round: this.round,
      phase: this.phase,
      shop: this.shop,
      poolSize: this.pool.length,
      eliminations: this.eliminations,
      isPublic: this.isPublic
    };
  }

  getPlayerState(playerId) {
    return this.players[playerId];
  }

  getCurrentPlayer() {
    if (this.playerOrder.length === 0) return null;
    return this.players[this.playerOrder[this.currentPlayerIndex]];
  }

  calculateDiceCount(player) {
    let diceCount = 1;
    const bonusDice = Math.floor(player.savedPoints / 4);
    diceCount += bonusDice;
    if (player.consecutiveSaves >= 2) diceCount = Math.max(diceCount, 2);
    const synergies = player.synergies || { regions: {} };
    if (synergies.regions?.['Aether'] >= 3) diceCount = Math.max(diceCount, 2);
    return Math.min(diceCount, 3);
  }

  resetStatus(player) {
    player.immuneDirect = false;
    player.reflect = 0;
    player.ignoreGrd = 0;
    player.exec = false;
    player.swap = false;
  }

  resetPlayerForNextTurn(playerId) {
    const player = this.players[playerId];
    if (player) {
      player.hasActedThisTurn = false;
      player.choseShop = false;
      player.rerollsRemaining = 2;
      player.freeCardUsed = false;
      this.resetStatus(player);
    }
  }

  nextPlayer() {
    if (this.phase === 'end') return null;
    let nextIndex = (this.currentPlayerIndex + 1) % this.playerOrder.length;
    let attempts = 0;
    while (this.players[this.playerOrder[nextIndex]]?.life <= 0 && attempts < this.playerOrder.length) {
      nextIndex = (nextIndex + 1) % this.playerOrder.length;
      attempts++;
    }
    const wrappedAround = nextIndex <= this.currentPlayerIndex;
    this.currentPlayerIndex = nextIndex;
    if (wrappedAround) {
      this.round++;
      this.attackedThisRound = [];
    }
    const nextPlayer = this.getCurrentPlayer();
    if (nextPlayer && nextPlayer.life > 0) {
      this.resetPlayerForNextTurn(nextPlayer.playerId);
    }
    return nextPlayer;
  }

  endCurrentTurn() {
    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer) {
      currentPlayer.hasActedThisTurn = true;
      this.applyEndOfTurnEffects(currentPlayer);
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
    if (player.life <= 0) return;
    const bonuses = this.applySynergyBonuses(player);
    const synergies = player.synergies || { regions: {}, classes: {} };
    if (synergies.regions?.['Veridian'] >= 3) {
      const healBase = bonuses.heal || 0;
      const multiplier = bonuses.double ? 2 : 1;
      const finalHeal = Math.ceil(healBase * multiplier);
      if (finalHeal > 0) {
        const oldLife = player.life;
        const maxL = bonuses.life ? 20 + bonuses.life : 20;
        player.life = Math.min(maxL, player.life + finalHeal);
        console.log(`🌿 Cura Veridian: ${player.username} curou ${player.life - oldLife} de vida | Vida: ${player.life}`);
      }
    }
    if (synergies.classes?.['Zelador'] >= 4) {
      const oldLife = player.life;
      const maxL = bonuses.life ? 20 + bonuses.life : 20;
      player.life = maxL;
      if (player.life > oldLife) {
        console.log(`✨ Cura Zelador: ${player.username} restaurou vida máxima | Vida: ${player.life}`);
      }
    }
  }

  rollDice(playerId) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    this.calculateSynergies(playerId);
    const bonuses = this.applySynergyBonuses(player);
    const diceCount = bonuses.dice || this.calculateDiceCount(player);
    player.dice = diceCount;
    if (player.savedPoints >= 4) player.savedPoints = 0;
    if (player.burnStacks > 0) {
      player.life = Math.max(0, player.life - player.burnStacks);
      console.log(`🔥 Queimadura: ${player.username} sofreu ${player.burnStacks} de dano | Vida: ${player.life}`);
    }
    if (bonuses.wisdomBonus) {
      const eruditos = player.field.filter(c => c && c.classe === 'Erudito' && c.isEvolved);
      if (eruditos.length > 0) {
        this.applySingleCardAbility(player, eruditos[Math.floor(Math.random() * eruditos.length)]);
      }
    }
    let totalGold = 0;
    const rolls = [];
    for (let i = 0; i < diceCount; i++) {
      let roll;
      if (bonuses.six) { roll = 6; } 
      else {
        const hasSoberanoEter = player.field.some(c => c && c.id === 14 && c.isEvolved);
        roll = hasSoberanoEter ? 5 : Math.floor(Math.random() * 6) + 1;
      }
      rolls.push(roll);
      totalGold += roll;
    }
    player.diceRolls = rolls;
    player.gold = totalGold;
    console.log(`🎲 Dados: ${player.username} rolou [${rolls.join(', ')}] | Ouro Total: ${totalGold}`);
    if (diceCount >= 2 && player.consecutiveSaves >= 2) player.consecutiveSaves = 0;
    return { totalGold, rolls, diceCount, savedPoints: player.savedPoints };
  }

  rerollDice(playerId) {
    const player = this.players[playerId];
    if (!player || player.rerollsRemaining <= 0) return { error: 'No rerolls' };
    const diceCount = player.dice;
    const newRolls = [];
    for (let i = 0; i < diceCount; i++) newRolls.push(Math.floor(Math.random() * 6) + 1);
    player.rerollsRemaining--;
    player.diceRolls = newRolls;
    player.gold = newRolls.reduce((a, b) => a + b, 0);
    return { success: true, rolls: newRolls, gold: player.gold, rerollsRemaining: player.rerollsRemaining };
  }

  initializePool() {
    let pool = [];
    cardsData.forEach(card => {
      let copies = card.custo === 2 ? 4 : card.custo === 3 ? 3 : card.custo === 5 ? 2 : 1;
      for (let i = 0; i < copies; i++) pool.push({ ...card });
    });
    return pool;
  }

  generateShop(playerId) {
    const player = this.players[playerId];
    this.calculateSynergies(playerId);
    const synergies = player.synergies || { regions: {}, classes: {} };
    let shopSize = player.dice === 2 ? 4 : player.dice === 3 ? 5 : 3;
    this.shop = [];
    for (let i = 0; i < shopSize; i++) {
      if (this.pool.length === 0) break;
      const selectedCard = this.pool.splice(Math.floor(Math.random() * this.pool.length), 1)[0];
      let custo = selectedCard.custo;
      const hasEscriba = player.field.some(c => c && c.id === 15 && c.isEvolved);
      if (hasEscriba && custo <= 5) custo = Math.max(0, custo - 1);
      if (synergies.regions?.['Aether'] >= 4 && !player.freeCardUsed && custo > 0) {
        custo = 0;
        player.freeCardUsed = true;
      }
      this.shop.push({ ...selectedCard, custo, instanceId: `${selectedCard.id}-${Date.now()}-${Math.random()}` });
    }
    return this.shop;
  }

  chooseShopOption(playerId, choseShop) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    player.choseShop = choseShop;
    if (!choseShop) {
      if (this.shop && this.shop.length > 0) {
        this.shop.forEach(card => this.returnCardToPool(card));
        this.shop = [];
      }
      player.savedPoints += player.gold;
      player.gold = 0;
      player.consecutiveSaves++;
      this.phase = 'combat';
    } else {
      player.consecutiveSaves = 0;
      this.generateShop(playerId);
      this.phase = 'buy';
    }
    return { choseShop, phase: this.phase, gold: player.gold, savedPoints: player.savedPoints };
  }

  rerollShop(playerId) {
    const player = this.players[playerId];
    if (!player || player.gold < 1) return { error: 'Not enough gold' };
    player.gold -= 1;
    this.shop.forEach(card => this.returnCardToPool(card));
    this.shop = [];
    this.generateShop(playerId);
    return { shop: this.shop, gold: player.gold };
  }

  buyCard(playerId, cardInstanceId) {
    const player = this.players[playerId];
    const shopCardIndex = this.shop.findIndex(c => c.instanceId === cardInstanceId);
    if (shopCardIndex === -1) return { error: 'Not in shop' };
    const card = this.shop[shopCardIndex];
    if (player.gold < card.custo || player.hand.length >= 7) return { error: 'Cannot buy' };
    player.gold -= card.custo;
    player.hand.push({ ...card, purchasePrice: card.custo });
    console.log(`🛒 Compra: ${player.username} comprou ${card.nome} por ${card.custo} ouro.`);
    this.shop.splice(shopCardIndex, 1);
    this.checkEvolution(playerId);
    return { success: true, hand: player.hand, gold: player.gold };
  }

  sellCard(playerId, cardInstanceId, isField) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    let card, cardIndex;
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
    if (!card) return { error: 'Not found' };
    const refund = card.purchasePrice !== undefined ? card.purchasePrice : 1;
    player.gold += refund;
    this.returnCardToPool(card);
    this.calculateSynergies(playerId);
    return { success: true, gold: player.gold, hand: player.hand, field: player.field };
  }

  checkEvolution(playerId) {
    const player = this.players[playerId];
    let evolved = true;
    while (evolved) {
      evolved = false;
      const count = {};
      const pos = {};
      [...player.hand.map((c, i) => ({ c, i, t: 'hand' })), ...player.field.map((c, i) => ({ c, i, t: 'field' }))]
        .filter(x => x.c && !x.c.isEvolved)
        .forEach(x => {
          count[x.c.id] = (count[x.c.id] || 0) + 1;
          if (!pos[x.c.id]) pos[x.c.id] = [];
          pos[x.c.id].push(x);
        });
      for (const id in count) {
        if (count[id] >= 2) {
          const p = pos[id];
          const base = p[0].c;
          const ev = { ...base, nome: `${base.nome} (Evoluída)`, isEvolved: true };
          const targetPos = p.find(x => x.t === 'field') || p[0];
          p.slice(0, 2).forEach(x => {
            if (x.t === 'hand') player.hand.splice(player.hand.indexOf(x.c), 1);
            else player.field[x.i] = null;
          });
          if (targetPos.t === 'field') player.field[targetPos.i] = ev;
          else player.hand.push(ev);
          console.log(`✨ Evolução: ${player.username} fundiu duas cópias de ${base.nome} em ${ev.nome}!`);
          evolved = true;
          break;
        }
      }
    }
  }

  repositionCard(playerId, from, to) {
    const player = this.players[playerId];
    let c = from.type === 'hand' ? player.hand[from.index] : player.field[from.index];
    if (!c) return { error: 'No card' };
    if (from.type === 'hand') player.hand.splice(from.index, 1);
    else player.field[from.index] = null;
    if (to.type === 'hand') player.hand.push(c);
    else {
      let t = player.field[to.index];
      if (t) player.hand.push(t);
      player.field[to.index] = c;
    }
    this.calculateSynergies(playerId);
    return { success: true, field: player.field, hand: player.hand };
  }

  calculateSynergies(playerId) {
    const player = this.players[playerId];
    const s = { regions: {}, classes: {} };
    player.field.filter(c => c).forEach(c => {
      s.regions[c.regiao] = (s.regions[c.regiao] || 0) + 1;
      s.classes[c.classe] = (s.classes[c.classe] || 0) + 1;
    });
    player.synergies = s;
    return s;
  }

  getRegionBonus(region, level) {
    const b = {
      Solari: { 2: { pow: 4 }, 4: { direct: 4 }, 5: { multi: 2 } },
      Gladius: { 2: { grd: 4 }, 4: { reflect: 0.4 }, 5: { limit: 5 } },
      Aether: { 2: { gold: 2 }, 4: { rolls: 2 }, 5: { six: true, dice: 2 } },
      Veridian: { 3: { heal: 3 }, 4: { life: 10 }, 5: { double: true } },
      Umbra: { 2: { pow: 2, grd: 2 }, 4: { kill: 0.3 }, 5: { disable: true } }
    };
    return b[region]?.[level] || {};
  }

  applySynergyBonuses(player, opponent = null) {
    const s = player.synergies || { regions: {}, classes: {} };
    if (opponent && opponent.synergies?.regions?.['Umbra'] >= 5) return { powBonus: 0, grdBonus: 0, multi: 1 };
    let bonuses = { powBonus: 0, grdBonus: 0, direct: 0, multi: 1, reflect: 0, limit: 0, gold: 0, heal: 0, life: 0, double: false, dice: 0, six: false, kill: 0, grdPlus: 0, powPlus: 0, immuneDirect: false, crit: 0, transBonus: 0, fullHeal: false, wisdomBonus: false };
    for (const [r, c] of Object.entries(s.regions)) {
      [2, 3, 4, 5].forEach(lv => {
        if (c >= lv) {
          const b = this.getRegionBonus(r, lv);
          if (b.pow) bonuses.powBonus += b.pow;
          if (b.grd) bonuses.grdBonus += b.grd;
          if (b.direct) bonuses.direct += b.direct;
          if (b.multi) bonuses.multi *= b.multi;
          if (b.reflect) bonuses.reflect = Math.max(bonuses.reflect, b.reflect);
          if (b.limit) bonuses.limit = b.limit;
          if (b.gold) bonuses.gold += b.gold;
          if (b.heal) bonuses.heal += b.heal;
          if (b.life) bonuses.life += b.life;
          if (b.double) bonuses.double = true;
          if (b.dice) bonuses.dice = b.dice;
          if (b.six) bonuses.six = true;
          if (b.kill) bonuses.kill = b.kill;
        }
      });
    }
    for (const [cls, c] of Object.entries(s.classes)) {
      if (c >= 2) {
        if (cls === 'Vanguarda') bonuses.grdPlus += 5;
        if (cls === 'Algoz') bonuses.powPlus += 5;
        if (cls === 'Erudito') bonuses.wisdomBonus = true;
        if (cls === 'Zelador') { if(Math.random()<0.5) bonuses.powPlus+=2; else bonuses.heal+=2; }
      }
      if (c >= 4) {
        if (cls === 'Vanguarda') bonuses.immuneDirect = true;
        if (cls === 'Algoz') bonuses.crit = 0.3;
        if (cls === 'Erudito') bonuses.transBonus = 3;
        if (cls === 'Zelador') bonuses.fullHeal = true;
      }
    }
    return bonuses;
  }

  applyActiveAbilities(attacker, defender) {
    let d = 0, h = 0, p = 0, g = 0, b = 0, immune = false, refl = 0;
    this.resetStatus(attacker);
    this.resetStatus(defender);
    attacker.field.filter(c => c && c.isEvolved).forEach(c => {
      const r = this.applySingleCardAbility(attacker, c, defender);
      d += r.direct || 0; h += r.healing || 0; p += r.pow || 0; g += r.grd || 0; b += r.burn || 0;
      if (r.immuneDirect) immune = true;
      if (r.reflect) refl = Math.max(refl, r.reflect);
    });
    return { direct: d, healing: h, pow: p, grd: g, burn: b, immuneDirect: immune, reflect: refl };
  }

  applySingleCardAbility(player, card, opp = null) {
    if (opp && opp.synergies?.regions?.['Umbra'] >= 5) return {};
    let r = {};
    const cid = Number(card.id);
    if (cid === 1) { r.grd = 2; r.burn = 1; }
    else if (cid === 3) { 
      r.pow = player.field.filter(c=>c).length * 2; 
      r.grd = player.field.filter(c=>c).length * 2; 
    }
    else if (cid === 4) { r.healing = 4; }
    else if (cid === 5) { r.grd = 1; r.burn = 1; }
    else if (cid === 6) { r.immuneDirect = true; }
    else if (cid === 7) { player.ignoreGrd = 0.25; }
    else if (cid === 8) { r.pow = 3; r.grd = 3; }
    else if (cid === 9) { r.grd = 3; r.healing = 2; }
    else if (cid === 10) { if(player.synergies?.regions?.['Gladius']>=2) r.pow = 2; }
    else if (cid === 11) { r.grd = 4; }
    else if (cid === 12) { player.ignoreGrd = 0.75; }
    else if (cid === 16) { r.grd = 3; r.reflect = 0.05; }
    else if (cid === 17) { r.direct = Math.ceil(player.life * 0.1); }
    else if (cid === 19) { r.healing = 10; }
    else if (cid === 20) { r.healing = 3; }
    else if (cid === 21) { r.reflect = 0.25; }
    else if (cid === 22) { player.exec = true; }
    else if (cid === 23) { r.direct = 4; }
    else if (cid === 24) { player.swap = true; }
    else if (cid === 25) { r.healing = 2; if(opp) r.direct = 2; }
    return r;
  }

  activateAnjoGovernante(playerId) {
    const player = this.players[playerId];
    if (!player || player.gold < 1) return { error: 'Not enough gold' };
    player.gold -= 1;
    player.anjoGovernanteSpent += 1;
    player.anjoGovernanteBonus += 2;
    return { success: true, gold: player.gold, bonus: player.anjoGovernanteBonus, spent: player.anjoGovernanteSpent };
  }

  getRandomAttackTarget(attackerId) {
    let targets = Object.keys(this.players).filter(pid => pid !== attackerId && this.players[pid].life > 0);
    if (targets.length === 0) return null;
    let freshTargets = targets.filter(pid => !this.attackedThisRound.includes(pid));
    let target = freshTargets.length > 0 ? freshTargets[Math.floor(Math.random() * freshTargets.length)] : targets[Math.floor(Math.random() * targets.length)];
    this.attackedThisRound.push(target);
    return target;
  }

  recordElimination(playerId) {
    if (!this.eliminations.includes(playerId)) {
      this.eliminations.push(playerId);
      const player = this.players[playerId];
      if (player) {
        player.hand.forEach(c => this.returnCardToPool(c));
        player.field.forEach(c => this.returnCardToPool(c));
        player.hand = [];
        player.field = Array(6).fill(null);
      }
    }
  }

  chooseCopiedSynergy(playerId, region, level) {
    const player = this.players[playerId];
    if (!player) return { error: 'Player not found' };
    player.copiedSynergy = region;
    player.copiedSynergyLevel = level;
    return { success: true, copiedSynergy: region, copiedLevel: level };
  }

  calculateCombat(attacker, defender) {
    this.calculateSynergies(attacker.playerId);
    this.calculateSynergies(defender.playerId);
    const aS = this.applySynergyBonuses(attacker, defender);
    const dS = this.applySynergyBonuses(defender, attacker);
    const aA = this.applyActiveAbilities(attacker, defender);
    const dA = this.applyActiveAbilities(defender, attacker);
    attacker.immuneDirect = aS.immuneDirect || attacker.immuneDirect;
    defender.immuneDirect = dS.immuneDirect || defender.immuneDirect;
    let aP = attacker.field.reduce((acc, c) => acc + (c ? (c.pow || 0) : 0), 0) + (aS.powBonus || 0) + (aS.powPlus || 0) + (aA.pow || 0) + (aS.transBonus || 0) + (attacker.anjoGovernanteBonus || 0);
    if (aS.crit > 0 && Math.random() < aS.crit) aP = Math.ceil(aP * 2);
    let dG = defender.field.reduce((acc, c) => acc + (c ? (c.grd || 0) : 0), 0) + (dS.grdBonus || 0) + (dS.grdPlus || 0) + (dA.grd || 0) + (dS.transBonus || 0);
    if (attacker.ignoreGrd) dG = Math.floor(dG * (1 - attacker.ignoreGrd));
    let dmg = Math.max(0, aP - dG);
    let dir = aS.direct + aA.direct;
    if (defender.immuneDirect || dS.immuneDirect || dA.immuneDirect) dir = 0;
    let total = dmg + dir;
    if (total <= 0) total = 1; // Dano mínimo para evitar partidas infinitas
    if (dS.limit && total > dS.limit) total = dS.limit;
    if (attacker.exec && defender.life <= Math.ceil(20 * 0.2)) total = defender.life;
    const old = defender.life;
    defender.life = Math.max(0, defender.life - total);
    const actual = old - defender.life;
    const ref = (dS.reflect || 0) + (defender.reflect || 0) + (dA.reflect || 0) + (dS.transBonus ? 0.03 : 0);
    if (ref > 0 && actual > 0) attacker.life = Math.max(0, attacker.life - Math.ceil(actual * ref));
    if (aA.burn) {
      defender.burnStacks = (defender.burnStacks || 0) + aA.burn;
      console.log(`🔥 Queimadura: ${attacker.username} aplicou +${aA.burn} stacks em ${defender.username}`);
    }
    if (aA.healing > 0) {
      const oldL = attacker.life;
      const maxL = (aS.life ? 20 + aS.life : 20);
      attacker.life = Math.min(maxL, attacker.life + aA.healing);
      console.log(`➕ Cura Ativa: ${attacker.username} curou ${attacker.life - oldL} | Vida: ${attacker.life}`);
    }
    if (dA.healing > 0) {
      const oldL = defender.life;
      const maxL = (dS.life ? 20 + dS.life : 20);
      defender.life = Math.min(maxL, defender.life + dA.healing);
      console.log(`➕ Cura Ativa: ${defender.username} curou ${defender.life - oldL} | Vida: ${defender.life}`);
    }
    if (aS.kill > 0 && Math.random() < aS.kill) {
      const idxArr = defender.field.map((c,i)=>c?i:null).filter(v=>v!==null);
      if(idxArr.length) {
        const targetIdx = idxArr[Math.floor(Math.random()*idxArr.length)];
        console.log(`⚔️ Abate: ${attacker.username} destruiu a carta ${defender.field[targetIdx].nome} de ${defender.username}!`);
        defender.field[targetIdx] = null;
      }
    }
    console.log(`⚔️ Combate: ${attacker.username} vs ${defender.username} | Dano: ${total} (P:${aP} vs G:${dG}) | Vida ${defender.username}: ${old} -> ${defender.life}`);
    return { attacker, defender, actualDamage: actual, netDamage: actual };
  }
}

module.exports = GameLogic;