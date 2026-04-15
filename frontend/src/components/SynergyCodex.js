import React from 'react';

const regionData = [
  { name: 'Solari', levels: [
    { threshold: 3, desc: 'Poder (POW) +4 para todos' },
    { threshold: 4, desc: 'Dano Sagrado: +4 de Dano Direto' },
    { threshold: 5, desc: 'Supernova: Multiplica o dano final por 2' }
  ]},
  { name: 'Gladius', levels: [
    { threshold: 3, desc: 'Fortaleza: Guarda (GRD) +4' },
    { threshold: 4, desc: 'Reflexo Real: Reflete 40% do dano sofrido' },
    { threshold: 5, desc: 'Indestrutível: Dano máximo recebido limitado a 5' }
  ]},
  { name: 'Aether', levels: [
    { threshold: 3, desc: 'Tesouro: +2 de Ouro bônus por turno' },
    { threshold: 4, desc: 'Foco Arcano: Fixa em 2 dados para rolar' },
    { threshold: 5, desc: 'Perfeição: Todos os dados revelam 6' }
  ]},
  { name: 'Veridian', levels: [
    { threshold: 3, desc: 'Regeneração: Cura +3 de vida por turno' },
    { threshold: 4, desc: 'Super-Vida: Vida Máxima +10' },
    { threshold: 5, desc: 'Vitalidade Profunda: Dobra efeitos de cura' }
  ]},
  { name: 'Umbra', levels: [
    { threshold: 3, desc: 'Escuridão: POW +2 e GRD +2' },
    { threshold: 4, desc: 'Abate: 30% de chance de destruir carta inimiga' },
    { threshold: 5, desc: 'Vazio: Desativa bônus de sinergia do oponente' }
  ]}
];

const classData = [
  { name: 'Vanguarda', levels: [
    { threshold: 2, desc: 'Muralha: Guarda +5' },
    { threshold: 4, desc: 'Invulnerável: Imune a Dano Direto' }
  ]},
  { name: 'Algoz', levels: [
    { threshold: 2, desc: 'Foco: Poder +5' },
    { threshold: 4, desc: 'Crítico: 30% de causar dano dobrado' }
  ]},
  { name: 'Erudito', levels: [
    { threshold: 2, desc: 'Iniciação: +1 POW, +1 GRD e +1 Ouro por turno' },
    { threshold: 4, desc: 'Iluminação: +10% de Reflexão e +10% de Crítico' }
  ]},
  { name: 'Zelador', levels: [
    { threshold: 2, desc: 'Sorte: 50% chance de +2 POW ou +2 cura' },
    { threshold: 4, desc: 'Milagre: Restaura vida máxima após combate' }
  ]}
];

export default function SynergyCodex({ isOpen, onClose, userSynergies }) {
  const regions = userSynergies?.regions || {};
  const classes = userSynergies?.classes || {};

  return (
    <>
      {/* Overlay para fechar ao clicar fora */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Painel Lateral */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: isOpen ? 0 : '-350px',
        width: '320px',
        height: '100vh',
        background: '#0a0a0a',
        borderLeft: '2px solid var(--accent-color)',
        padding: '20px',
        zIndex: 1000,
        transition: 'right 0.3s ease-in-out',
        overflowY: 'auto',
        boxShadow: '-5px 0 20px rgba(0,0,0,0.5)',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--accent-color)', margin: 0, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px' }}>📖 Codex de Guerra</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-color)', 
              fontSize: '24px', 
              cursor: 'pointer' 
            }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: '11px', color: '#888', marginBottom: '20px', fontStyle: 'italic' }}>
          Combine cartas da mesma Região ou Classe para desbloquear bônus poderosos em combate.
        </p>

        <section style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '14px', color: '#ffcc00', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>🗺️ REGIÕES</h3>
          {regionData.map(region => {
            const currentCount = regions[region.name] || 0;
            return (
              <div key={region.name} style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: currentCount > 0 ? 'var(--accent-color)' : '#fff' }}>
                  {region.name} {currentCount > 0 && <span style={{fontSize: '10px', color: 'var(--accent-color)'}}>({currentCount})</span>}
                </div>
                {region.levels.map((lvl, idx) => {
                  const isActive = currentCount >= lvl.threshold;
                  return (
                    <div key={idx} style={{ 
                      fontSize: '11px', 
                      marginLeft: '10px', 
                      marginTop: '4px',
                      color: isActive ? '#fff' : '#666',
                      padding: '4px',
                      backgroundColor: isActive ? 'rgba(233, 69, 96, 0.2)' : 'transparent',
                      borderRadius: '4px',
                      borderLeft: isActive ? '2px solid var(--accent-color)' : '2px solid transparent'
                    }}>
                      <span style={{ fontWeight: 'bold', color: isActive ? 'var(--accent-color)' : 'inherit' }}>{lvl.threshold}+:</span> {lvl.desc}
                      {isActive && <span style={{ marginLeft: '5px' }}>✅</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>

        <section>
          <h3 style={{ fontSize: '14px', color: '#ffcc00', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>🛡️ CLASSES</h3>
          {classData.map(cls => {
            const currentCount = classes[cls.name] || 0;
            return (
              <div key={cls.name} style={{ marginBottom: '15px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: currentCount > 0 ? 'var(--accent-color)' : '#fff' }}>
                  {cls.name} {currentCount > 0 && <span style={{fontSize: '10px', color: 'var(--accent-color)'}}>({currentCount})</span>}
                </div>
                {cls.levels.map((lvl, idx) => {
                  const isActive = currentCount >= lvl.threshold;
                  return (
                    <div key={idx} style={{ 
                      fontSize: '11px', 
                      marginLeft: '10px', 
                      marginTop: '4px',
                      color: isActive ? '#fff' : '#666',
                      padding: '4px',
                      backgroundColor: isActive ? 'rgba(233, 69, 96, 0.2)' : 'transparent',
                      borderRadius: '4px',
                      borderLeft: isActive ? '2px solid var(--accent-color)' : '2px solid transparent'
                    }}>
                      <span style={{ fontWeight: 'bold', color: isActive ? 'var(--accent-color)' : 'inherit' }}>{lvl.threshold}+:</span> {lvl.desc}
                      {isActive && <span style={{ marginLeft: '5px' }}>✅</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
