const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dominion_arena'
});

pool.on('error', (err) => console.error('Unexpected error on idle client', err));

const initDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS games (
        id UUID PRIMARY KEY,
        name VARCHAR(255),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id UUID PRIMARY KEY,
        game_id UUID REFERENCES games(id),
        player_id VARCHAR(255),
        username VARCHAR(255),
        life INT DEFAULT 20,
        gold INT DEFAULT 0,
        dice INT DEFAULT 1,
        hand JSONB DEFAULT '[]',
        field JSONB DEFAULT '[]',
        deck JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS game_states (
        id UUID PRIMARY KEY,
        game_id UUID REFERENCES games(id),
        current_player INT,
        phase VARCHAR(50),
        shop JSONB DEFAULT '[]',
        turn INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    client.release();
    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
};

module.exports = { pool, initDatabase };
