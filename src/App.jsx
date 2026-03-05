import React, { useState, useEffect } from 'react'
import api from './utils/api'

const theme = {
  bg: '#05050d',
  bgCard: 'rgba(255,255,255,0.02)',
  border: 'rgba(255,255,255,0.06)',
  text: '#e2e8f0',
  textMuted: '#64748b',
  textDim: '#475569',
  accent: '#6366f1',
  accentGlow: 'rgba(99,102,241,0.15)',
  red: '#ef4444',
  amber: '#f59e0b',
  green: '#10b981',
  cyan: '#06b6d4',
  font: "'Sora', sans-serif",
  mono: "'IBM Plex Mono', monospace",
}

const css = {
  card: { background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20 },
  input: { width: '100%', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`, color: theme.text, fontSize: 14, fontFamily: theme.font, outline: 'none', boxSizing: 'border-box' },
  btnPrimary: { padding: '12px 28px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, ${theme.accent}, #4f46e5)`, color: 'white', fontSize: 14, fontWeight: 600, fontFamily: theme.font, cursor: 'pointer' },
  btnGhost: { padding: '10px 20px', borderRadius: 10, border: `1px solid ${theme.border}`, background: 'transparent', color: theme.textMuted, fontSize: 13, fontWeight: 500, fontFamily: theme.font, cursor: 'pointer' },
  badge: (color) => ({ padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, fontFamily: theme.mono, letterSpacing: 0.5, background: `${color}15`, color: color, textTransform: 'uppercase' }),
  threat: (level) => {
    const colors = { critical: theme.red, high: theme.red, medium: theme.amber, low: theme.green, unknown: theme.textMuted }
    return css.badge(colors[level?.toLowerCase()] || theme.textMuted)
  },
}

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        await api.signup(email, password, name)
      } else {
        await api.login(email, password)
      }
      onLogin()
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg }}>
      <div style={{ width: 400, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🎯</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>Competitor<span style={{ color: theme.accent }}>Radar</span></h1>
          <p style={{ color: theme.textMuted, fontSize: 13, margin: 0 }}>AI-Powered Competitive Intelligence</p>
        </div>
        <div style={{ ...css.card, padding: 28 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 3 }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: 'none', fontSize: 13, fontWeight: 600, fontFamily: theme.font, cursor: 'pointer', background: mode === m ? theme.accentGlow : 'transparent', color: mode === m ? theme.accent : theme.textMuted }}>
                {m === 'login' ? 'Log In' : 'Sign Up'}
              </button>
            ))}
          </div>
          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={css.input} />
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" type="email" style={css.input} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: theme.textMuted, display: 'block', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Password</label>
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" type="password" style={css.input} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>
          {error && <div style={{ color: theme.red, fontSize: 13, marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>{error}</div>}
          <button onClick={handleSubmit} disabled={loading} style={{ ...css.btnPrimary, width: '100%', opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Sidebar({ page, setPage, stats }) {
  const navItems = [
    { id: 'dashboard', icon: '◉', label: 'Dashboard' },
    { id: 'competitors', icon: '◎', label: 'Competitors' },
    { id: 'changes', icon: '◈', label: 'Changes' },
    { id: 'briefs', icon: '◆', label: 'AI Briefs' },
    { id: 'add', icon: '＋', label: 'Add New' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ]
  return (
    <div style={{ width: 230, background: '#08081a', borderRight: `1px solid ${theme.border}`, padding: '24px 14px', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36, paddingLeft: 6 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${theme.accent}, ${theme.cyan})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎯</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>Competitor<span style={{ color: theme.accent }}>Radar</span></div>
          <div style={{ fontSize: 8, color: theme.textDim, letterSpacing: 2, textTransform: 'uppercase', fontFamily: theme.mono }}>intelligence</div>
        </div>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => setPage(item.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: 'none', background: page === item.id ? theme.accentGlow : 'transparent', color: page === item.id ? '#a5b4fc' : theme.textMuted, fontSize: 13, fontWeight: 500, fontFamily: theme.font, cursor: 'pointer', width: '100%', textAlign: 'left' }}>
            <span style={{ fontSize: 14, width: 20, textAlign: 'center' }}>{item.icon}</span>{item.label}
          </button>
        ))}
      </nav>
      <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: `1px solid ${theme.border}` }}>
        <div style={{ fontSize: 10, color: theme.textDim, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, fontFamily: theme.mono }}>System</div>
        <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 4 }}>● Tracking {stats.competitors || 0}</div>
        <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 4 }}>● {stats.changes || 0} changes found</div>
        <div style={{ fontSize: 12, color: theme.green }}>● System online</div>
      </div>
    </div>
  )
}

function DashboardPage({ competitors, changes, reports, onScan, scanning, onLoadDemo, demoLoading, isNewUser }) {
  if (isNewUser && competitors.length === 0) {
    return (
      <div>
        <div style={{ textAlign: 'center', padding: '40px 0 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>Welcome to Competitor<span style={{ color: theme.accent }}>Radar</span></h1>
          <p style={{ color: theme.textMuted, fontSize: 14, margin: 0, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.7 }}>AI-powered competitive intelligence that monitors your competitors 24/7.</p>
        </div>
        <div style={{ maxWidth: 700, margin: '30px auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 30 }}>
            {[
              { step: '01', title: 'Load Demo Data', desc: 'See the product in action with sample competitors and AI briefs', icon: '📊' },
              { step: '02', title: 'Explore Dashboard', desc: 'Browse changes, read AI briefs, and check threat levels', icon: '🔍' },
              { step: '03', title: 'Add Your Own', desc: 'Track your real competitors and get intelligence delivered', icon: '🚀' },
            ].map((s, i) => (
              <div key={i} style={{ ...css.card, textAlign: 'center', padding: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: theme.accent, letterSpacing: 2, fontFamily: theme.mono, marginBottom: 8 }}>STEP {s.step}</div>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{s.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ ...css.card, textAlign: 'center', padding: 30, borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.03)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>Ready to see it in action?</h3>
            <p style={{ fontSize: 13, color: theme.textMuted, margin: '0 0 20px' }}>Load 3 sample competitors with changes and AI briefs.</p>
            <button onClick={onLoadDemo} disabled={demoLoading} style={{ ...css.btnPrimary, padding: '14px 36px', fontSize: 15, opacity: demoLoading ? 0.6 : 1 }}>
              {demoLoading ? '⏳ Loading...' : '🎯 Load Demo Data'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Tracking', value: competitors.length, color: theme.accent },
    { label: 'Changes', value: changes.length, color: theme.red },
    { label: 'AI Briefs', value: reports.length, color: theme.green },
    { label: 'High Priority', value: changes.filter(c => c.significance >= 0.8).length, color: theme.amber },
  ]

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Intelligence Dashboard</h1>
        <p style={{ color: theme.textMuted, fontSize: 13, margin: 0 }}>Real-time competitive signals across your market</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ ...css.card, textAlign: 'center', padding: '18px 12px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: theme.textDim, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: theme.mono }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: s.color, margin: '6px 0 0' }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ ...css.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Run Competitive Scan</div>
          <div style={{ fontSize: 12, color: theme.textMuted }}>Scrape all competitors and detect changes with AI analysis</div>
        </div>
        <button onClick={onScan} disabled={scanning} style={{ ...css.btnPrimary, opacity: scanning ? 0.6 : 1 }}>
          {scanning ? '⏳ Scanning...' : '🔍 Scan Now'}
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={css.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>Recent Changes</h3>
          {changes.length === 0 && <p style={{ color: theme.textDim, fontSize: 13 }}>No changes yet. Run a scan.</p>}
          {changes.slice(0, 5).map((c, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: `1px solid ${theme.border}`, display: 'flex', gap: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: c.significance >= 0.8 ? theme.red : c.significance >= 0.5 ? theme.amber : theme.green }} />
              <div>
                <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500 }}>{c.summary?.slice(0, 100)}</div>
                <div style={{ fontSize: 11, color: theme.textDim, marginTop: 3 }}>{c.competitor_name} · {c.page_type} · {Math.round(c.significance * 100)}%</div>
              </div>
            </div>
          ))}
        </div>
        <div style={css.card}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 14px' }}>Tracked Competitors</h3>
          {competitors.length === 0 && <p style={{ color: theme.textDim, fontSize: 13 }}>No competitors yet.</p>}
          {competitors.map((comp, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.border}` }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{comp.name}</div>
                <div style={{ fontSize: 11, color: theme.accent, fontFamily: theme.mono }}>{comp.website_url?.replace('https://', '')}</div>
              </div>
              <span style={{ fontSize: 11, color: theme.textDim }}>{comp.changes_count} changes</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CompetitorsPage({ competitors, onDelete, onScanOne, setPage }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Competitors</h1>
          <p style={{ color: theme.textMuted, fontSize: 13, margin: 0 }}>Manage your tracked competitors</p>
        </div>
        <button onClick={() => setPage('add')} style={css.btnPrimary}>＋ Add Competitor</button>
      </div>
      {competitors.length === 0 && <div style={{ ...css.card, textAlign: 'center', padding: 40 }}><p style={{ color: theme.textMuted }}>No competitors yet.</p></div>}
      <div style={{ display: 'grid', gap: 10 }}>
        {competitors.map(comp => (
          <div key={comp.id} style={{ ...css.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: 2 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{comp.name}</div>
              <div style={{ fontSize: 12, color: theme.accent, fontFamily: theme.mono, marginTop: 2 }}>{comp.website_url?.replace('https://', '')}</div>
            </div>
            <div style={{ flex: 1, fontSize: 12, color: theme.textMuted }}>{comp.category}</div>
            <div style={{ flex: 1, fontSize: 12, color: theme.textMuted }}>{comp.changes_count} changes</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => onScanOne(comp.id)} style={{ ...css.btnGhost, padding: '6px 14px', fontSize: 11 }}>Scan</button>
              <button onClick={() => onDelete(comp.id)} style={{ ...css.btnGhost, padding: '6px 14px', fontSize: 11, color: theme.red, borderColor: 'rgba(239,68,68,0.2)' }}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChangesPage({ changes, setPage, setSelectedReport }) {
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Detected Changes</h1>
      <p style={{ color: theme.textMuted, fontSize: 13, margin: '0 0 24px' }}>Every competitive movement captured</p>
      {changes.length === 0 && <div style={{ ...css.card, textAlign: 'center', padding: 40 }}><p style={{ color: theme.textMuted }}>No changes detected yet.</p></div>}
      <div style={{ display: 'grid', gap: 10 }}>
        {changes.map((c, i) => (
          <div key={i} onClick={() => { setSelectedReport(c); setPage('briefs') }}
            style={{ ...css.card, borderLeft: `4px solid ${c.significance >= 0.8 ? theme.red : c.significance >= 0.5 ? theme.amber : theme.green}`, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{c.competitor_name}</span>
                  <span style={css.badge(theme.accent)}>{c.page_type}</span>
                  <span style={css.badge(c.significance >= 0.8 ? theme.red : theme.amber)}>{Math.round(c.significance * 100)}%</span>
                </div>
                <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>{c.summary}</div>
                <div style={{ fontSize: 11, color: theme.textDim, marginTop: 6 }}>{new Date(c.detected_at).toLocaleString()}</div>
              </div>
              <span style={{ color: theme.accent, fontSize: 12, flexShrink: 0 }}>View Brief →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function BriefsPage({ reports, selectedReport, setSelectedReport }) {
  if (selectedReport && selectedReport.what_changed) {
    return (
      <div>
        <button onClick={() => setSelectedReport(null)} style={{ ...css.btnGhost, marginBottom: 20, padding: '6px 16px', fontSize: 12 }}>← Back</button>
        <div style={{ ...css.card, borderLeft: `4px solid ${theme.accent}` }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{selectedReport.competitor_name || selectedReport.title}</span>
            {selectedReport.threat_level && <span style={css.threat(selectedReport.threat_level?.split(' ')[0]?.split('\n')[0])}>{selectedReport.threat_level?.split('\n')[0]}</span>}
          </div>
          {[
            { key: 'what_changed', title: 'WHAT CHANGED', color: theme.accent },
            { key: 'why_it_matters', title: 'WHY IT MATTERS', color: theme.amber },
            { key: 'what_to_do', title: 'WHAT YOU SHOULD DO', color: theme.green },
            { key: 'threat_level', title: 'THREAT LEVEL', color: theme.red },
          ].map(s => (
            selectedReport[s.key] ? (
              <div key={s.key} style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: 2, marginBottom: 8, fontFamily: theme.mono }}>{s.title}</div>
                <div style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.8, whiteSpace: 'pre-line', background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 10, border: `1px solid ${theme.border}` }}>{selectedReport[s.key]}</div>
              </div>
            ) : null
          ))}
        </div>
      </div>
    )
  }
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>AI Strategic Briefs</h1>
      <p style={{ color: theme.textMuted, fontSize: 13, margin: '0 0 24px' }}>AI-generated intelligence with actionable recommendations</p>
      {reports.length === 0 && <div style={{ ...css.card, textAlign: 'center', padding: 40 }}><p style={{ color: theme.textMuted }}>No briefs yet. Run a scan to generate.</p></div>}
      <div style={{ display: 'grid', gap: 10 }}>
        {reports.map((r, i) => (
          <div key={i} onClick={() => setSelectedReport(r)} style={{ ...css.card, cursor: 'pointer' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{r.competitor_name}</span>
                  {r.threat_level && <span style={css.threat(r.threat_level?.split(' ')[0]?.split('\n')[0])}>{r.threat_level?.split('\n')[0]?.slice(0, 20)}</span>}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>{r.title}</div>
                <div style={{ fontSize: 11, color: theme.textDim, marginTop: 4 }}>{new Date(r.created_at).toLocaleString()}</div>
              </div>
              <span style={{ color: theme.accent, fontSize: 12 }}>Read →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddPage({ onAdd }) {
  const [form, setForm] = useState({ name: '', website_url: '', pricing_url: '', careers_url: '', github_url: '', docs_url: '', category: 'AI SaaS' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const handleSubmit = async () => {
    if (!form.name || !form.website_url) { setError('Name and Website URL are required'); return }
    setLoading(true); setError('')
    try {
      await api.addCompetitor(form)
      setSuccess(`Now tracking ${form.name}!`)
      setForm({ name: '', website_url: '', pricing_url: '', careers_url: '', github_url: '', docs_url: '', category: 'AI SaaS' })
      onAdd()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) { setError(err.message) }
    setLoading(false)
  }
  const categories = ['AI SaaS', 'Developer Tools', 'Analytics', 'Ecommerce', 'FinTech', 'Marketing', 'Productivity', 'Other']
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Add Competitor</h1>
      <p style={{ color: theme.textMuted, fontSize: 13, margin: '0 0 24px' }}>Start tracking a new competitor</p>
      <div style={{ ...css.card, maxWidth: 640, padding: 28 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, display: 'block', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: theme.mono }}>Competitor Name *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Jasper AI" style={css.input} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, display: 'block', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: theme.mono }}>Website URL *</label>
          <input value={form.website_url} onChange={e => setForm(f => ({ ...f, website_url: e.target.value }))} placeholder="https://jasper.ai" style={css.input} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, display: 'block', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: theme.mono }}>Pricing Page</label>
            <input value={form.pricing_url} onChange={e => setForm(f => ({ ...f, pricing_url: e.target.value }))} placeholder="https://jasper.ai/pricing" style={css.input} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, display: 'block', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: theme.mono }}>Careers Page</label>
            <input value={form.careers_url} onChange={e => setForm(f => ({ ...f, careers_url: e.target.value }))} placeholder="https://jasper.ai/careers" style={css.input} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, display: 'block', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: theme.mono }}>GitHub URL</label>
            <input value={form.github_url} onChange={e => setForm(f => ({ ...f, github_url: e.target.value }))} placeholder="https://github.com/jasper" style={css.input} />
          </div>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: theme.textMuted, display: 'block', marginBottom: 6, letterSpacing: 1.5, textTransform: 'uppercase', fontFamily: theme.mono }}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...css.input, appearance: 'auto' }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {error && <div style={{ color: theme.red, fontSize: 13, marginBottom: 14, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>{error}</div>}
        {success && <div style={{ color: theme.green, fontSize: 13, marginBottom: 14, padding: '8px 12px', background: 'rgba(16,185,129,0.08)', borderRadius: 8 }}>✓ {success}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ ...css.btnPrimary, width: '100%', opacity: loading ? 0.6 : 1 }}>
          {loading ? 'Adding...' : '🎯 Start Tracking'}
        </button>
      </div>
    </div>
  )
}

function SettingsPage({ onLogout }) {
  const user = JSON.parse(localStorage.getItem('radar_user') || '{}')
  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 24px' }}>Settings</h1>
      <div style={{ ...css.card, maxWidth: 500, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 12px' }}>Account</h3>
        <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 6 }}>Email: {user.email || 'N/A'}</div>
        <div style={{ fontSize: 13, color: theme.textMuted }}>Plan: {user.plan || 'free'}</div>
      </div>
      <div style={{ ...css.card, maxWidth: 500, borderColor: 'rgba(239,68,68,0.15)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: theme.red, margin: '0 0 12px' }}>Log Out</h3>
        <button onClick={onLogout} style={{ ...css.btnGhost, color: theme.red, borderColor: 'rgba(239,68,68,0.2)' }}>Log Out</button>
      </div>
    </div>
  )
}

function Toast({ msg, type }) {
  if (!msg) return null
  const colors = { success: theme.green, error: theme.red, info: theme.accent }
  const c = colors[type] || theme.accent
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 999, padding: '12px 20px', borderRadius: 10, background: `${c}12`, border: `1px solid ${c}40`, color: c, fontSize: 13, fontWeight: 600, fontFamily: theme.font, maxWidth: 400 }}>
      {type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'} {msg}
    </div>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(api.isLoggedIn())
  const [page, setPage] = useState('dashboard')
  const [competitors, setCompetitors] = useState([])
  const [changes, setChanges] = useState([])
  const [reports, setReports] = useState([])
  const [scanning, setScanning] = useState(false)
  const [toast, setToast] = useState({ msg: '', type: '' })
  const [selectedReport, setSelectedReport] = useState(null)
  const [demoLoading, setDemoLoading] = useState(false)
  const [isNewUser, setIsNewUser] = useState(true)

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast({ msg: '', type: '' }), 4000)
  }

  const loadData = async () => {
    let comps = [], chgs = [], rpts = []
    try { comps = await api.getCompetitors() || [] } catch (e) { console.log('competitors error:', e.message) }
    try { chgs = await api.getChanges() || [] } catch (e) { console.log('changes error:', e.message) }
    try { rpts = await api.getReports() || [] } catch (e) { console.log('reports error:', e.message) }
    setCompetitors(comps)
    setChanges(chgs)
    setReports(rpts)
    if (comps.length > 0 || chgs.length > 0) setIsNewUser(false)
  }

  useEffect(() => {
    if (authed) loadData()
  }, [authed])

  const handleLogin = () => { setAuthed(true) }
  const handleLogout = () => { api.logout(); setAuthed(false); setCompetitors([]); setChanges([]); setReports([]); setIsNewUser(true) }

  const handleScan = async () => {
    setScanning(true); showToast('Scanning...', 'info')
    try { const r = await api.scanAll(); showToast(r.message, 'success'); await loadData() }
    catch (e) { showToast(e.message, 'error') }
    setScanning(false)
  }

  const handleLoadDemo = async () => {
    setDemoLoading(true)
    try {
      const r = await api.loadDemo()
      if (r.loaded) { showToast(`Demo loaded!`, 'success'); setIsNewUser(false); await loadData() }
      else { showToast('Demo already loaded', 'info'); setIsNewUser(false) }
    } catch (e) { showToast(e.message, 'error') }
    setDemoLoading(false)
  }

  const handleScanOne = async (id) => {
    showToast('Scanning...', 'info')
    try { const r = await api.scanOne(id); showToast(`${r.competitor}: ${r.changes_found} changes`, 'success'); await loadData() }
    catch (e) { showToast(e.message, 'error') }
  }

  const handleDelete = async (id) => {
    try { await api.deleteCompetitor(id); showToast('Removed', 'success'); await loadData() }
    catch (e) { showToast(e.message, 'error') }
  }

  if (!authed) return <AuthPage onLogin={handleLogin} />

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.bg, fontFamily: theme.font }}>
      <Toast msg={toast.msg} type={toast.type} />
      <Sidebar page={page} setPage={(p) => { setPage(p); setSelectedReport(null) }} stats={{ competitors: competitors.length, changes: changes.length, reports: reports.length }} />
      <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', maxHeight: '100vh' }}>
        {page === 'dashboard' && <DashboardPage competitors={competitors} changes={changes} reports={reports} onScan={handleScan} scanning={scanning} onLoadDemo={handleLoadDemo} demoLoading={demoLoading} isNewUser={isNewUser} />}
        {page === 'competitors' && <CompetitorsPage competitors={competitors} onDelete={handleDelete} onScanOne={handleScanOne} setPage={setPage} />}
        {page === 'changes' && <ChangesPage changes={changes} setPage={setPage} setSelectedReport={setSelectedReport} />}
        {page === 'briefs' && <BriefsPage reports={reports} selectedReport={selectedReport} setSelectedReport={setSelectedReport} />}
        {page === 'add' && <AddPage onAdd={loadData} />}
        {page === 'settings' && <SettingsPage onLogout={handleLogout} />}
        <div style={{ textAlign: 'center', color: theme.textDim, fontSize: 11, marginTop: 40, paddingBottom: 20, fontFamily: theme.mono }}>Competitor Radar AI · Built by Abhishek R.</div>
      </main>
    </div>
  )
}