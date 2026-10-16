interface SpinnerProps { message: string }

export function Spinner({ message }: SpinnerProps) {
  return <div className="api-panel" role="status"><span className="spinner-mark" aria-hidden="true" />{message}</div>;
}
