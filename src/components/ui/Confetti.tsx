import confetti from 'canvas-confetti';

export const triggerConfetti = () => {
  // Center burst
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#047857', '#fbbf24', '#fef08a', '#f59e0b', '#34d399', '#ffffff']
  });

  // Left shower
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.8 },
      colors: ['#047857', '#fbbf24', '#fef08a']
    });
  }, 150);

  // Right shower
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.8 },
      colors: ['#047857', '#fbbf24', '#fef08a']
    });
  }, 300);
};

export default triggerConfetti;
