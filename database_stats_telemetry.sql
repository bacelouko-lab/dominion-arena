-- Tabela de uso e desempenho das cartas
CREATE TABLE IF NOT EXISTS cards_stats (
    card_id INT PRIMARY KEY,
    nome TEXT,
    picks INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    evolutions INT DEFAULT 0
);

-- Tabela de uso e desempenho das sinergias
CREATE TABLE IF NOT EXISTS synergy_stats (
    synergy_name TEXT,
    level INT,
    picks INT DEFAULT 0,
    wins INT DEFAULT 0,
    losses INT DEFAULT 0,
    PRIMARY KEY (synergy_name, level)
);

-- Função Postgres para incrementar com precisão as cartas de forma atômica
CREATE OR REPLACE FUNCTION increment_card_stats(
    p_card_id INT, 
    p_card_name TEXT, 
    p_is_win BOOLEAN, 
    p_is_evolved BOOLEAN
) RETURNS void AS $$
BEGIN
    INSERT INTO cards_stats (card_id, nome, picks, wins, losses, evolutions)
    VALUES (
        p_card_id, 
        p_card_name, 
        1, 
        CASE WHEN p_is_win THEN 1 ELSE 0 END, 
        CASE WHEN NOT p_is_win THEN 1 ELSE 0 END, 
        CASE WHEN p_is_evolved THEN 1 ELSE 0 END
    )
    ON CONFLICT (card_id) DO UPDATE SET
        picks = cards_stats.picks + 1,
        wins = cards_stats.wins + CASE WHEN p_is_win THEN 1 ELSE 0 END,
        losses = cards_stats.losses + CASE WHEN NOT p_is_win THEN 1 ELSE 0 END,
        evolutions = cards_stats.evolutions + CASE WHEN p_is_evolved THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql;

-- Função Postgres para incrementar com precisão as sinergias
CREATE OR REPLACE FUNCTION increment_synergy_stats(
    p_synergy_name TEXT, 
    p_level INT, 
    p_is_win BOOLEAN
) RETURNS void AS $$
BEGIN
    INSERT INTO synergy_stats (synergy_name, level, picks, wins, losses)
    VALUES (
        p_synergy_name, 
        p_level, 
        1, 
        CASE WHEN p_is_win THEN 1 ELSE 0 END, 
        CASE WHEN NOT p_is_win THEN 1 ELSE 0 END
    )
    ON CONFLICT (synergy_name, level) DO UPDATE SET
        picks = synergy_stats.picks + 1,
        wins = synergy_stats.wins + CASE WHEN p_is_win THEN 1 ELSE 0 END,
        losses = synergy_stats.losses + CASE WHEN NOT p_is_win THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql;
