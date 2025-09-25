export type RoundResult = {
  correct: number;
  total: number;
  mistakes: number;
  durationMs: number;
};

export function accuracy(result: RoundResult): number {
  if (result.total === 0) return 0;
  return (result.correct / result.total) * 100;
}

export function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 100) / 10;
  return `${seconds.toFixed(1)}s`;
}
