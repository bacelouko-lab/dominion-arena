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
    
    // Defer loading to when sounds are needed or initialization
    if (typeof window !== 'undefined') {
      this.muted = localStorage.getItem('dominion_muted') === 'true';
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

      // Usar uma nova instância cada vez para permitir sobreposição de sons idênticos
      const audio = new Audio(url);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio playback prevented:', e));
    } catch (err) {
      console.error('Error playing sound:', err);
    }
  }
}

const soundManager = new SoundManager();
export default soundManager;
