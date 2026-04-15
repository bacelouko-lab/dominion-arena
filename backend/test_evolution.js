const GameLogic = require('./gameLogic');
const cardsData = require('./dominion_cards.json');

function runTest() {
    console.log("🧪 Iniciando Teste de Evolução...");
    const game = new GameLogic("test-game");
    const playerId = "player-1";
    game.addPlayer(playerId, "Tester");
    const player = game.players[playerId];

    // 1. Simular compra de 1 Escriba Arcano (ID 15)
    console.log("\n🛒 Comprando primeira cópia do Escriba Arcano (ID 15)...");
    const escribaBase = cardsData.find(c => c.id === 15);
    player.hand.push({ ...escribaBase, instanceId: "escriba-1", purchasePrice: 2 });
    
    // 2. Colocar no campo
    console.log("📍 Colocando no Campo (posição 0)...");
    game.repositionCard(playerId, { type: 'hand', index: 0 }, { type: 'field', index: 0 });
    console.log("Estado do Campo:", player.field[0] ? player.field[0].nome : "Vazio");

    // 3. Comprar segunda cópia
    console.log("\n🛒 Comprando segunda cópia do Escriba Arcano...");
    player.hand.push({ ...escribaBase, instanceId: "escriba-2", purchasePrice: 2 });

    // 4. Colocar no campo (disparando evolução)
    console.log("📍 Colocando no Campo (posição 1)... Evolução deve ocorrer!");
    const result = game.repositionCard(playerId, { type: 'hand', index: 0 }, { type: 'field', index: 1 });

    if (result.error) {
        console.error("❌ ERRO durante reposicionamento:", result.error);
    } else {
        console.log("✅ Reposicionamento concluído.");
        const cardsOnField = player.field.filter(c => c !== null);
        console.log(`Cartas no campo: ${cardsOnField.length}`);
        cardsOnField.forEach((c, i) => console.log(` - [${i}] ${c.nome} (Evoluída: ${c.isEvolved})`));

        if (cardsOnField.length === 1 && cardsOnField[0].isEvolved) {
            console.log("\n🏆 SUCESSO: A carta evoluiu e substituiu as originais no campo corretamente!");
        } else {
            console.error("\n❌ FALHA: A contagem de cartas ou o estado de evolução está incorreto.");
            process.exit(1);
        }
    }

    // 5. Testar evolução Hand -> Field (onde a orig está na mão e a nova vai pro campo)
    console.log("\n--- Teste 2: Evolução Hand + Hand -> Field ---");
    player.hand = [];
    player.field = Array(6).fill(null);
    player.hand.push({ ...escribaBase, instanceId: "escriba-3", purchasePrice: 2 });
    player.hand.push({ ...escribaBase, instanceId: "escriba-4", purchasePrice: 2 });
    
    console.log("📍 Movendo uma da mão [0] para o campo [2]...");
    game.repositionCard(playerId, { type: 'hand', index: 0 }, { type: 'field', index: 2 });
    
    const fieldAfter = player.field.filter(c => c !== null);
    console.log(`Cartas no campo: ${fieldAfter.length}`);
    fieldAfter.forEach((c, i) => console.log(` - [${i}] ${c.nome} (Evoluída: ${c.isEvolved})`));

    // 6. Testar evolução com Sanguessuga (ID 25)
    console.log("\n--- Teste 3: Evolução com Sanguessuga (ID 25) ---");
    player.hand = [];
    player.field = Array(6).fill(null);
    const sanguessugaBase = cardsData.find(c => c.id === 25);
    player.hand.push({ ...sanguessugaBase, instanceId: "sangue-1", purchasePrice: 3 });
    player.field[4] = { ...sanguessugaBase, instanceId: "sangue-2", purchasePrice: 3 };

    console.log("📍 Movendo Sanguessuga da mão [0] para o campo [5]...");
    game.repositionCard(playerId, { type: 'hand', index: 0 }, { type: 'field', index: 5 });

    const fieldFinal = player.field.filter(c => c !== null);
    console.log(`Cartas no campo: ${fieldFinal.length}`);
    fieldFinal.forEach((c, i) => console.log(` - [${i}] ${c.nome} (Evoluída: ${c.isEvolved})`));

    if (fieldFinal.length === 1 && fieldFinal[0].isEvolved && fieldFinal[0].id === 25) {
        console.log("🏆 SUCESSO: Sanguessuga evoluiu corretamente!");
    } else {
        console.error("❌ FALHA no Teste 3.");
        process.exit(1);
    }

    console.log("\n🌟 Todos os testes de evolução passaram!");
}

try {
    runTest();
} catch (e) {
    console.error("💥 CRASH durante o teste:", e);
    process.exit(1);
}
