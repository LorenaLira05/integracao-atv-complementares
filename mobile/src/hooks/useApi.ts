import { useState, useCallback } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook genérico para chamadas de API com estado de loading e erro.
 *
 * @example
 * const { data, loading, execute } = useApi(hoursService.getAll);
 * useEffect(() => { execute(1, 10); }, []);
 */
export function useApi<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<{ data: TResult }>,
  options?: UseApiOptions<TResult>,
) {
  const [state, setState] = useState<UseApiState<TResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: TArgs) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await fn(...args);
        setState({ data: response.data, loading: false, error: null });
        options?.onSuccess?.(response.data);
        return response.data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setState({ data: null, loading: false, error: message });
        options?.onError?.(err instanceof Error ? err : new Error(message));
      }
    },
    [fn, options],
  );

  return { ...state, execute };
}
