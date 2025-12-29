import { useCallback, useRef } from "react";

// Simple notification sound using Web Audio API
export function useNotificationSound() {
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback((frequency = 800, duration = 0.15) => {
    try {
      // Create or reuse AudioContext
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      const ctx = audioContextRef.current;
      
      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = "sine";

      // Fade in and out for a pleasant sound
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  }, []);

  const playMessageSound = useCallback(() => {
    // Play a pleasant two-tone notification
    playSound(880, 0.1);
    setTimeout(() => playSound(1100, 0.15), 100);
  }, [playSound]);

  const playNewChatSound = useCallback(() => {
    // Play a more attention-grabbing three-tone notification
    playSound(660, 0.1);
    setTimeout(() => playSound(880, 0.1), 120);
    setTimeout(() => playSound(1100, 0.15), 240);
  }, [playSound]);

  return { playMessageSound, playNewChatSound };
}
