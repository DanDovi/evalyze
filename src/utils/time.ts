export const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds.toFixed(1)}s`;
  }

  return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
};