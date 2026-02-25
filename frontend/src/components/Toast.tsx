import React from 'react';

interface ToastProps {
  message: string;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '18px',
        transform: 'translateX(-50%)',
        padding: '10px 16px',
        borderRadius: '14px',
        border: '1px solid rgba(255,255,255,0.18)',
        background: 'rgba(18,26,51,0.92)',
        boxShadow: '0 14px 30px rgba(0,0,0,0.4)',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.92)',
        maxWidth: '92vw',
        whiteSpace: 'nowrap',
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        animation: 'toast-in 0.2s ease-out',
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  );
}
