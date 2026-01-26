// src/utils/SoundEffects.js - FIXED AUDIO WITH USER INTERACTION
class SoundEffects {
  constructor() {
    this.enabled = true
    this.audioContext = null
    this.masterGain = null
    this.initialized = false
  }

  // Initialize audio context - MUST be called after user interaction
  initialize() {
    if (this.initialized) return true

    try {
      this.audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.gain.value = 0.3
      this.masterGain.connect(this.audioContext.destination)
      this.initialized = true
      console.log('🔊 Audio initialized successfully')
      return true
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
      this.enabled = false
      return false
    }
  }

  // Resume audio context if suspended (Chrome autoplay policy)
  async resumeContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume()
        console.log('🔊 Audio context resumed')
      } catch (e) {
        console.warn('Could not resume audio context:', e)
      }
    }
  }

  // Ensure audio is ready before playing
  async ensureReady() {
    if (!this.initialized) {
      this.initialize()
    }
    await this.resumeContext()
  }

  playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled || !this.audioContext || !this.initialized) return

    // Resume context if needed
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.type = type
      oscillator.frequency.value = frequency

      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration,
      )

      oscillator.connect(gainNode)
      gainNode.connect(this.masterGain)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch (e) {
      console.warn('Error playing tone:', e)
    }
  }

  // Thought added sound
  thoughtAdded() {
    this.playTone(523.25, 0.1, 'sine', 0.2) // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.15), 50) // E5
  }

  // Thought grabbed/dragged
  thoughtGrabbed() {
    this.playTone(440, 0.05, 'sine', 0.15) // A4
  }

  // Thought released
  thoughtReleased() {
    this.playTone(349.23, 0.08, 'sine', 0.12) // F4
  }

  // NEW: Collision sound - soft bump
  collision(intensity = 0.5) {
    const freq = 80 + intensity * 120 // Lower frequency for soft bump
    this.playTone(freq, 0.08, 'sine', 0.1 * intensity)
  }

  // NEW: Soft particle collision - very subtle
  particleCollision() {
    // Very soft, subtle sound
    this.playTone(200 + Math.random() * 100, 0.03, 'sine', 0.05)
  }

  // Attraction sound
  attraction() {
    this.playTone(880, 0.05, 'sine', 0.08)
    setTimeout(() => this.playTone(1046.5, 0.05, 'sine', 0.06), 30)
  }

  // Zone entered sound
  zoneEntered(zoneType) {
    const frequencies = {
      creative: 587.33,
      focus: 659.25,
      organize: 698.46,
      relax: 523.25,
    }
    this.playTone(frequencies[zoneType] || 523.25, 0.15, 'triangle', 0.12)
  }

  // Connection made sound
  connectionMade() {
    this.playTone(800, 0.1, 'sine', 0.15)
    setTimeout(() => this.playTone(1000, 0.1, 'sine', 0.12), 50)
  }

  // Ambient background (optional)
  playAmbient() {
    if (!this.enabled || !this.audioContext || !this.initialized) return null

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.value = 110

    gainNode.gain.value = 0.02

    oscillator.connect(gainNode)
    gainNode.connect(this.masterGain)

    oscillator.start()

    return () => oscillator.stop()
  }

  setEnabled(enabled) {
    this.enabled = enabled
    if (enabled && !this.initialized) {
      this.initialize()
    }
  }

  setVolume(volume) {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume))
    }
  }
}

export const soundEffects = new SoundEffects()
