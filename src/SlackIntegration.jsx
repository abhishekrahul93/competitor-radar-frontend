import { useState, useEffect } from 'react';

const th = {
  border: 'rgba(255,255,255,0.06)', textMuted: '#64748b', textDim: '#475569',
  accent: '#6366f1', green: '#10b981', red: '#ef4444', cyan: '#06b6d4',
  amber: '#f59e0b', mono: "'IBM Plex Mono', monospace",
};

const card = { background: 'rgba(255,255,255,0.02)', border: `1px solid ${th.border}`, borderRadius: 14, padding: 24 };
const btnPrimary = { padding: '10px 20px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${th.accent}, #4f46e5)`, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Sora', sans-serif" };
const btnGhost = { padding: '10px 20px', borderRadius: 10, border: `1px solid ${th.border}`, background: 'transparent', color: th.textMuted, fontSize: 13, cursor: 'pointer', fontFamily: "'Sora', sans-serif" };
const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${th.border}`, color: '#e2e8f0', fontSize: 14, fontFamily: "'Sora', sans-serif", outline: 'none', boxSizing: 'border-box' };

export default function SlackIntegration() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [connected, setConnected] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showSetup, setShowSetup] = useState(false);

  const token = localStorage.getItem('radar_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  useEffect(() => {
    // Load current status
    fetch('/api/slack/status', { headers })
      .then(r => r.json())
      .then(d => {
        setConnected(d.connected);
        if (d.webhook_url) setWebhookUrl(d.webhook_url);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!webhookUrl.startsWith('https://hooks.slack.com/')) {
      showMsg('URL must start with https://hooks.slack.com/', 'error');
      return;
    }
    setSaving(true);
    try {
      const r = await fetch('/api/slack/webhook', { method: 'PUT', headers, body: JSON.stringify({ webhook_url: webhookUrl }) });
      const d = await r.json();
      if (r.ok) { showMsg('Webhook saved!'); setConnected(true); }
      else showMsg(d.detail || 'Failed to save', 'error');
    } catch { showMsg('Network error', 'error'); }
    setSaving(false);
  };

  const handleTest = async () => {
    if (!webhookUrl) { showMsg('Enter a webhook URL first', 'error'); return; }
    setTesting(true);
    try {
      const r = await fetch('/api/slack/test', { method: 'POST', headers, body: JSON.stringify({ webhook_url: webhookUrl }) });
      const d = await r.json();
      if (r.ok) showMsg('Test message sent! Check your Slack channel.');
      else showMsg(d.detail || 'Test failed', 'error');
    } catch { showMsg('Network error', 'error'); }
    setTesting(false);
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const r = await fetch('/api/slack/webhook', { method: 'DELETE', headers });
      if (r.ok) { showMsg('Slack disconnected'); setConnected(false); setWebhookUrl(''); }
      else showMsg('Failed to disconnect', 'error');
    } catch { showMsg('Network error', 'error'); }
    setRemoving(false);
  };

  const alertTypes = [
    { emoji: '🔴', label: 'Pricing changes', desc: 'Plan added, removed, or price changed', color: th.red },
    { emoji: '🟠', label: 'Hiring signals', desc: 'New job postings & departments', color: th.amber },
    { emoji: '🔵', label: 'Messaging shifts', desc: 'Headlines, CTAs, positioning', color: th.cyan },
    { emoji: '🟢', label: 'Content & SEO', desc: 'Meta tags, content, documentation', color: th.green },
  ];

  return (
    <div style={{ ...card, maxWidth: 600, borderColor: connected ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)', background: connected ? 'rgba(16,185,129,0.02)' : 'rgba(99,102,241,0.02)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 24 }}>💬</div>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Slack Integration</h3>
            <p style={{ fontSize: 12, color: th.textMuted, margin: '2px 0 0' }}>Get real-time competitor alerts in Slack</p>
          </div>
        </div>
        {connected && (
          <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(16,185,129,0.1)', color: th.green, fontFamily: th.mono }}>
            ● CONNECTED
          </span>
        )}
      </div>

      {/* Status message */}
      {message.text && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: 500,
          background: message.type === 'error' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.08)',
          border: `1px solid ${message.type === 'error' ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
          color: message.type === 'error' ? th.red : th.green,
        }}>
          {message.type === 'error' ? '✕' : '✓'} {message.text}
        </div>
      )}

      {/* Webhook URL input */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: th.textMuted, display: 'block', marginBottom: 6, fontFamily: th.mono }}>WEBHOOK URL</label>
        <input
          value={webhookUrl}
          onChange={e => setWebhookUrl(e.target.value)}
          placeholder="https://hooks.slack.com/services/..."
          style={{
            ...inputStyle,
            borderColor: connected ? 'rgba(16,185,129,0.3)' : webhookUrl && !webhookUrl.startsWith('https://hooks.slack.com/') ? 'rgba(239,68,68,0.3)' : th.border,
          }}
        />
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={handleSave} disabled={saving || !webhookUrl} style={{ ...btnPrimary, opacity: saving || !webhookUrl ? 0.5 : 1 }}>
          {saving ? 'Saving...' : connected ? 'Update Webhook' : 'Save & Connect'}
        </button>
        <button onClick={handleTest} disabled={testing || !webhookUrl} style={{ ...btnGhost, color: th.cyan, borderColor: 'rgba(6,182,212,0.2)', opacity: testing || !webhookUrl ? 0.5 : 1 }}>
          {testing ? 'Sending...' : '🔔 Test Connection'}
        </button>
        {connected && (
          <button onClick={handleRemove} disabled={removing} style={{ ...btnGhost, color: th.red, borderColor: 'rgba(239,68,68,0.2)', opacity: removing ? 0.5 : 1 }}>
            {removing ? '...' : 'Disconnect'}
          </button>
        )}
      </div>

      {/* Alert types preview */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 10 }}>What you'll get alerted for:</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {alertTypes.map((a, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: `1px solid ${th.border}` }}>
              <span style={{ fontSize: 14 }}>{a.emoji}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: a.color }}>{a.label}</div>
                <div style={{ fontSize: 10, color: th.textDim }}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup guide toggle */}
      <button onClick={() => setShowSetup(!showSetup)} style={{ ...btnGhost, width: '100%', fontSize: 12, textAlign: 'center', color: th.accent, borderColor: 'rgba(99,102,241,0.15)' }}>
        {showSetup ? 'Hide Setup Guide ↑' : 'How to get a Slack Webhook URL ↓'}
      </button>

      {showSetup && (
        <div style={{ marginTop: 12, padding: 16, background: 'rgba(99,102,241,0.03)', borderRadius: 10, border: `1px solid rgba(99,102,241,0.1)` }}>
          <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.8 }}>
            <div style={{ marginBottom: 8 }}><strong style={{ color: th.accent }}>Step 1:</strong> Go to <a href="https://api.slack.com/apps" target="_blank" rel="noopener" style={{ color: th.cyan }}>api.slack.com/apps</a></div>
            <div style={{ marginBottom: 8 }}><strong style={{ color: th.accent }}>Step 2:</strong> Click "Create New App" → "From scratch"</div>
            <div style={{ marginBottom: 8 }}><strong style={{ color: th.accent }}>Step 3:</strong> Name it "CompetitorRadar" and pick your workspace</div>
            <div style={{ marginBottom: 8 }}><strong style={{ color: th.accent }}>Step 4:</strong> Go to "Incoming Webhooks" → Toggle ON</div>
            <div style={{ marginBottom: 8 }}><strong style={{ color: th.accent }}>Step 5:</strong> Click "Add New Webhook to Workspace" → Pick a channel</div>
            <div><strong style={{ color: th.accent }}>Step 6:</strong> Copy the URL and paste it above</div>
          </div>
        </div>
      )}
    </div>
  );
}
