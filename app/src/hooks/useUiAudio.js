import { useCallback, useEffect, useRef } from 'react';

const soundProfiles = {
  reactor: {
    wave: 'triangle',
    gain: 0.03,
    refresh: [180, 280, 420],
    purge: [120, 100, 82],
    save: [330, 440],
    copy: [520, 680],
    switch: [260, 340]
  },
  arcade: {
    wave: 'square',
    gain: 0.022,
    refresh: [260, 390, 560],
    purge: [150, 110, 80],
    save: [480, 620],
    copy: [660, 880],
    switch: [420, 520]
  },
  stealth: {
    wave: 'sine',
    gain: 0.026,
    refresh: [220, 300, 360],
    purge: [140, 120, 98],
    save: [370, 480],
    copy: [480, 540],
    switch: [280, 320]
  }
};

export function useUiAudio(enabled, preset) {
  const audioContextRef = useRef(null);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close?.();
    };
  }, []);

  const playSound = useCallback(
    async (eventName) => {
      if (!enabled || typeof window === 'undefined') {
        return;
      }

      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextCtor) {
        return;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextCtor();
      }

      const context = audioContextRef.current;

      if (context.state === 'suspended') {
        await context.resume();
      }

      const profile = soundProfiles[preset] ?? soundProfiles.reactor;
      const tones = profile[eventName] ?? profile.switch;
      const startAt = context.currentTime;

      tones.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        const toneStart = startAt + index * 0.055;
        const toneEnd = toneStart + 0.12;

        oscillator.type = profile.wave;
        oscillator.frequency.setValueAtTime(frequency, toneStart);
        gainNode.gain.setValueAtTime(0.0001, toneStart);
        gainNode.gain.exponentialRampToValueAtTime(profile.gain, toneStart + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, toneEnd);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start(toneStart);
        oscillator.stop(toneEnd + 0.02);
      });
    },
    [enabled, preset]
  );

  return {
    playSound,
    soundProfiles
  };
}