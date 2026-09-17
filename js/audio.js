// Web Audio API Procedural Sound Engine for Ganesh Aarti & Minecraft Game
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = false;
        this.aartiInterval = null;
        this.isAartiPlaying = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        return this.isMuted;
    }

    // Authentic Temple Brass Bell (Ghanti)
    playTempleBell(freq = 1800, duration = 1.8) {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        const harmonics = [1, 1.45, 1.95, 2.75];
        const gains = [0.4, 0.25, 0.15, 0.1];

        harmonics.forEach((h, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq * h, now);
            // Slight pitch drop for metallic bell decay
            osc.frequency.exponentialRampToValueAtTime(freq * h * 0.99, now + duration);

            gain.gain.setValueAtTime(gains[i], now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + duration);
        });
    }

    // Sacred Shankha (Conch Shell) Sound
    playShankh(duration = 2.5) {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc2.type = 'triangle';

        // Conch horn frequency glide up and slight vibrato
        osc1.frequency.setValueAtTime(175, now);
        osc1.frequency.linearRampToValueAtTime(230, now + 0.6);
        osc1.frequency.setValueAtTime(230, now + duration - 0.5);
        osc1.frequency.linearRampToValueAtTime(200, now + duration);

        osc2.frequency.setValueAtTime(350, now);
        osc2.frequency.linearRampToValueAtTime(460, now + 0.6);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.4);
        gain.gain.setValueAtTime(0.35, now + duration - 0.6);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    }

    // Aarti Pooja Rhythmic Ceremony
    startAartiMelody(onTick) {
        if (this.isAartiPlaying) return;
        this.init();
        this.isAartiPlaying = true;

        // Sound the Conch first!
        this.playShankh(2.2);

        // Aarti notes (Raag Bhupali / Devotional pentatonic scale: Sa, Re, Ga, Pa, Dha)
        const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50];
        let step = 0;

        setTimeout(() => {
            if (!this.isAartiPlaying) return;
            this.aartiInterval = setInterval(() => {
                if (!this.isAartiPlaying) return;

                // Rhythmic ghanti ring
                this.playTempleBell(notes[step % notes.length], 1.2);
                if (step % 2 === 0) {
                    this.playTempleBell(2200, 0.8);
                }

                if (onTick) onTick(step);
                step++;
            }, 380);
        }, 1200);
    }

    stopAarti() {
        this.isAartiPlaying = false;
        if (this.aartiInterval) {
            clearInterval(this.aartiInterval);
            this.aartiInterval = null;
        }
    }

    // Minecraft-style block place sound
    playPlaceBlock() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.08);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    // Minecraft-style block break sound
    playBreakBlock() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        
        // White noise burst
        const bufferSize = this.ctx.sampleRate * 0.09;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 600;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.09);
    }

    // Divine Sparkle / Flower Blessing Chime
    playSparkle() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const chord = [1046.50, 1318.51, 1567.98, 2093.00];

        chord.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const delay = idx * 0.07;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + delay);

            gain.gain.setValueAtTime(0.12, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.6);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now + delay);
            osc.stop(now + delay + 0.6);
        });
    }

    // Celebratory Level Complete Fanfare (Brass Chimes + Auspicious Conch Glide)
    playLevelComplete() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;

        // 1. Triumphant Ascending Arpeggio Chime (C5 - E5 - G5 - C6 - E6)
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const time = now + idx * 0.12;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, time);

            gain.gain.setValueAtTime(0.25, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.9);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(time);
            osc.stop(time + 0.9);
        });

        // 2. Auspicious Conch flourish after arpeggio
        setTimeout(() => {
            this.playShankh(2.2);
        }, 500);

        // 3. Sparkle shower chime
        setTimeout(() => {
            this.playSparkle();
        }, 1100);
    }

    // Jolly Divine Ganesha Laughter Chime
    playGaneshaLaugh() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        const pitches = [523.25, 659.25, 523.25, 659.25, 783.99];

        pitches.forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const start = now + i * 0.12;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, start);
            osc.frequency.exponentialRampToValueAtTime(f * 1.08, start + 0.08);

            gain.gain.setValueAtTime(0.18, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.14);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(start);
            osc.stop(start + 0.15);
        });
    }

    // Sacred Modak Pickup Chime
    playModakCollect() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        [880, 1174.66, 1760].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.06;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.15, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.35);
        });
    }

    // Friendly Companion Greeting Chime
    playCompanionGreeting() {
        if (this.isMuted) return;
        this.init();
        const now = this.ctx.currentTime;
        [659.25, 880.00, 987.77, 1318.51].forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const t = now + idx * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.14, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(t);
            osc.stop(t + 0.5);
        });
    }
}

window.soundEngine = new SoundEngine();

// Unlock Web Audio on iOS Safari and mobile browsers on first tap
['touchstart', 'touchend', 'click'].forEach(evt => {
    window.addEventListener(evt, function unlockAudio() {
        if (window.soundEngine) {
            window.soundEngine.init();
        }
        window.removeEventListener(evt, unlockAudio);
    }, { passive: true });
});
