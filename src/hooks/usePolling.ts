import { useCallback, useEffect, useRef, useState } from 'react';

export interface UsePollingResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  /** Force an immediate re-fetch outside the normal interval. */
  refresh: () => void;
}

interface UsePollingOptions<T> {
  /** Async function that fetches the data. */
  fn: () => Promise<T>;
  /** Poll interval in ms. Default 10 000 ms. */
  interval?: number;
  /** When false, polling is paused and the last data is retained. Default true. */
  enabled?: boolean;
  /**
   * Extra dependency values. When any value changes the accumulator resets and
   * a fresh fetch runs immediately (master-detail reset pattern).
   */
  deps?: unknown[];
}

/**
 * Polls an async function at a fixed interval and exposes the latest result.
 *
 * Patterns applied from the uipath-coded-apps skill:
 *  - JSON diff prevents no-op re-renders when the response is identical.
 *  - `lastDataRef` prevents tearing down an existing UI when a poll fails.
 *  - `deps` triggers an immediate reset when the selected item changes.
 */
export function usePolling<T>({
  fn,
  interval = 10_000,
  enabled = true,
  deps = [],
}: UsePollingOptions<T>): UsePollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  // tick is incremented by refresh() to force an immediate re-fetch
  const [tick, setTick] = useState(0);
  // Stores the last successful JSON snapshot for diff comparison
  const lastJsonRef = useRef<string>('');
  const lastDataRef = useRef<T | null>(null);

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    // Reset on dep changes (e.g. when the user selects a different patient)
    lastJsonRef.current = '';
    setLoading(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const result = await fn();
        if (cancelled) return;

        const json = JSON.stringify(result);
        if (json !== lastJsonRef.current) {
          lastJsonRef.current = json;
          lastDataRef.current = result;
          setData(result);
        }
        setError(null);
      } catch (e) {
        if (cancelled) return;
        // Keep the last successful data so the UI doesn't go blank on a transient error
        if (lastDataRef.current !== null) setData(lastDataRef.current);
        setError(e as Error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    poll();
    const timer = setInterval(poll, interval);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, enabled, tick, ...deps]);

  return { data, error, loading, refresh };
}
