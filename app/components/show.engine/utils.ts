export function calculateNextScore(current: number, target: number): number {
  if (current >= target) return target;

  const remaining = target - current;

  const maxStep = Math.max(1, Math.ceil(remaining / 3));

  const step = Math.floor(
    Math.random() * maxStep
  ) + 1;

  return Math.min(current + step, target);
}

