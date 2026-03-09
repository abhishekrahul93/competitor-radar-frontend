/**
 * UIComponents.jsx — Shared loading states, error UI, skeleton loaders
 * Drop this in src/components/ and import what you need across pages.
 */
import { useState, useEffect, useCallback } from 'react';

/* ── Theme (matches your existing dashboard theme) ─────────── */
const th = {
  border: 'rgba(255,255,255,0.06)',
  textMuted: '#64748b',
  textDim: '#475569',
  accent: '#6366f1',
  accentGlow: 'rgba(99,102,241,0.15)',
  red: '#ef4444',
  amber: '#f59e0b',
  green: '#10b981',
  cyan: '#06b6d4',
  mono: "'IBM Plex Mono', monospace",
};

/* ── Animated Spinner ──────────────────────────────────────── */
export function Spinner({ size = 20, color = th.accent, style = {} }) {
  return (
    <div style={{ width: size, height: size, ...style }}>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'ui-spin 0.8s linear infinite' }}>
        <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="3" strokeOpacity="0.2" />
        <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <style>{`@keyframes ui-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Shimmer Skeleton Block ────────────────────────────────── */
export function Skeleton({ width = '100%', height = 16, radius = 8, style = {} }) {
  return (
    <div style={{
      width, height, borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%',
      animation: 'ui-shimmer 1.5s ease-in-out infinite',
      ...style,
    }}>
      <style>{`@keyframes ui-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}

/* ── Skeleton Card (for stat cards, feature cards, etc.) ──── */
export function SkeletonCard({ height = 120, style = {} }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: `1px solid ${th.border}`,
      borderRadius: 14,
      padding: 20,
      height,
      ...style,
    }}>
      <Skeleton width={80} height={10} style={{ marginBottom: 12 }} />
      <Skeleton width={60} height={28} style={{ marginBottom: 10 }} />
      <Skeleton width={120} height={10} />
    </div>
  );
}

/* ── Full Page Loading State ───────────────────────────────── */
export function PageLoader({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '80px 24px', textAlign: 'center',
    }}>
      <Spinner size={32} />
      <p style={{ color: th.textMuted, fontSize: 14, marginTop: 16, fontWeight: 500 }}>{message}</p>
    </div>
  );
}

/* ── Skeleton Grid (simulates a full page of cards loading) ── */
export function SkeletonDashboard() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Skeleton width={200} height={22} style={{ marginBottom: 8 }} />
          <Skeleton width={160} height={12} />
        </div>
        <Skeleton width={120} height={42} radius={10} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <SkeletonCard height={200} />
        <SkeletonCard height={200} />
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Skeleton width={180} height={22} style={{ marginBottom: 8 }} />
          <Skeleton width={220} height={12} />
        </div>
        <Skeleton width={130} height={42} radius={10} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          background: 'rgba(255,255,255,0.02)', border: `1px solid ${th.border}`,
          borderRadius: 14, padding: 20, marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <Skeleton width={44} height={44} radius={12} />
          <div style={{ flex: 1 }}>
            <Skeleton width={`${50 + Math.random() * 30}%`} height={14} style={{ marginBottom: 8 }} />
            <Skeleton width={`${30 + Math.random() * 20}%`} height={10} />
          </div>
          <Skeleton width={60} height={24} radius={6} />
        </div>
      ))}
    </div>
  );
}

/* ── Error Card with Retry ─────────────────────────────────── */
export function ErrorCard({ title = 'Something went wrong', message = 'Failed to load data. Please try again.', onRetry, style = {} }) {
  return (
    <div style={{
      background: 'rgba(239,68,68,0.04)',
      border: '1px solid rgba(239,68,68,0.15)',
      borderRadius: 14, padding: 32, textAlign: 'center',
      ...style,
    }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{title}</h3>
      <p style={{ color: th.textMuted, fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>{message}</p>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          background: `linear-gradient(135deg, ${th.accent}, #4f46e5)`,
          color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          fontFamily: "'Sora', sans-serif",
        }}>
          ↻ Try Again
        </button>
      )}
    </div>
  );
}

/* ── Inline Error Banner ───────────────────────────────────── */
export function ErrorBanner({ message, onDismiss, onRetry }) {
  if (!message) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 10,
      background: 'rgba(239,68,68,0.06)',
      border: '1px solid rgba(239,68,68,0.18)',
      marginBottom: 16,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
      <span style={{ flex: 1, fontSize: 13, color: th.red }}>{message}</span>
      {onRetry && (
        <button onClick={onRetry} style={{
          padding: '5px 14px', borderRadius: 6, border: `1px solid ${th.red}40`,
          background: 'transparent', color: th.red, fontSize: 11, fontWeight: 600, cursor: 'pointer',
        }}>Retry</button>
      )}
      {onDismiss && (
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', color: th.red, cursor: 'pointer', fontSize: 16, padding: '0 4px',
        }}>×</button>
      )}
    </div>
  );
}

/* ── Success Banner ────────────────────────────────────────── */
export function SuccessBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 10,
      background: 'rgba(16,185,129,0.06)',
      border: '1px solid rgba(16,185,129,0.18)',
      marginBottom: 16,
    }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>✓</span>
      <span style={{ flex: 1, fontSize: 13, color: th.green }}>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', color: th.green, cursor: 'pointer', fontSize: 16, padding: '0 4px',
        }}>×</button>
      )}
    </div>
  );
}

/* ── Empty State ───────────────────────────────────────────── */
export function EmptyState({ icon = '📭', title, message, actionLabel, onAction }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: `1px solid ${th.border}`,
      borderRadius: 14, textAlign: 'center', padding: '50px 24px',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>{title}</h3>
      <p style={{ color: th.textMuted, fontSize: 13, margin: '0 0 20px', lineHeight: 1.6 }}>{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} style={{
          padding: '10px 24px', borderRadius: 10, border: 'none',
          background: `linear-gradient(135deg, ${th.accent}, #4f46e5)`,
          color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}>{actionLabel}</button>
      )}
    </div>
  );
}

/* ── Loading Button (wraps any button with spinner) ────────── */
export function LoadingButton({ loading, children, style = {}, ...props }) {
  return (
    <button {...props} disabled={loading || props.disabled} style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '10px 24px', borderRadius: 10, border: 'none',
      background: `linear-gradient(135deg, ${th.accent}, #4f46e5)`,
      color: 'white', fontSize: 13, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
      fontFamily: "'Sora', sans-serif",
      opacity: loading || props.disabled ? 0.6 : 1,
      transition: 'opacity 0.2s',
      ...style,
    }}>
      {loading && <Spinner size={14} color="#fff" />}
      {children}
    </button>
  );
}

/* ── Toast notification system ─────────────────────────────── */
export function useToast(duration = 4000) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, [duration]);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  const ToastContainer = () => (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 360 }}>
      {toasts.map(t => {
        const colors = {
          success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', color: th.green, icon: '✓' },
          error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', color: th.red, icon: '✕' },
          info: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', color: th.accent, icon: 'ℹ' },
        }[t.type];
        return (
          <div key={t.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px', borderRadius: 10,
            background: colors.bg, border: `1px solid ${colors.border}`,
            backdropFilter: 'blur(12px)',
            animation: 'ui-toast-in 0.3s ease-out',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          }}>
            <span style={{ fontSize: 14, color: colors.color, fontWeight: 700, flexShrink: 0 }}>{colors.icon}</span>
            <span style={{ fontSize: 13, color: colors.color, fontWeight: 500 }}>{t.message}</span>
          </div>
        );
      })}
      <style>{`@keyframes ui-toast-in { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }`}</style>
    </div>
  );

  return { success, error, info, ToastContainer };
}

/* ── Connection status indicator ───────────────────────────── */
export function ConnectionStatus() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  if (online) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 20px', borderRadius: 10,
      background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
      backdropFilter: 'blur(12px)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    }}>
      <div style={{ width: 8, height: 8, borderRadius: '50%', background: th.red, animation: 'ui-spin 1.5s ease-in-out infinite' }} />
      <span style={{ fontSize: 13, color: th.red, fontWeight: 600 }}>You're offline — check your connection</span>
    </div>
  );
}
