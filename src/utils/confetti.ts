import confetti from 'canvas-confetti';

export const launchConfetti = () => {
  try {
    // Left side burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 65,
      origin: { x: 0.1, y: 0.7 },
      colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'],
    });

    // Right side burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 65,
      origin: { x: 0.9, y: 0.7 },
      colors: ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e'],
    });

    // Central star burst
    setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#fbbf24', '#f43f5e', '#a855f7'],
      });
    }, 200);
  } catch {
    // Ignore confetti errors if canvas fails
  }
};
