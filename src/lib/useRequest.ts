import { useEffect, useState } from 'react';
import { errorMessage } from '../api/client';
import type { RequestState } from '../types';

interface Result<T> { key: string; value: RequestState<T> }

export function useRequest<T>(key: string, enabled: boolean, load: (signal: AbortSignal) => Promise<T>, delay = 0): RequestState<T> {
  const [result, setResult] = useState<Result<T> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      let next: RequestState<T> = { status: 'empty' };
      try {
        const data = await load(controller.signal);
        next = { status: 'success', data };
      } catch (error) {
        if (controller.signal.aborted) return;
        next = { status: 'error', message: errorMessage(error) };
      } finally {
        // Только актуальный запрос завершает своё состояние загрузки.
        if (!controller.signal.aborted) setResult({ key, value: next });
      }
    }, delay);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [key, enabled, load, delay]);

  if (!enabled) return { status: 'empty' };
  return result?.key === key ? result.value : { status: 'loading' };
}
