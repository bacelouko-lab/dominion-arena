const SOUNDS = {
  dice: '/sounds/dice.mp3',
  buy: '/sounds/buy.mp3',
  place: '/sounds/place.mp3',
  attack: '/sounds/attack.mp3',
  heal: '/sounds/heal.mp3',
  evolve: '/sounds/evolve.mp3',
  turn: '/sounds/turn.mp3',
  victory: '/sounds/victory.mp3',
  defeat: '/sounds/defeat.mp3',
  click: '/sounds/click.mp3'
};

class SoundManager {
  constructor() {
    this.audioCache = {};
    this.muted = false;
    this.initialized = false;
    
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem('dominion_muted') === 'true';
      // Pré-carregar os sons
      this.preload();
    }
  }

  preload() {
    if (typeof window === 'undefined') return;
    
    Object.entries(SOUNDS).forEach(([name, url]) => {
      const audio = new Audio(url);
      audio.preload = 'auto';
      audio.load();
      this.audioCache[name] = audio;
    });
  }

  // Método indispensável para "desbloquear" o áudio no navegador após o primeiro clique
  async unlock() {
    if (this.initialized || typeof window === 'undefined') return;
    
    try {
      // Tentar tocar um som silencioso ou apenas criar/retomar o contexto se usássemos WebAudio
      // Aqui, vamos apenas marcar como inicializado e tocar o som de clique se não estiver mudo
      this.initialized = true;
      console.log('🔊 Sistema de áudio desbloqueado pelo usuário.');
      
      if (!this.muted) {
        this.play('click');
      }
    } catch (err) {
      console.error('Falha ao desbloquear áudio:', err);
    }
  }

  setMuted(m) {
    this.muted = m;
    if (typeof window !== 'undefined') {
      localStorage.setItem('dominion_muted', m);
    }
  }

  isMuted() {
    return this.muted;
  }

  play(soundName) {
    if (this.muted || typeof window === 'undefined') return;

    try {
      const url = SOUNDS[soundName];
      if (!url) return;

      // Criamos uma nova instância ou clonamos a existente para permitir sons sobrepostos
      // (Ex: vários dados rolando ou vários ataques seguidos)
      const audio = new Audio(url);
      audio.volume = 0.6; // Ajuste leve no volume
      
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Se o autoplay bloqueou, não logamos como erro fatal, pois o unlock() resolverá no próximo clique
          if (error.name !== 'NotAllowedError') {
            console.warn(`Erro ao tocar som ${soundName}:`, error);
          }
        });
      }
    } catch (err) {
      console.error(`Erro crítico no SoundManager (${soundName}):`, err);
    }
  }
}

const soundManager = new SoundManager();
export default soundManager;
