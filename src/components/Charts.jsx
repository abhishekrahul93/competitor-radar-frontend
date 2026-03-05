import React from 'react'

const theme = {
  bg: '#05050d', bgCard: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)',
  text: '#e2e8f0', textMuted: '#64748b', textDim: '#475569', accent: '#6366f1',
  red: '#ef4444', amber: '#f59e0b', green: '#10b981', cyan: '#06b6d4',
  mono: "'IBM Plex Mono', monospace",
}

function Bar({ value, max, color, label, count }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, color: color, fontWeight: 700, fontFamily: theme.mono }}>{count}</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 4, background: `linear-gradient(90deg, ${color}, ${color}88)`, transition: 'width 1s ease' }} />
      </div>
    </div>
  )
}

function MiniCard({ label, value, color, sub }) {
  return (
    <div style={{ background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: theme.textDim, letterSpacing: 2, fontFamily: theme.mono, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function TimelineItem({ change, idx }) {
  const sigColor = change.significance >= 0.8 ? theme.red : change.significance >= 0.5 ? theme.amber : theme.green
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 0 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: sigColor, flexShrink: 0, border: `2px solid ${theme.bg}`, zIndex: 1 }} />
        {idx >= 0 && <div style={{ width: 1, flex: 1, background: theme.border }} />}
      </div>
      <div style={{ flex: 1, paddingBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#cbd5e1', fontWeight: 500, lineHeight: 1.5 }}>{change.summary?.slice(0, 120)}</div>
        <div style={{ fontSize: 11, color: theme.textDim, marginTop: 3 }}>
          {change.competitor_name} · {change.page_type} · {Math.round(change.significance * 100)}% · {new Date(change.detected_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

export default function ChartsPage({ competitors, changes, reports }) {
  // Compute stats
  const byCompetitor = {}
  const byCategory = {}
  const byPageType = {}
  const sigBuckets = { critical: 0, high: 0, medium: 0, low: 0 }

  changes.forEach(c => {
    byCompetitor[c.competitor_name] = (byCompetitor[c.competitor_name] || 0) + 1
    byCategory[c.change_category || 'other'] = (byCategory[c.change_category || 'other'] || 0) + 1
    byPageType[c.page_type || 'unknown'] = (byPageType[c.page_type || 'unknown'] || 0) + 1
    if (c.significance >= 0.9) sigBuckets.critical++
    else if (c.significance >= 0.7) sigBuckets.high++
    else if (c.significance >= 0.5) sigBuckets.medium++
    else sigBuckets.low++
  })

  const maxByComp = Math.max(...Object.values(byCompetitor), 1)
  const maxByCat = Math.max(...Object.values(byCategory), 1)
  const avgSig = changes.length > 0 ? (changes.reduce((a, c) => a + c.significance, 0) / changes.length) : 0

  const catColors = { pricing: theme.red, hiring: theme.amber, messaging: theme.cyan, content: theme.green, conversion: theme.accent, seo: '#a78bfa', other: theme.textMuted }
  const compColors = [theme.accent, theme.cyan, theme.red, theme.amber, theme.green, '#a78bfa']

  const css = { card: { background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: 14, padding: 20 } }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Analytics & Trends</h1>
        <p style={{ color: theme.textMuted, fontSize: 13, margin: 0 }}>Visual intelligence across your competitive landscape</p>
      </div>

      {changes.length === 0 ? (
        <div style={{ ...css.card, textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
          <p style={{ color: theme.textMuted }}>No data yet. Load demo data or run a scan to see analytics.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
            <MiniCard label="TOTAL CHANGES" value={changes.length} color={theme.accent} />
            <MiniCard label="COMPETITORS" value={competitors.length} color={theme.cyan} />
            <MiniCard label="AI BRIEFS" value={reports.length} color={theme.green} />
            <MiniCard label="AVG SIGNIFICANCE" value={`${Math.round(avgSig * 100)}%`} color={avgSig >= 0.7 ? theme.red : theme.amber} />
            <MiniCard label="CRITICAL ALERTS" value={sigBuckets.critical} color={theme.red} sub={sigBuckets.critical > 0 ? 'Needs attention' : 'All clear'} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {/* Changes by Competitor */}
            <div style={css.card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Changes by Competitor</h3>
              {Object.entries(byCompetitor).sort((a, b) => b[1] - a[1]).map(([name, count], i) => (
                <Bar key={name} label={name} value={count} max={maxByComp} count={count} color={compColors[i % compColors.length]} />
              ))}
            </div>

            {/* Changes by Category */}
            <div style={css.card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Changes by Category</h3>
              {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <Bar key={cat} label={cat.charAt(0).toUpperCase() + cat.slice(1)} value={count} max={maxByCat} count={count} color={catColors[cat] || theme.textMuted} />
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {/* Threat Distribution */}
            <div style={css.card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Threat Distribution</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[
                  { label: 'Critical', value: sigBuckets.critical, color: theme.red, range: '90-100%' },
                  { label: 'High', value: sigBuckets.high, color: theme.amber, range: '70-89%' },
                  { label: 'Medium', value: sigBuckets.medium, color: theme.cyan, range: '50-69%' },
                  { label: 'Low', value: sigBuckets.low, color: theme.green, range: '0-49%' },
                ].map(b => (
                  <div key={b.label} style={{ textAlign: 'center', padding: 12, borderRadius: 10, background: `${b.color}08`, border: `1px solid ${b.color}20` }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: b.color }}>{b.value}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: b.color, marginTop: 2 }}>{b.label}</div>
                    <div style={{ fontSize: 9, color: theme.textDim, fontFamily: theme.mono, marginTop: 2 }}>{b.range}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Changes by Page Type */}
            <div style={css.card}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Changes by Page Type</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(byPageType).map(([page, count]) => {
                  const pageColors = { homepage: theme.accent, pricing: theme.red, careers: theme.amber, docs: theme.green }
                  const pc = pageColors[page] || theme.cyan
                  return (
                    <div key={page} style={{ flex: 1, minWidth: 100, textAlign: 'center', padding: 16, borderRadius: 10, background: `${pc}08`, border: `1px solid ${pc}20` }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: pc }}>{count}</div>
                      <div style={{ fontSize: 11, color: pc, fontWeight: 600, marginTop: 2 }}>{page}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div style={css.card}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Change Timeline</h3>
            {changes.slice(0, 10).map((c, i) => (
              <TimelineItem key={i} change={c} idx={i < changes.length - 1 ? i : -1} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}