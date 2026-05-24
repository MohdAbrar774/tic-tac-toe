import { useEffect, useRef, useState } from 'react'

const AMBIENCE_VOLUME = 0.075

function createForestAmbience() {
  if (typeof window === 'undefined') {
    return null
  }

  const AudioContext = window.AudioContext || window.webkitAudioContext

  if (!AudioContext) {
    return null
  }

  const context = new AudioContext()
  const master = context.createGain()
  const timeouts = new Set()
  const steadySources = []

  master.gain.setValueAtTime(0.0001, context.currentTime)
  master.connect(context.destination)

  const noiseBuffer = context.createBuffer(1, Math.floor(context.sampleRate * 2), context.sampleRate)
  const noiseData = noiseBuffer.getChannelData(0)

  for (let index = 0; index < noiseData.length; index += 1) {
    noiseData[index] = (Math.random() * 2 - 1) * 0.32
  }

  const nightAir = context.createBufferSource()
  const airFilter = context.createBiquadFilter()
  const airGain = context.createGain()

  nightAir.buffer = noiseBuffer
  nightAir.loop = true
  airFilter.type = 'lowpass'
  airFilter.frequency.value = 620
  airGain.gain.value = 0.1

  nightAir.connect(airFilter)
  airFilter.connect(airGain)
  airGain.connect(master)
  nightAir.start()
  steadySources.push(nightAir)

  function playSparkle() {
    const now = context.currentTime
    const frequency = 2400 + Math.random() * 2400
    const oscillator = context.createOscillator()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(frequency, now)
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * (1.08 + Math.random() * 0.16),
      now + 0.12,
    )
    filter.type = 'bandpass'
    filter.frequency.value = frequency
    filter.Q.value = 5
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.026 + Math.random() * 0.022, now + 0.025)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)

    oscillator.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    oscillator.start(now)
    oscillator.stop(now + 0.2)
  }

  function playCricketCluster() {
    const now = context.currentTime

    for (let tick = 0; tick < 3; tick += 1) {
      const start = now + tick * 0.09
      const oscillator = context.createOscillator()
      const gain = context.createGain()

      oscillator.type = 'triangle'
      oscillator.frequency.setValueAtTime(3200 + Math.random() * 520, start)
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.018, start + 0.012)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.055)

      oscillator.connect(gain)
      gain.connect(master)
      oscillator.start(start)
      oscillator.stop(start + 0.07)
    }
  }

  function scheduleSound(callback, minDelay, maxDelay) {
    const delay = minDelay + Math.random() * (maxDelay - minDelay)
    const timeoutId = window.setTimeout(() => {
      timeouts.delete(timeoutId)
      callback()
      scheduleSound(callback, minDelay, maxDelay)
    }, delay)

    timeouts.add(timeoutId)
  }

  scheduleSound(playSparkle, 650, 1700)
  scheduleSound(playCricketCluster, 2200, 4600)

  return {
    async start() {
      if (context.state === 'suspended') {
        await context.resume()
      }

      master.gain.exponentialRampToValueAtTime(AMBIENCE_VOLUME, context.currentTime + 0.45)
    },
    stop() {
      for (const timeoutId of timeouts) {
        window.clearTimeout(timeoutId)
      }

      timeouts.clear()
      master.gain.cancelScheduledValues(context.currentTime)
      master.gain.setTargetAtTime(0.0001, context.currentTime, 0.07)

      window.setTimeout(() => {
        for (const source of steadySources) {
          try {
            source.stop()
          } catch {
            // Source may already be stopped during fast toggles.
          }
        }

        context.close()
      }, 280)
    },
  }
}

export function useForestAmbience() {
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [isAudioAvailable, setIsAudioAvailable] = useState(true)
  const ambienceRef = useRef(null)

  async function toggleSound() {
    if (ambienceRef.current) {
      ambienceRef.current.stop()
      ambienceRef.current = null
      setIsSoundOn(false)
      return
    }

    const nextAmbience = createForestAmbience()

    if (!nextAmbience) {
      setIsAudioAvailable(false)
      return
    }

    ambienceRef.current = nextAmbience

    try {
      await nextAmbience.start()
      setIsSoundOn(true)
    } catch {
      nextAmbience.stop()
      ambienceRef.current = null
      setIsAudioAvailable(false)
      setIsSoundOn(false)
    }
  }

  useEffect(() => {
    return () => {
      ambienceRef.current?.stop()
    }
  }, [])

  return { isSoundOn, isAudioAvailable, toggleSound }
}
