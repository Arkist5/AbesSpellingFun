import React from 'react';

export default function MathFlashCardsAddition() {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const src = base + 'math/flash-cards-addition/index.html';
  const style: React.CSSProperties = {
    width: '100%',
    height: '78vh',
    border: '0',
    borderRadius: 12,
    boxShadow: '0 8px 20px rgba(0,0,0,0.35)',
    background: 'transparent'
  };
  return (
    <div style={{padding: '12px 0'}}>
      <iframe title="Addition Flash Cards" src={src} style={style} allow="autoplay" />
    </div>
  );
}
