import {
  CSSProperties,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  ChangeEvent,
  KeyboardEvent
} from 'react';
import { createRoot, Root } from 'react-dom/client';

export type PromptHUDNotice = {
  tone: 'success' | 'error' | 'info';
  message: string;
};

export type PromptHUDProps = {
  value: string;
  disabled: boolean;
  canHear: boolean;
  progressDone: number;
  progressTotal: number;
  status?: PromptHUDNotice | null;
  hint?: string;
  onChange(value: string): void;
  onSubmit(): void;
  onHear(): void;
  onAppend(char: string): void;
  onBackspace(): void;
};

export type PromptHUDHandle = {
  update(props: PromptHUDProps): void;
  destroy(): void;
};

const containerStyle: CSSProperties = {
  pointerEvents: 'auto',
  width: 'min(640px, 92vw)',
  margin: '24px',
  background: 'rgba(255, 255, 255, 0.98)',
  borderRadius: '18px',
  border: '2px solid #0f3057',
  boxShadow: '0 18px 36px rgba(15, 48, 87, 0.18)',
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  fontFamily: 'Nunito, system-ui, sans-serif',
  color: '#0f3057'
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  flexWrap: 'wrap'
};

const hearButtonStyle: CSSProperties = {
  flex: '1 1 auto',
  minWidth: '180px',
  padding: '14px 18px',
  fontSize: '20px',
  fontWeight: 700,
  background: '#0f3057',
  color: '#ffffff',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer'
};

const progressStyle: CSSProperties = {
  fontSize: '18px',
  fontWeight: 600,
  color: '#374151'
};

const formStyle: CSSProperties = {
  display: 'flex',
  gap: '12px',
  flexWrap: 'wrap'
};

const inputStyle: CSSProperties = {
  flex: '1 1 220px',
  minWidth: '200px',
  fontSize: '28px',
  padding: '14px 16px',
  borderRadius: '12px',
  border: '2px solid #0f3057',
  outline: 'none'
};

const submitButtonStyle: CSSProperties = {
  flex: '0 0 auto',
  minWidth: '160px',
  padding: '14px 18px',
  fontSize: '20px',
  fontWeight: 700,
  background: '#f8d05d',
  color: '#0f3057',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer'
};

const keyboardStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(52px, 1fr))',
  gap: '8px'
};

const keyboardButtonStyle: CSSProperties = {
  padding: '12px 0',
  fontSize: '18px',
  fontWeight: 700,
  borderRadius: '10px',
  border: '2px solid #0f3057',
  background: '#ffffff',
  color: '#0f3057',
  cursor: 'pointer'
};

const noticeColors: Record<PromptHUDNotice['tone'], string> = {
  success: '#1b8a5a',
  error: '#c0392b',
  info: '#0f3057'
};

function PromptHUD(props: PromptHUDProps) {
  const { disabled, value, progressDone, progressTotal, status, hint } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [disabled, status]);

  const letters = useMemo(() => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (disabled) return;
    props.onSubmit();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    props.onChange(event.target.value);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (!disabled) props.onSubmit();
    }
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <button
          type="button"
          style={{
            ...hearButtonStyle,
            opacity: props.canHear && !disabled ? 1 : 0.6,
            cursor: props.canHear && !disabled ? 'pointer' : 'not-allowed'
          }}
          onClick={props.canHear ? props.onHear : undefined}
          disabled={!props.canHear || disabled}
        >
          Hear word
        </button>
        <div style={progressStyle} aria-live="polite">
          {progressDone} / {progressTotal}
        </div>
      </div>

      {status ? (
        <div
          style={{
            fontSize: '20px',
            fontWeight: 700,
            textAlign: 'center',
            color: noticeColors[status.tone]
          }}
          aria-live="polite"
        >
          {status.message}
        </div>
      ) : null}

      {hint ? (
        <div style={{ fontSize: '16px', color: '#4b5563', textAlign: 'center' }}>{hint}</div>
      ) : null}

      <form style={formStyle} onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          style={{
            ...inputStyle,
            borderColor: status?.tone === 'error' ? '#c0392b' : '#0f3057',
            backgroundColor: disabled ? '#f3f4f6' : '#ffffff'
          }}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={value}
          onChange={handleChange}
          onKeyDown={handleInputKeyDown}
          disabled={disabled}
        />
        <button
          type="submit"
          style={{
            ...submitButtonStyle,
            opacity: disabled || !value.trim() ? 0.6 : 1,
            cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer'
          }}
          disabled={disabled || !value.trim()}
        >
          Submit
        </button>
      </form>

      <div style={keyboardStyle}>
        {letters.map((letter) => (
          <button
            key={letter}
            type="button"
            style={{
              ...keyboardButtonStyle,
              opacity: disabled ? 0.4 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer'
            }}
            onClick={() => props.onAppend(letter)}
            disabled={disabled}
          >
            {letter}
          </button>
        ))}
        <button
          type="button"
          style={{
            ...keyboardButtonStyle,
            gridColumn: 'span 2',
            opacity: disabled ? 0.4 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          onClick={() => props.onAppend(' ')}
          disabled={disabled}
        >
          Space
        </button>
        <button
          type="button"
          style={{
            ...keyboardButtonStyle,
            gridColumn: 'span 2',
            opacity: disabled ? 0.4 : 1,
            cursor: disabled ? 'not-allowed' : 'pointer'
          }}
          onClick={props.onBackspace}
          disabled={disabled}
        >
          ⌫
        </button>
      </div>
    </div>
  );
}

export function createPromptHUD(parent: HTMLElement, props: PromptHUDProps): PromptHUDHandle {
  const wrapper = document.createElement('div');
  const previousPosition = parent.style.position;
  const needsPosition = !previousPosition || previousPosition === 'static';
  if (needsPosition) {
    parent.style.position = 'relative';
  }
  wrapper.style.position = 'absolute';
  wrapper.style.inset = '0';
  wrapper.style.display = 'flex';
  wrapper.style.alignItems = 'flex-end';
  wrapper.style.justifyContent = 'center';
  wrapper.style.pointerEvents = 'none';

  parent.appendChild(wrapper);
  const root: Root = createRoot(wrapper);

  const render = (nextProps: PromptHUDProps) => {
    root.render(
      <div style={{ flex: '1 1 auto', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}>
          <PromptHUD {...nextProps} />
        </div>
      </div>
    );
  };

  render(props);

  return {
    update(nextProps: PromptHUDProps) {
      render(nextProps);
    },
    destroy() {
      root.unmount();
      wrapper.remove();
      if (needsPosition) {
        parent.style.position = previousPosition;
      }
    }
  };
}
