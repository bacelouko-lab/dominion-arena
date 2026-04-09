const SOUNDS = {
  dice: 'https://assets.mixkit.co/sfx/preview/mixkit-dice-roll-on-wooden-table-1110.mp3',
  buy: 'https://assets.mixkit.co/sfx/preview/mixkit-coins-handling-1939.mp3',
  place: 'https://assets.mixkit.co/sfx/preview/mixkit-quick-positive-video-game-notification-2603.mp3',
  attack: 'https://assets.mixkit.co/sfx/preview/mixkit-sword-strikes-armor-2761.mp3',
  heal: 'https://assets.mixkit.co/sfx/preview/mixkit-magic-sparkle-shimmer-2218.mp3',
  evolve: 'https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3',
  turn: 'https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3',
  victory: 'https://assets.mixkit.co/sfx/preview/mixkit-clapping-male-crowd-439.mp3',
  defeat: 'https://assets.mixkit.co/sfx/preview/mixkit-ominous-drums-227.mp3',
  click: 'https://assets.mixkit.co/sfx/preview/mixkit-modern-click-box-check-1120.mp3'
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
