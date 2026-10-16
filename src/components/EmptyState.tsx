interface EmptyStateProps { message: string }

export function EmptyState({ message }: EmptyStateProps) {
  return <p className="api-panel" role="status">{message}</p>;
}
