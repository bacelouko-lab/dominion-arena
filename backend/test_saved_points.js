const GameLogic = require('./gameLogic');

async function testSavedPoints() {
    console.log("🧪 Iniciando Teste de Pontos Salvos (Economia)...");
    const game = new GameLogic("test-game");
    const p1Id = "player1";
    game.addPlayer(p1Id, "Tester");
    const player = game.players[p1Id];

    console.log("\n--- Cenário 1: Acumulando 4 pontos (Deveria ganhar +1 dado) ---");
    // Simulando que o jogador pulou a loja com 4 de ouro
    player.gold = 4;
    game.chooseShopOption(p1Id, false); // Pula loja
    console.log(`💰 Pontos Salvos: ${player.savedPoints} | Saves Consecutivos: ${player.consecutiveSaves}`);

    console.log("\n--- Rodando Dados no próximo turno ---");
    const rollResult = game.rollDice(p1Id);
    console.log(`🎲 Dados Rolados: ${rollResult.diceCount}`);
    console.log(`💰 Pontos Salvos após rolo: ${player.savedPoints}`);

    if (rollResult.diceCount >= 2) {
        console.log("✅ Sucesso: O bônus de dado foi aplicado.");
    } else {
        console.log("❌ ERRO: O bônus de dado NÃO foi aplicado (Deveria ser 2).");
    }

    console.log("\n--- Cenário 2: 2 Saves Consecutivos (Deveria ganhar +1 dado) ---");
    player.savedPoints = 0;
    player.consecutiveSaves = 0;
    
    // Round 1: Pula
    game.chooseShopOption(p1Id, false);
    // Round 2: Pula
    game.chooseShopOption(p1Id, false);
    
    console.log(`Saves Consecutivos: ${player.consecutiveSaves}`);
    const rollResult2 = game.rollDice(p1Id);
    console.log(`🎲 Dados Rolados (2 saves): ${rollResult2.diceCount}`);

    if (rollResult2.diceCount >= 2) {
        console.log("✅ Sucesso: Bônus de saves consecutivos aplicado.");
    } else {
        console.log("❌ ERRO: Bônus de saves consecutivos NÃO aplicado.");
    }
}

testSavedPoints();
