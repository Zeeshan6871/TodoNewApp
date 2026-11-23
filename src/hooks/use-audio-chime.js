"use client";

import { useCallback, useRef } from "react";

/**
 * Web Audio API synthesizer for reminder alerts.
 * Generates an elegant, high-definition melodic chime with zero external audio assets.
 */
export function useAudioChime() {
  const audioCtxRef = useRef(null);

  const playChime = useCallback((type = "melodic") => {
    try {
      if (typeof window === "undefined") return;

      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        audioCtxRef.current = new AudioContextClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      if (type === "urgent") {
        // High urgency two-tone alert
        const notes = [659.25, 880.0]; // E5 -> A5
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.3, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.4);
        });
      } else {
        // Smooth crystal notification bell (D5 -> F#5 -> A5 chord chime)
        const chord = [587.33, 739.99, 880.0];
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);

          gain.gain.setValueAtTime(0, now + idx * 0.08);
          gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.08 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.65);
        });
      }
    } catch (e) {
      console.warn("Audio chime autoplay blocked or not supported:", e);
    }
  }, []);

  return { playChime };
}

