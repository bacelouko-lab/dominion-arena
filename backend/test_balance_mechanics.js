const GameLogic = require('./gameLogic');
const cardsData = require('../dominion_cards.json');

async function runTests() {
  console.log("🧪 TESTE DE BALANCEAMENTO v4: Dominion Arena\n");

  const game = new GameLogic('test-game');
  game.addPlayer('p1', 'Player 1');
  game.addPlayer('p2', 'Player 2');

  const p1 = game.players['p1'];
  const p2 = game.players['p2'];

  // Teste 1: Terminology e POW/GRD
  console.log("Teste 1: Verificando Terminology e Atributos");
  const cardData1 = cardsData.find(c => c.id === 1);
  console.log(`Carta 1: ${cardData1.nome} | POW: ${cardData1.pow} | GRD: ${cardData1.grd}`);
  if (cardData1.pow === 2 && cardData1.grd === 3) console.log("✅ OK");
  else console.log("❌ Erro nos atributos");

  // Teste 2: Sinergia Umbra 5 (Anulação)
  console.log("\nTeste 2: Sinergia Umbra 5 vs Atacante");
  // Colocar 5 cartas Umbra no p2 para ativar Umbra 5
  const umbraCards = cardsData.filter(c => c.regiao === 'Umbra').slice(0, 5);
  p2.field = umbraCards.map(c => ({ ...c }));
  
  // Colocar 2 cartas Solari no p1 para ativar Solari 2 (+4 POW)
  const solariCards = cardsData.filter(c => c.regiao === 'Solari').slice(0, 2);
  p1.field = solariCards.map(c => ({ ...c }));
  
  game.calculateSynergies('p1');
  game.calculateSynergies('p2');
  
  const bonusesP1 = game.applySynergyBonuses(p1, p2);
  console.log(`Bônus P1 contra Umbra 5: POW=${bonusesP1.powBonus}`);
  if (bonusesP1.powBonus === 0) console.log("✅ Umbra 5 anulou bônus!");
  else console.log("❌ Falha na anulação de Umbra 5");

  // Teste 3: Prio Defensiva (Colosso de Aço - ID 6 Immune to Direct)
  console.log("\nTeste 3: Imunidade a Dano Direto (Colosso)");
  p1.field = [null, null, null, null, null, null];
  p1.field[0] = { ...cardsData.find(c => c.id === 6), isEvolved: true }; // Colosso
  const activeAttacker = game.applyActiveAbilities(p1, p2);
  console.log(`Imunidade Direto detectada: ${activeAttacker.immuneDirect}`);
  if (activeAttacker.immuneDirect) console.log("✅ Colosso ativou Imunidade");
  else console.log("❌ Falha no Colosso");

  // Teste 4: Queimadura (Burn)
  console.log("\nTeste 4: Aplicação e Dano de Queimadura");
  p1.field = [null, null, null, null, null, null];
  p1.field[1] = { ...cardsData.find(c => c.id === 5), isEvolved: true }; // Escudeiro Solari
  p2.life = 20;
  p2.burnStacks = 0;
  p2.field = [null, null, null, null, null, null];
  
  game.calculateCombat(p1, p2);
  console.log(`Stacks de Queimadura no P2: ${p2.burnStacks}`);
  if (p2.burnStacks === 1) console.log("✅ Queimadura aplicada");
  else console.log("❌ Erro ao aplicar queimadura");

  console.log("Simulando início de turno do P2...");
  game.currentPlayerIndex = 1; 
  game.rollDice('p2');
  // P2 tomou 1 de dano de POW (Escudeiro) + 1 de Burn. Total 18.
  console.log(`Vida do P2 após turno: ${p2.life}`);
  if (p2.life === 18) console.log("✅ Dano de queimadura aplicado!");
  else console.log(`❌ Dano de queimadura NÃO aplicado corretamente (Vida: ${p2.life})`);

  // Teste 5: Reflexão (Rounding Ceil)
  console.log("\nTeste 5: Reflexão com Arredondamento (Ceil)");
  p2.life = 20;
  p1.life = 20;
  // Ativar Gladius 4 para 40% de reflexo
  const gladiusCards = cardsData.filter(c => c.regiao === 'Gladius').slice(0, 4);
  p2.field = gladiusCards.map(c => ({ ...c }));
  
  // P1 ataca com 100 POW total para garantir dano alto
  p1.field = [{ pow: 100, grd: 0 }]; 
  game.calculateCombat(p1, p2);
  // Dano = 100 - defesa. 40% de 100 = 40.
  // P1 vida deve ser 20 - 40 = 0 (morte) ou algo em torno de -20.
  console.log(`Vida do P1 após refletir (Dano alto): ${p1.life}`);
  if (p1.life < 20) console.log("✅ Reflexo funcionou!");
  else console.log(`❌ Falha no reflexo (Vida P1: ${p1.life})`);

  console.log("\n🏁 TESTES CONCLUÍDOS");
}

runTests().catch(console.error);
