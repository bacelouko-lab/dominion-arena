import React from 'react';

export default function Synergies({ synergies }) {
  if (!synergies || !synergies.regions || !synergies.classes) {
    return (
      <div style={{ marginTop: '10px', background: '#0a0a1a', padding: '15px', borderRadius: '8px' }}>
        <h4>🔗 Sinergias Ativas</h4>
        <p style={{ fontSize: '12px', color: '#666' }}>Nenhuma sinergia ativa</p>
        <p style={{ fontSize: '10px', color: '#555' }}>💡 2+ cartas da mesma região ou classe</p>
      </div>
    );
  }

  // Configuração dos bônus
  const regionBonuses = {
    Vulcão: { 
      3: { atk: 3, desc: 'ATK +3' },
      5: { atk: 2, desc: 'ATK +2 (Total +5)' },
      6: { atkMulti: 1.5, desc: 'ATK x1.5' }
    },
    Montanha: { 
      3: { def: 3, desc: 'DEF +3' },
      5: { atk: 2, def: 5, desc: 'ATK +2 / DEF +5' },
      6: { def: 5, desc: 'DEF +5 adicional' }
    },
    Céu: { 
      3: { dice: 2, desc: '2 dados fixos' },
      5: { freeCard: true, desc: '1 carta custo 0' },
      6: { atkPerDice: 2, desc: '+2 ATK por dado' }
    },
    Lago: { 
      3: { atkEven: 3, desc: 'Dado par: +3 ATK' },
      5: { chooseBestDice: true, desc: 'Escolhe melhor dado' },
      6: { minDice: 6, def: 2, desc: 'Mínimo 6 / +2 DEF' }
    },
    Floresta: { 
      3: { atk: 2, def: 2, desc: 'ATK +2 / DEF +2' },
      4: { copySynergy: true, desc: 'Copia sinergia' },
      5: { copySynergy: true, desc: 'Copia sinergia' }
    },
    Deserto: { 
      3: { chooseTarget: true, desc: 'Escolhe alvo' },
      5: { cancelCard: true, desc: 'Anula carta oponente' },
      6: { noSynergy: true, desc: 'Sem sinergias contra' }
    }
  };

  const classBonuses = {
    Guerreiro: { 2: { atk: 2, desc: 'ATK +2' }, 4: { def: 4, desc: 'DEF +4' } },
    Mago: { 2: { directDamage: 2, desc: '2 de dano direto' }, 4: { doubleAbility: true, desc: 'Ativa habilidade 2x' } },
    Ladino: { 2: { ignoreDef: 2, desc: 'Ignora 2 DEF' }, 4: { cancelCard: true, desc: 'Anula carta aleatória' } },
    Suporte: { 2: { heal: 2, desc: 'Cura 2 de vida' }, 4: { def: 3, heal: 3, desc: 'DEF +3 / Cura 3' } },
    Monstro: { 2: { atk: 1, desc: 'ATK +1' }, 4: { atk: 2, desc: 'ATK +2' } },
    Mercador: { 2: { costReduce: 1, desc: 'Custo -1' }, 4: { costReduce: 3, desc: 'Custo -3' } },
    Dragão: { 2: { doubleDamage: true, desc: 'Dano x2' } }
  };

  // Calcula bônus totais para exibição
  let totalAtkBonus = 0;
  let totalDefBonus = 0;
  const activeEffects = [];

  for (const [region, count] of Object.entries(synergies.regions)) {
    if (count >= 3) {
      const bonus = regionBonuses[region];
      if (bonus && bonus[3]) {
        totalAtkBonus += bonus[3].atk || 0;
        totalDefBonus += bonus[3].def || 0;
        activeEffects.push(`${region} x${count}: ${bonus[3].desc}`);
      }
      if (count >= 5 && bonus && bonus[5]) {
        totalAtkBonus += bonus[5].atk || 0;
        totalDefBonus += bonus[5].def || 0;
        activeEffects.push(`${region} x${count}: ${bonus[5].desc}`);
      }
      if (count >= 6 && bonus && bonus[6]) {
        activeEffects.push(`${region} x${count}: ${bonus[6].desc}`);
      }
    }
  }

  for (const [className, count] of Object.entries(synergies.classes)) {
    if (count >= 2) {
      const bonus = classBonuses[className];
      if (bonus && bonus[2]) {
        totalAtkBonus += bonus[2].atk || 0;
        totalDefBonus += bonus[2].def || 0;
        activeEffects.push(`${className} x${count}: ${bonus[2].desc}`);
      }
      if (count >= 4 && bonus && bonus[4]) {
        totalAtkBonus += bonus[4].atk || 0;
        totalDefBonus += bonus[4].def || 0;
        activeEffects.push(`${className} x${count}: ${bonus[4].desc}`);
      }
    }
  }

  if (activeEffects.length === 0) {
    return (
      <div style={{ marginTop: '10px', background: 'rgba(10, 10, 10, 0.8)', border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
        <h4 style={{ color: '#e94560', textTransform: 'uppercase', fontSize: '14px', marginBottom: '10px' }}>🔗 Sinergias Ativas</h4>
        <p style={{ fontSize: '12px', color: '#666' }}>Nenhuma sinergia ativa</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '10px', background: 'rgba(10, 10, 10, 0.8)', border: '1px solid #e94560', padding: '15px', borderRadius: '8px', boxShadow: '0 0 15px rgba(233, 69, 96, 0.2)' }}>
      <h4 style={{ color: '#e94560', textTransform: 'uppercase', fontSize: '14px', marginBottom: '10px' }}>🔗 Sinergias Ativas</h4>
      
      {(totalAtkBonus > 0 || totalDefBonus > 0) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px', 
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#000',
          border: '1px solid #333',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff4d4d' }}>
              +{totalAtkBonus}
            </div>
            <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>ATK Extra</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
              +{totalDefBonus}
            </div>
            <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>DEF Extra</div>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '12px' }}>
        {activeEffects.map((effect, idx) => (
          <div key={idx} style={{ 
            fontSize: '11px', 
            color: '#fff', 
            marginBottom: '6px',
            padding: '4px 8px',
            background: 'rgba(233, 69, 96, 0.15)',
            borderLeft: '3px solid #e94560',
            borderRadius: '2px'
          }}>
            <span style={{color: '#ff4d4d', marginRight: '5px'}}>✨</span> {effect}
          </div>
        ))}
      </div>
      
      <p style={{ fontSize: '10px', color: '#666', marginTop: '15px', textAlign: 'center', fontStyle: 'italic' }}>
        ⚠️ Bônus calculados durante o combate
      </p>
    </div>
  );
}