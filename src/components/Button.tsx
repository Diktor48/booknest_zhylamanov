import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
}

export function Button({ variant = 'ghost', className = '', type = 'button', ...props }: ButtonProps) {
  return <button {...props} type={type} className={`btn btn--${variant} ${className}`} />;
}
