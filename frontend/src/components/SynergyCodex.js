import React from 'react';

const regionData = [
  { name: 'Vulcão', levels: [
    { threshold: 3, desc: 'ATK +3' },
    { threshold: 5, desc: 'ATK +2 (Total +5)' },
    { threshold: 6, desc: 'ATK x1.5' }
  ]},
  { name: 'Montanha', levels: [
    { threshold: 3, desc: 'DEF +3' },
    { threshold: 5, desc: 'ATK +2 / DEF +5' },
    { threshold: 6, desc: 'DEF +5 adicional' }
  ]},
  { name: 'Céu', levels: [
    { threshold: 3, desc: 'Ganha 2 dados fixos' },
    { threshold: 5, desc: '1 carta de custo 0' },
    { threshold: 6, desc: '+2 ATK por cada ponto de dado' }
  ]},
  { name: 'Lago', levels: [
    { threshold: 3, desc: 'Dado par concede +3 ATK' },
    { threshold: 5, desc: 'Escolhe o melhor entre os dados rolados' },
    { threshold: 6, desc: 'Mínimo de 6 nos dados / +2 DEF' }
  ]},
  { name: 'Floresta', levels: [
    { threshold: 3, desc: 'ATK +2 / DEF +2' },
    { threshold: 4, desc: 'Copia sinergia de um aliado' },
    { threshold: 5, desc: 'Copia sinergia (Evoluído)' }
  ]},
  { name: 'Deserto', levels: [
    { threshold: 3, desc: 'Pode escolher o alvo do ataque' },
    { threshold: 5, desc: 'Anula a 1ª carta do oponente' },
    { threshold: 6, desc: 'Impede sinergias do oponente contra você' }
  ]}
];

const classData = [
  { name: 'Guerreiro', levels: [
    { threshold: 2, desc: 'ATK +2' },
    { threshold: 4, desc: 'DEF +4' }
  ]},
  { name: 'Mago', levels: [
    { threshold: 2, desc: '2 de Dano Direto à vida' },
    { threshold: 4, desc: 'Ativa Habilidade Ativa 2x' }
  ]},
  { name: 'Ladino', levels: [
    { threshold: 2, desc: 'Ignora 2 de DEF do alvo' },
    { threshold: 4, desc: 'Anula 1 carta aleatória do alvo' }
  ]},
  { name: 'Suporte', levels: [
    { threshold: 2, desc: 'Cura 2 de vida' },
    { threshold: 4, desc: 'DEF +3 e Cura 3 de vida' }
  ]},
  { name: 'Monstro', levels: [
    { threshold: 2, desc: 'ATK +1' },
    { threshold: 4, desc: 'ATK +2' }
  ]},
  { name: 'Mercador', levels: [
    { threshold: 2, desc: 'Custo de cartas -1' },
    { threshold: 4, desc: 'Custo de cartas -3' }
  ]},
  { name: 'Dragão', levels: [
    { threshold: 2, desc: 'Dano final x2 em combate' }
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
        borderLeft: '2px solid #e94560',
        padding: '20px',
        zIndex: 1000,
        transition: 'right 0.3s ease-in-out',
        overflowY: 'auto',
        boxShadow: '-5px 0 20px rgba(0,0,0,0.5)',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#e94560', margin: 0, fontSize: '18px', textTransform: 'uppercase', letterSpacing: '2px' }}>📖 Codex de Guerra</h2>
          <button 
            onClick={onClose}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#e94560', 
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
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: currentCount > 0 ? '#ff4d4d' : '#fff' }}>
                  {region.name} {currentCount > 0 && <span style={{fontSize: '10px', color: '#ff4d4d'}}>({currentCount})</span>}
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
                      borderLeft: isActive ? '2px solid #e94560' : '2px solid transparent'
                    }}>
                      <span style={{ fontWeight: 'bold', color: isActive ? '#e94560' : 'inherit' }}>{lvl.threshold}+:</span> {lvl.desc}
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
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: currentCount > 0 ? '#ff4d4d' : '#fff' }}>
                  {cls.name} {currentCount > 0 && <span style={{fontSize: '10px', color: '#ff4d4d'}}>({currentCount})</span>}
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
                      borderLeft: isActive ? '2px solid #e94560' : '2px solid transparent'
                    }}>
                      <span style={{ fontWeight: 'bold', color: isActive ? '#e94560' : 'inherit' }}>{lvl.threshold}+:</span> {lvl.desc}
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
