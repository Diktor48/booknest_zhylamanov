import { Button } from './Button';

interface ErrorBoxProps { message: string; onRetry: () => void }

export function ErrorBox({ message, onRetry }: ErrorBoxProps) {
  return <div className="api-panel" role="alert">
    <p>{message}</p>
    <Button variant="primary" onClick={onRetry}>Повторить</Button>
  </div>;
}
