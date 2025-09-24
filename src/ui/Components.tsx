import { ComponentPropsWithoutRef, ReactNode } from 'react';
import './components.css';

type BigButtonProps = ComponentPropsWithoutRef<'button'> & {
  icon?: ReactNode;
};

export function BigButton({ children, icon, ...props }: BigButtonProps) {
  return (
    <button className="BigButton" {...props}>
      {icon && <span className="BigButton-icon">{icon}</span>}
      <span className="BigButton-label">{children}</span>
    </button>
  );
}

type CardProps = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

export function Card({ title, description, actions }: CardProps) {
  return (
    <div className="Card">
      <h3>{title}</h3>
      {description && <p className="Card-body">{description}</p>}
      {actions && <div className="Card-actions">{actions}</div>}
    </div>
  );
}

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <label className="Toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="Toggle-slider" />
    </label>
  );
}

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="Modal-backdrop" role="dialog" aria-modal="true">
      <div className="Modal">
        <div className="Modal-header">
          <h2>{title}</h2>
          <button className="Modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="Modal-content">{children}</div>
      </div>
    </div>
  );
}
