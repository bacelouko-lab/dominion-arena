import React, { useState } from 'react';
import SynergyCodex from './SynergyCodex';

export default function Synergies({ synergies }) {
  const [isCodexOpen, setIsCodexOpen] = useState(false);

  if (!synergies || !synergies.regions || !synergies.classes) {
    return (
      <div style={{ marginTop: '10px', background: 'rgba(10, 10, 10, 0.8)', border: '1px solid #333', padding: '15px', borderRadius: '8px' }}>
        <h4 style={{ color: 'var(--accent-color)', textTransform: 'uppercase', fontSize: '14px', marginBottom: '10px' }}>🔗 Sinergias Ativas</h4>
        <p style={{ fontSize: '12px', color: '#666' }}>Nenhuma sinergia ativa</p>
        <button 
          onClick={() => setIsCodexOpen(true)}
          style={{
            marginTop: '10px',
            width: '100%',
            background: 'none',
            border: '1px solid #444',
            color: '#888',
            fontSize: '11px',
            padding: '5px',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          📖 Ver Guia de Sinergias
        </button>
        <SynergyCodex 
          isOpen={isCodexOpen} 
          onClose={() => setIsCodexOpen(false)} 
          userSynergies={synergies}
        />
      </div>
    );
  }

  const regionBonuses = {
    Solari: { 2: { atk: 2, desc: 'POW +2' }, 4: { atk: 4, desc: 'POW +4 Adicional' }, 5: { multi: 1.5, desc: 'POW Total x1.5' } },
    Gladius: { 2: { def: 2, desc: 'GRD +2' }, 4: { parry: true, desc: 'Aparada: Ignora 2 Dano' }, 5: { reflect: 0.5, desc: 'Retaliação: 50%' } },
    Aether: { 2: { dice: 1, desc: '+1 Dado' }, 4: { free: true, desc: '1 Carta Grátis' }, 5: { win: true, desc: 'Dados sempre 6' } },
    Veridian: { 2: { heal: 2, desc: 'Cura 2' }, 4: { symbiosis: true, desc: 'Simbiose Ativa' }, 5: { maxLife: 5, desc: 'Vida Máxima +5' } },
    Umbra: { 2: { ignoreGrd: 2, desc: 'Ignora 2 GRD' }, 4: { execute: 3, desc: 'Execução (<3 Vida)' }, 5: { divine: true, desc: 'Dano Divino' } }
  };

  const classBonuses = {
    Vanguarda: { 2: { def: 3, desc: 'GRD +3' }, 4: { shield: true, desc: 'Escudo Protetor' } },
    Algoz: { 2: { atk: 4, desc: 'POW +4' }, 4: { crit: 0.2, desc: 'Crítico: 20%' } },
    Erudito: { 2: { cost: 2, desc: 'Custo -2' }, 4: { cost: 4, desc: 'Custo -4' } },
    Zelador: { 2: { heal: 2, desc: 'Cura 2' }, 4: { heal: 3, desc: 'Cura +3 Adicional' } }
  };

  const activeEffects = [];
  let totalPowBonus = 0;
  let totalGrdBonus = 0;

  for (const [region, count] of Object.entries(synergies.regions)) {
    const bonus = regionBonuses[region];
    if (bonus) {
      if (count >= 2 && bonus[2]) {
        totalPowBonus += bonus[2].atk || 0;
        totalGrdBonus += bonus[2].def || 0;
        activeEffects.push(`${region} (Lv1): ${bonus[2].desc}`);
      }
      if (count >= 4 && bonus[4]) {
        totalPowBonus += bonus[4].atk || 0;
        totalGrdBonus += bonus[4].def || 0;
        activeEffects.push(`${region} (Lv2): ${bonus[4].desc}`);
      }
      if (count >= 5 && bonus[5]) {
        activeEffects.push(`${region} (Lv3): ${bonus[5].desc}`);
      }
    }
  }

  for (const [className, count] of Object.entries(synergies.classes)) {
    const bonus = classBonuses[className];
    if (bonus) {
      if (count >= 2 && bonus[2]) {
        totalPowBonus += bonus[2].atk || 0;
        totalGrdBonus += bonus[2].def || 0;
        activeEffects.push(`${className} (Lv1): ${bonus[2].desc}`);
      }
      if (count >= 4 && bonus[4]) {
        totalPowBonus += bonus[4].atk || 0;
        totalGrdBonus += bonus[4].def || 0;
        activeEffects.push(`${className} (Lv2): ${bonus[4].desc}`);
      }
    }
  }

  return (
    <div style={{ marginTop: '10px', background: 'rgba(10, 10, 10, 0.8)', border: '1px solid var(--accent-color)', padding: '15px', borderRadius: '8px', boxShadow: '0 0 15px rgba(233, 69, 96, 0.2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h4 style={{ color: 'var(--accent-color)', textTransform: 'uppercase', fontSize: '14px', margin: 0 }}>🔗 Sinergias Ativas</h4>
        <button 
          onClick={() => setIsCodexOpen(true)}
          style={{
            background: 'var(--accent-color)',
            border: 'none',
            color: 'white',
            fontSize: '10px',
            padding: '4px 8px',
            cursor: 'pointer',
            borderRadius: '4px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}
        >
          📖 Codex
        </button>
      </div>
      
      {(totalPowBonus > 0 || totalGrdBonus > 0) && (
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
              +{totalPowBonus}
            </div>
            <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Poder (POW)</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>
              +{totalGrdBonus}
            </div>
            <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase' }}>Guarda (GRD)</div>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '12px' }}>
        {activeEffects.length === 0 ? (
          <p style={{ fontSize: '11px', color: '#666', textAlign: 'center' }}>Nenhum bônus numérico ativo</p>
        ) : (
          activeEffects.map((effect, idx) => (
            <div key={idx} style={{ 
              fontSize: '11px', 
              color: '#fff', 
              marginBottom: '6px',
              padding: '4px 8px',
              background: 'rgba(233, 69, 96, 0.15)',
              borderLeft: '3px solid var(--accent-color)',
              borderRadius: '2px'
            }}>
              <span style={{color: '#ff4d4d', marginRight: '5px'}}>✨</span> {effect}
            </div>
          ))
        )}
      </div>
      
      <p style={{ fontSize: '10px', color: '#666', marginTop: '15px', textAlign: 'center', fontStyle: 'italic' }}>
        ⚠️ Bônus de POW/GRD calculados em tempo real
      </p>

      <SynergyCodex 
        isOpen={isCodexOpen} 
        onClose={() => setIsCodexOpen(false)} 
        userSynergies={synergies}
      />
    </div>
  );
}