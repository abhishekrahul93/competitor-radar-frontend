import { useState, useEffect } from 'react';
import { SkeletonList, ErrorCard, ErrorBanner, SuccessBanner, LoadingButton, Spinner, EmptyState } from './UIComponents';

const th = {border:'rgba(255,255,255,0.06)',textMuted:'#64748b',textDim:'#475569',accent:'#6366f1',accentGlow:'rgba(99,102,241,0.15)',red:'#ef4444',amber:'#f59e0b',green:'#10b981',cyan:'#06b6d4',mono:"'IBM Plex Mono', monospace"};
const card = {background:'rgba(255,255,255,0.02)',border:`1px solid ${th.border}`,borderRadius:14,padding:20};
const btn = {padding:'10px 24px',borderRadius:10,border:'none',background:`linear-gradient(135deg, ${th.accent}, #4f46e5)`,color:'white',fontSize:13,fontWeight:600,cursor:'pointer',fontFamily:"'Sora',sans-serif"};
const btnGhost = {padding:'8px 16px',borderRadius:8,border:`1px solid ${th.border}`,background:'transparent',color:th.textMuted,fontSize:12,cursor:'pointer',fontFamily:"'Sora',sans-serif"};
const input = {width:'100%',padding:'10px 14px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:`1px solid ${th.border}`,color:'#e2e8f0',fontSize:13,outline:'none',boxSizing:'border-box'};

export default function Teams({ competitors }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteTeamId, setInviteTeamId] = useState(null);
  const [inviting, setInviting] = useState(false);
  const [shareTeamId, setShareTeamId] = useState(null);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [removingId, setRemovingId] = useState(null);

  const token = localStorage.getItem('radar_token');
  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const showMsg = (m) => { setMsg(m); setErr(''); setTimeout(() => setMsg(''), 4000); };
  const showErr = (m) => { setErr(m); setMsg(''); setTimeout(() => setErr(''), 5000); };

  const loadTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await fetch('/api/teams/', { headers });
      if (!r.ok) throw new Error(`Server error (${r.status})`);
      setTeams(await r.json());
    } catch (e) {
      setError(e.message || 'Failed to load teams');
    }
    setLoading(false);
  };

  useEffect(() => { loadTeams(); }, []);

  const createTeam = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const r = await fetch('/api/teams/', { method: 'POST', headers, body: JSON.stringify({ name: newName, description: newDesc }) });
      const d = await r.json();
      if (r.ok) { showMsg(d.message || 'Team created!'); setNewName(''); setNewDesc(''); setShowCreate(false); loadTeams(); }
      else showErr(d.error || d.detail || 'Failed to create team');
    } catch (e) { showErr('Network error — please try again'); }
    setCreating(false);
  };

  const inviteMember = async (teamId) => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const r = await fetch(`/api/teams/${teamId}/invite`, { method: 'POST', headers, body: JSON.stringify({ email: inviteEmail, role: 'member' }) });
      const d = await r.json();
      if (r.ok) { showMsg(d.message || 'Invite sent!'); setInviteEmail(''); setInviteTeamId(null); loadTeams(); }
      else showErr(d.error || d.detail || 'Failed to invite');
    } catch (e) { showErr('Network error — please try again'); }
    setInviting(false);
  };

  const removeMember = async (teamId, memberId) => {
    setRemovingId(memberId);
    try {
      const r = await fetch(`/api/teams/${teamId}/members/${memberId}`, { method: 'DELETE', headers });
      const d = await r.json();
      if (r.ok) { showMsg('Member removed'); loadTeams(); }
      else showErr(d.error || d.detail || 'Failed to remove member');
    } catch (e) { showErr('Network error'); }
    setRemovingId(null);
  };

  const shareCompetitor = async (teamId, compId) => {
    try {
      const r = await fetch(`/api/teams/${teamId}/share/${compId}`, { method: 'POST', headers });
      const d = await r.json();
      if (r.ok) { showMsg(d.message || 'Shared!'); setShareTeamId(null); loadTeams(); }
      else showErr(d.error || d.detail || 'Failed to share');
    } catch (e) { showErr('Network error'); }
  };

  const deleteTeam = async (teamId) => {
    if (!confirm('Delete this team?')) return;
    setDeletingId(teamId);
    try {
      const r = await fetch(`/api/teams/${teamId}`, { method: 'DELETE', headers });
      const d = await r.json();
      if (r.ok) { showMsg(d.message || 'Team deleted'); loadTeams(); }
      else showErr(d.error || d.detail || 'Failed to delete');
    } catch (e) { showErr('Network error'); }
    setDeletingId(null);
  };

  const roleBadge = (role) => {
    const colors = { owner: th.amber, admin: th.cyan, member: th.green };
    const c = colors[role] || th.textMuted;
    return { padding: '2px 8px', borderRadius: 12, fontSize: 10, fontWeight: 700, background: `${c}15`, color: c, fontFamily: th.mono, letterSpacing: 0.5, textTransform: 'uppercase' };
  };

  /* ── Loading state ─────────────────────────────────────── */
  if (loading) return <SkeletonList rows={3} />;

  /* ── Error state ───────────────────────────────────────── */
  if (error && teams.length === 0) {
    return (
      <div>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Teams</h1>
          <p style={{ color: th.textMuted, fontSize: 13, margin: 0 }}>Collaborate with your team on competitive intelligence</p>
        </div>
        <ErrorCard title="Failed to load teams" message={error} onRetry={loadTeams} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 4px' }}>Teams</h1>
          <p style={{ color: th.textMuted, fontSize: 13, margin: 0 }}>Collaborate with your team on competitive intelligence</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} style={btn}>{showCreate ? 'Cancel' : '+ Create Team'}</button>
      </div>

      <SuccessBanner message={msg} onDismiss={() => setMsg('')} />
      <ErrorBanner message={err} onDismiss={() => setErr('')} onRetry={error ? loadTeams : undefined} />

      {showCreate && (
        <div style={{ ...card, marginBottom: 20, borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.03)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 16px' }}>Create New Team</h3>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: th.textMuted, display: 'block', marginBottom: 6, fontFamily: th.mono }}>TEAM NAME *</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Marketing Team" style={input} />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 10, fontWeight: 700, color: th.textMuted, display: 'block', marginBottom: 6, fontFamily: th.mono }}>DESCRIPTION</label>
            <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Optional description" style={input} />
          </div>
          <LoadingButton loading={creating} disabled={!newName.trim()} onClick={createTeam}>
            {creating ? 'Creating...' : 'Create Team'}
          </LoadingButton>
        </div>
      )}

      {!loading && teams.length === 0 && !showCreate && (
        <EmptyState
          icon="👥"
          title="No Teams Yet"
          message="Create a team to collaborate with colleagues on competitive intelligence"
          actionLabel="+ Create Your First Team"
          onAction={() => setShowCreate(true)}
        />
      )}

      {teams.map(team => (
        <div key={team.id} style={{ ...card, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>{team.name}</h3>
                <span style={roleBadge(team.my_role)}>{team.my_role}</span>
              </div>
              {team.description && <p style={{ color: th.textMuted, fontSize: 12, margin: 0 }}>{team.description}</p>}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {team.is_owner && (
                <button onClick={() => deleteTeam(team.id)} disabled={deletingId === team.id}
                  style={{ ...btnGhost, color: th.red, fontSize: 11, opacity: deletingId === team.id ? 0.5 : 1, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {deletingId === team.id && <Spinner size={10} color={th.red} />}
                  {deletingId === team.id ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 14, border: `1px solid ${th.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: th.textDim, letterSpacing: 1, fontFamily: th.mono, marginBottom: 6 }}>MEMBERS</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: th.accent }}>{team.member_count}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 14, border: `1px solid ${th.border}` }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: th.textDim, letterSpacing: 1, fontFamily: th.mono, marginBottom: 6 }}>SHARED COMPETITORS</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: th.cyan }}>{team.shared_competitors}</div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Members</div>
            {team.members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${th.border}` }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: th.accentGlow, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: th.accent }}>{(m.name || m.email)[0].toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{m.name || m.email}</div>
                    <div style={{ fontSize: 11, color: th.textMuted }}>{m.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={roleBadge(m.role)}>{m.role}</span>
                  {team.is_owner && m.role !== 'owner' && (
                    <button onClick={() => removeMember(team.id, m.id)} disabled={removingId === m.id}
                      style={{ ...btnGhost, padding: '4px 10px', fontSize: 10, color: th.red, opacity: removingId === m.id ? 0.5 : 1 }}>
                      {removingId === m.id ? '...' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {(team.my_role === 'owner' || team.my_role === 'admin') && (
              inviteTeamId === team.id ? (
                <div style={{ display: 'flex', gap: 8, flex: 1 }}>
                  <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@company.com" style={{ ...input, flex: 1 }} onKeyDown={e => e.key === 'Enter' && inviteMember(team.id)} />
                  <LoadingButton loading={inviting} onClick={() => inviteMember(team.id)} style={{ padding: '10px 16px', fontSize: 12 }}>
                    {inviting ? 'Sending...' : 'Send'}
                  </LoadingButton>
                  <button onClick={() => { setInviteTeamId(null); setInviteEmail(''); }} style={{ ...btnGhost, fontSize: 11 }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setInviteTeamId(team.id)} style={{ ...btn, padding: '8px 16px', fontSize: 12 }}>+ Invite Member</button>
              )
            )}
            {shareTeamId === team.id ? (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                {competitors.map(c => (
                  <button key={c.id} onClick={() => shareCompetitor(team.id, c.id)} style={{ ...btnGhost, fontSize: 11, color: th.cyan }}>{c.name}</button>
                ))}
                <button onClick={() => setShareTeamId(null)} style={{ ...btnGhost, fontSize: 11 }}>Cancel</button>
              </div>
            ) : (
              <button onClick={() => setShareTeamId(team.id)} style={{ ...btnGhost, fontSize: 12, color: th.cyan }}>Share Competitor</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
