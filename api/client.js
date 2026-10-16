export const API_BASE_URL = 'https://openlibrary.org';

export class ApiError extends Error {
  constructor(message, status = 0, kind = 'http') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind;
  }
}

export async function getJson(path, params = {}, signal) {
  const url = new URL(path, API_BASE_URL);
  url.search = new URLSearchParams(params).toString();
  const controller = new AbortController();
  const cancel = () => controller.abort();
  let timedOut = false;
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', cancel, { once: true });
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 20000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new ApiError(`HTTP ${response.status}`, response.status);
    return await response.json();
  } catch (error) {
    if (signal?.aborted) throw new DOMException('Запрос отменён', 'AbortError');
    if (timedOut) throw new ApiError('Сервер не ответил за 20 секунд.', 0, 'timeout');
    if (error instanceof ApiError) throw error;
    if (error instanceof SyntaxError) throw new ApiError('Сервер вернул некорректный JSON.', 0, 'format');
    throw new ApiError('Не удалось подключиться к Open Library.', 0, 'network');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
  }
}

export function errorMessage(error) {
  if (error.kind === 'network') {
    return navigator.onLine === false
      ? 'Нет подключения к интернету. Проверьте сеть и нажмите «Повторить».'
      : 'Не удалось связаться с Open Library. Проверьте подключение и повторите запрос.';
  }
  if (error.kind === 'timeout' || error.kind === 'format') return error.message;
  if (error.status === 404) return 'Книга или запрошенный ресурс не найдены (404).';
  if (error.status === 429) return 'Слишком много запросов (429). Подождите немного и повторите.';
  if (error.status >= 500) return `Ошибка сервера Open Library (${error.status}). Попробуйте позже.`;
  if (error.status >= 400) return `Open Library отклонила запрос (${error.status}). Измените запрос или повторите.`;
  return 'Не удалось загрузить данные. Попробуйте ещё раз.';
}
