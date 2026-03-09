import { useState, useEffect } from 'react';
import { Spinner, ErrorCard, SkeletonList, EmptyState, LoadingButton } from './UIComponents';

const th = {
  border: 'rgba(255,255,255,0.06)', textMuted: '#64748b', textDim: '#475569',
  accent: '#6366f1', red: '#ef4444', amber: '#f59e0b', green: '#10b981',
  cyan: '#06b6d4', mono: "'IBM Plex Mono', monospace",
};
const card = { background: 'rgba(255,255,255,0.02)', border: `1px solid ${th.border}`, borderRadius: 14, padding: 20 };

const threatColors = { critical: th.red, high: th.red, medium: th.amber, low: th.green };

export default function Battlecards() {
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [generating, setGenerating] = useState(null);
  const [genError, setGenError] = useState('');

  const token = localStorage.getItem('radar_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadCompetitors = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/battlecards/', { headers });
      if (!r.ok) throw new Error(`Failed (${r.status})`);
      setCompetitors(await r.json());
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  useEffect(() => { loadCompetitors(); }, []);

  const handleGenerate = async (competitorId) => {
    setGenerating(competitorId);
    setGenError('');
    try {
      const r = await fetch(`/api/battlecards/generate/${competitorId}`, { method: 'POST', headers });
      if (!r.ok) throw new Error(`Generation failed (${r.status})`);
      const data = await r.json();
      setSelectedCard(data);
    } catch (e) {
      setGenError(e.message || 'Failed to generate battlecard');
    }
    setGenerating(null);
  };

  // ── Loading
  if (loading) return <SkeletonList rows={4} />;

  // ── Error
  if (error) return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>AI Battlecards</h1>
      <p style={{ color: th.textMuted, fontSize: 13, marginBottom: 24 }}>Sales-ready competitive intelligence cards</p>
      <ErrorCard title="Failed to load battlecards" message={error} onRetry={loadCompetitors} />
    </div>
  );

  // ── Battlecard Detail View
  if (selectedCard) {
    const tc = threatColors[selectedCard.threat_level?.toLowerCase()] || th.textMuted;
    return (
      <div>
        <button onClick={() => setSelectedCard(null)} style={{ padding: '6px 16px', borderRadius: 8, border: `1px solid ${th.border}`, background: 'transparent', color: th.textMuted, fontSize: 12, cursor: 'pointer', marginBottom: 20, fontFamily: "'Sora',sans-serif" }}>← Back to All</button>

        {/* Header */}
        <div style={{ ...card, marginBottom: 16, borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>⚔️ {selectedCard.competitor_name}</h1>
              <div style={{ fontSize: 12, color: th.accent, fontFamily: th.mono }}>{selectedCard.competitor_url?.replace('https://', '')}</div>
            </div>
            <div style={{ padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${tc}15`, color: tc, fontFamily: th.mono }}>
              {selectedCard.threat_level || 'N/A'}
            </div>
          </div>
          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>{selectedCard.competitor_overview}</p>
          {selectedCard.source === 'demo' && (
            <div style={{ marginTop: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 12, color: th.amber }}>
              Demo mode — add your OpenAI or Anthropic API key in Settings for AI-powered battlecards.
            </div>
          )}
        </div>

        {/* Quick Pitch */}
        <div style={{ ...card, marginBottom: 16, borderLeft: `4px solid ${th.accent}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: th.accent, letterSpacing: 2, fontFamily: th.mono, marginBottom: 8 }}>30-SECOND PITCH</div>
          <p style={{ fontSize: 15, color: '#fff', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>{selectedCard.quick_pitch}</p>
        </div>

        {/* Strengths vs Weaknesses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={{ ...card, borderColor: 'rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: th.red, letterSpacing: 2, fontFamily: th.mono, marginBottom: 12 }}>THEIR STRENGTHS</div>
            {(selectedCard.their_strengths || []).map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', fontSize: 13, color: '#cbd5e1' }}>
                <span style={{ color: th.red, flexShrink: 0 }}>▸</span> {s}
              </div>
            ))}
          </div>
          <div style={{ ...card, borderColor: 'rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: th.amber, letterSpacing: 2, fontFamily: th.mono, marginBottom: 12 }}>THEIR WEAKNESSES</div>
            {(selectedCard.their_weaknesses || []).map((w, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '6px 0', fontSize: 13, color: '#cbd5e1' }}>
                <span style={{ color: th.amber, flexShrink: 0 }}>▸</span> {w}
              </div>
            ))}
          </div>
        </div>

        {/* Our Advantages */}
        <div style={{ ...card, marginBottom: 16, borderColor: 'rgba(16,185,129,0.15)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: th.green, letterSpacing: 2, fontFamily: th.mono, marginBottom: 12 }}>OUR ADVANTAGES</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {(selectedCard.our_advantages || []).map((a, i) => (
              <div key={i} style={{ padding: 14, borderRadius: 10, background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)', fontSize: 13, color: th.green, textAlign: 'center' }}>
                ✓ {a}
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: th.cyan, letterSpacing: 2, fontFamily: th.mono, marginBottom: 8 }}>PRICING COMPARISON</div>
          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>{selectedCard.pricing_comparison}</p>
        </div>

        {/* Key Differentiators */}
        <div style={{ ...card, marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: th.accent, letterSpacing: 2, fontFamily: th.mono, marginBottom: 8 }}>KEY DIFFERENTIATORS</div>
          <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>{selectedCard.key_differentiators}</p>
        </div>

        {/* Objection Handlers */}
        <div style={{ ...card, marginBottom: 16, borderColor: 'rgba(99,102,241,0.15)' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: th.accent, letterSpacing: 2, fontFamily: th.mono, marginBottom: 14 }}>OBJECTION HANDLERS</div>
          {(selectedCard.objection_handlers || []).map((o, i) => (
            <div key={i} style={{ marginBottom: i < (selectedCard.objection_handlers?.length || 0) - 1 ? 16 : 0, padding: 16, borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: `1px solid ${th.border}` }}>
              <div style={{ fontSize: 12, color: th.red, fontWeight: 600, marginBottom: 6 }}>🗣️ "{o.objection}"</div>
              <div style={{ fontSize: 13, color: th.green, lineHeight: 1.6 }}>→ {o.response}</div>
            </div>
          ))}
        </div>

        {/* Win Themes & Landmines */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: th.green, letterSpacing: 2, fontFamily: th.mono, marginBottom: 12 }}>WIN THEMES</div>
            {(selectedCard.win_themes || []).map((w, i) => (
              <div key={i} style={{ padding: '8px 0', fontSize: 13, color: '#cbd5e1', borderBottom: i < (selectedCard.win_themes?.length || 0) - 1 ? `1px solid ${th.border}` : 'none' }}>
                🏆 {w}
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontSize: 10, fontWeight: 700, color: th.amber, letterSpacing: 2, fontFamily: th.mono, marginBottom: 12 }}>LANDMINE QUESTIONS</div>
            {(selectedCard.landmines || []).map((l, i) => (
              <div key={i} style={{ padding: '8px 0', fontSize: 13, color: '#cbd5e1', borderBottom: i < (selectedCard.landmines?.length || 0) - 1 ? `1px solid ${th.border}` : 'none' }}>
                💣 {l}
              </div>
            ))}
          </div>
        </div>

        {/* Last Signal & Timestamp */}
        <div style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: th.textDim, letterSpacing: 1, fontFamily: th.mono, marginBottom: 4 }}>LAST SIGNAL</div>
            <div style={{ fontSize: 13, color: '#cbd5e1' }}>{selectedCard.last_signal}</div>
          </div>
          <div style={{ fontSize: 11, color: th.textDim, fontFamily: th.mono }}>
            Generated {selectedCard.generated_at ? new Date(selectedCard.generated_at).toLocaleDateString() : 'now'}
          </div>
        </div>
      </div>
    );
  }

  // ── List View
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>⚔️ AI Battlecards</h1>
          <p style={{ color: th.textMuted, fontSize: 13, margin: 0 }}>Sales-ready competitive intelligence — powered by GPT-4</p>
        </div>
      </div>

      {genError && (
        <div style={{ padding: '10px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', color: th.red, fontSize: 13, marginBottom: 16 }}>
          ✕ {genError}
        </div>
      )}

      {competitors.length === 0 ? (
        <EmptyState
          icon="⚔️"
          title="No competitors to battle"
          message="Add competitors first, then generate AI battlecards for your sales team."
        />
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {competitors.map(c => (
            <div key={c.competitor_id} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{c.competitor_name}</div>
                <div style={{ fontSize: 12, color: th.accent, fontFamily: th.mono, marginBottom: 4 }}>{c.website_url?.replace('https://', '')}</div>
                <div style={{ fontSize: 11, color: th.textMuted }}>
                  {c.changes_count > 0 ? `${c.changes_count} recent changes detected` : 'No changes yet — run a scan first'}
                </div>
              </div>
              <LoadingButton
                loading={generating === c.competitor_id}
                onClick={() => handleGenerate(c.competitor_id)}
                style={{ padding: '10px 20px', fontSize: 13 }}
              >
                {generating === c.competitor_id ? 'Generating...' : '⚔️ Generate Battlecard'}
              </LoadingButton>
            </div>
          ))}
        </div>
      )}

      {/* Info card */}
      <div style={{ ...card, marginTop: 20, borderColor: 'rgba(99,102,241,0.1)', background: 'rgba(99,102,241,0.02)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>What's in a Battlecard?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { icon: '🎯', label: 'Quick Pitch', desc: '30-second positioning against this competitor' },
            { icon: '⚡', label: 'Strengths & Weaknesses', desc: 'Their advantages and where they fall short' },
            { icon: '🗣️', label: 'Objection Handlers', desc: 'What to say when prospects bring them up' },
            { icon: '💰', label: 'Pricing Comparison', desc: 'How their pricing stacks up against yours' },
            { icon: '🏆', label: 'Win Themes', desc: 'Angles that win deals against them' },
            { icon: '💣', label: 'Landmine Questions', desc: 'Questions that expose their weaknesses' },
          ].map((f, i) => (
            <div key={i} style={{ padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: `1px solid ${th.border}` }}>
              <div style={{ fontSize: 18, marginBottom: 6 }}>{f.icon}</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{f.label}</div>
              <div style={{ fontSize: 11, color: th.textMuted }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
