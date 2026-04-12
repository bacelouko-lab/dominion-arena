import React from 'react';

const regionData = [
  { name: 'Solari', levels: [
    { threshold: 2, desc: 'Poder (POW) +2 para todos Solari' },
    { threshold: 4, desc: 'Invocador do Sol: +4 POW adicional' },
    { threshold: 5, desc: 'Ascensão Total: POW x1.5 para a equipe' }
  ]},
  { name: 'Gladius', levels: [
    { threshold: 2, desc: 'Guarda (GRD) +2 para todos Gladius' },
    { threshold: 4, desc: 'Aparada: Ignora 2 de dano recebido' },
    { threshold: 5, desc: 'Retaliação: Reflete 50% do dano na Guarda' }
  ]},
  { name: 'Aether', levels: [
    { threshold: 2, desc: 'Mágica: +1 dado de ouro' },
    { threshold: 4, desc: 'Economia: 1 carta grátis por turno' },
    { threshold: 5, desc: 'Transcendência: Todos os dados revelam 6' }
  ]},
  { name: 'Veridian', levels: [
    { threshold: 2, desc: 'Cura: Recupera 2 de vida ao fim do turno' },
    { threshold: 4, desc: 'Simbiose: Transfere 2 POW para o aliado mais forte' },
    { threshold: 5, desc: 'Vitalidade: Vida Máxima +5' }
  ]},
  { name: 'Umbra', levels: [
    { threshold: 2, desc: 'Penumbra: Ignora 2 de GRD do oponente' },
    { threshold: 4, desc: 'Execução: Derrota inimigos com menos de 3 vida' },
    { threshold: 5, desc: 'Lâmina Maldita: Dano causado ignora escudos' }
  ]}
];

const classData = [
  { name: 'Vanguarda', levels: [
    { threshold: 2, desc: 'Muralha: Guarda +3' },
    { threshold: 4, desc: 'Invulnerável: Bloqueia o primeiro ataque do round' }
  ]},
  { name: 'Algoz', levels: [
    { threshold: 2, desc: 'Foco: Poder +4' },
    { threshold: 4, desc: 'Crítico: 20% de causar dano dobrado' }
  ]},
  { name: 'Erudito', levels: [
    { threshold: 2, desc: 'Perspicácia: Custo de todas as cartas -2' },
    { threshold: 4, desc: 'Gênio: Cartas custam -4' }
  ]},
  { name: 'Zelador', levels: [
    { threshold: 2, desc: 'Suporte: Cura 2 de vida ao fim do turno' },
    { threshold: 4, desc: 'Bênção: Cura 3 de vida adicional' }
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
