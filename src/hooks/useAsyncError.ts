import { useCallback, useState } from "react";

export const useAsyncError = () => {
  const [_, setError] = useState<Error | null>(null);
  const throwError = useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);

  return { throwError };
};
