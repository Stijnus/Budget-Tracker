import { useState, useCallback } from "react";

/**
 * Hook for handling API errors in a consistent way across the application
 */
export function useApiError() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Execute an async function with error handling and loading state
   */
  const executeWithErrorHandling = useCallback(
    async <T>(
      asyncFn: () => Promise<T>,
      errorMessage = "An error occurred. Please try again."
    ): Promise<T | null> => {
      try {
        setIsLoading(true);
        setError(null);
        return await asyncFn();
      } catch (err) {
        console.error("API Error:", err);
        
        // Handle different error types
        if (err instanceof Error) {
          setError(err.message || errorMessage);
        } else if (typeof err === "string") {
          setError(err || errorMessage);
        } else {
          setError(errorMessage);
        }
        
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Clear any existing error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    setError,
    isLoading,
    executeWithErrorHandling,
    clearError,
  };
}
