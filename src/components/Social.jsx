import { useState, useEffect } from "react";

const PLATFORM_CONFIG = {
  twitter: { label: "X / Twitter", color: "#1DA1F2" },
  reddit: { label: "Reddit", color: "#FF4500" },
};

const SENTIMENT_CONFIG = {
  positive: { color: "#22c55e", bg: "rgba(34,197,94,0.15)" },
  negative: { color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
  neutral:  { color: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
};

const apiCall = async (url, options = {}) => {
  const token = localStorage.getItem("radar_token");
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default function Social({ competitors = [] }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanningId, setScanningId] = useState(null);
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterCompetitor, setFilterCompetitor] = useState("all");
  const [activeTab, setActiveTab] = useState("feed");
  const [settingsTarget, setSettingsTarget] = useState(null);
  const [settingsForm, setSettingsForm] = useState({ twitter_handle: "", linkedin_url: "", reddit_keywords: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  const load = async () => {
    setLoading(true);
    try { const data = await apiCall("/api/social/summary"); setSummary(data); }
    catch (e) { console.error(e); }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleScanAll = async () => {
    setScanning(true);
    try { await apiCall("/api/social/scan-all", { method: "POST" }); await load(); }
    catch (e) { console.error(e); }
    setScanning(false);
  };

  const handleScanOne = async (id) => {
    setScanningId(id);
    try { await apiCall(`/api/social/scan/${id}`, { method: "POST" }); await load(); }
    catch (e) { console.error(e); }
    setScanningId(null);
  };

  const openSettings = async (competitor) => {
    setSettingsTarget(competitor);
    setSettingsMsg("");
    try {
      const s = await apiCall(`/api/social/settings/${competitor.id}`);
      setSettingsForm({ twitter_handle: s.twitter_handle || "", linkedin_url: s.linkedin_url || "", reddit_keywords: s.reddit_keywords || competitor.name });
    } catch { setSettingsForm({ twitter_handle: "", linkedin_url: "", reddit_keywords: competitor.name }); }
    setActiveTab("settings");
  };

  const saveSettings = async () => {
    if (!settingsTarget) return;
    setSettingsSaving(true);
    try { await apiCall(`/api/social/settings/${settingsTarget.id}`, { method: "PUT", body: JSON.stringify(settingsForm) }); setSettingsMsg("Saved!"); }
    catch { setSettingsMsg("Failed"); }
    setSettingsSaving(false);
  };

  const filteredPosts = (summary?.recent_posts || []).filter(p => {
    if (filterPlatform !== "all" && p.platform !== filterPlatform) return false;
    if (filterCompetitor !== "all" && String(p.competitor_id) !== filterCompetitor) return false;
    return true;
  });

  const s = {
    wrap: { padding: 24, fontFamily: "'Sora', sans-serif", color: "#e2e8f0", maxWidth: 1100 },
    card: { background: "linear-gradient(135deg,#1e293b,#0f172a)", border: "1px solid #334155", borderRadius: 12, padding: "18px 20px" },
    tab: (a) => ({ padding: "10px 20px", cursor: "pointer", fontWeight: 600, fontSize: 14, color: a ? "#6366f1" : "#64748b", background: "none", border: "none", borderBottom: a ? "2px solid #6366f1" : "2px solid transparent" }),
    select: { background: "#1e293b", border: "1px solid #334155", color: "#e2e8f0", padding: "8px 14px", borderRadius: 8, fontSize: 13 },
    post: { background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: "16px 20px", marginBottom: 12 },
    badge: (color, bg) => ({ background: bg, color, border: `1px solid ${color}44`, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 }),
    aiBox: { background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#a5b4fc", marginBottom: 10 },
    btn: (v="primary") => ({ padding: "9px 18px", borderRadius: 8, border: v==="ghost" ? "1px solid #334155" : "none", cursor: "pointer", fontWeight: 600, fontSize: 13, fontFamily: "'Sora',sans-serif", background: v==="primary" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent", color: v==="ghost" ? "#94a3b8" : "#fff" }),
    input: { width: "100%", background: "#0f172a", border: "1px solid #334155", color: "#e2e8f0", padding: "10px 14px", borderRadius: 8, fontSize: 13, fontFamily: "'Sora',sans-serif", boxSizing: "border-box", marginTop: 6 },
  };

  if (loading) return <div style={s.wrap}><p style={{ color: "#94a3b8", textAlign: "center", marginTop: 60 }}>Loading...</p></div>;

  return (
    <div style={s.wrap}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f8fafc", margin: 0 }}>Social Monitor</h1>
          <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>Track competitor activity on Twitter/X and Reddit</p>
        </div>
        <button style={{ ...s.btn(), opacity: scanning ? 0.7 : 1 }} onClick={handleScanAll} disabled={scanning}>
          {scanning ? "Scanning..." : "Scan All Now"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Posts", val: summary?.total_posts || 0, color: "#f1f5f9" },
          { label: "Announcements", val: summary?.announcements || 0, color: "#fbbf24" },
          { label: "Twitter / X", val: summary?.by_platform?.twitter || 0, color: "#1DA1F2" },
          { label: "Reddit", val: summary?.by_platform?.reddit || 0, color: "#FF4500" },
        ].map(({ label, val, color }) => (
          <div key={label} style={s.card}>
            <div style={{ color: "#64748b", fontSize: 12, fontWeight: 600, textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color, marginTop: 6 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid #1e293b", marginBottom: 24 }}>
        <button style={s.tab(activeTab === "feed")} onClick={() => setActiveTab("feed")}>Live Feed</button>
        <button style={s.tab(activeTab === "settings")} onClick={() => { setActiveTab("settings"); if (competitors[0] && !settingsTarget) openSettings(competitors[0]); }}>
          Configure Handles
        </button>
      </div>

      {activeTab === "feed" && (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 20, alignItems: "center" }}>
            <select style={s.select} value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
              <option value="all">All Platforms</option>
              <option value="twitter">Twitter/X</option>
              <option value="reddit">Reddit</option>
            </select>
            <select style={s.select} value={filterCompetitor} onChange={e => setFilterCompetitor(e.target.value)}>
              <option value="all">All Competitors</option>
              {competitors.map(c => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
            </select>
            <span style={{ color: "#475569", fontSize: 12, marginLeft: "auto" }}>{filteredPosts.length} posts</span>
          </div>

          {filteredPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#475569" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No posts yet</div>
              <p style={{ fontSize: 13 }}>Go to Configure Handles, add Twitter handles or Reddit keywords, then Scan All Now.</p>
            </div>
          ) : filteredPosts.map(post => (
            <div key={post.id} style={s.post}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                  <span style={s.badge(PLATFORM_CONFIG[post.platform]?.color || "#64748b", (PLATFORM_CONFIG[post.platform]?.color || "#64748b") + "22")}>
                    {PLATFORM_CONFIG[post.platform]?.label || post.platform}
                  </span>
                  <span style={s.badge("#a5b4fc", "rgba(99,102,241,0.1)")}>{post.competitor_name}</span>
                  {post.is_announcement && <span style={s.badge("#fbbf24", "rgba(251,191,36,0.15)")}>Announcement</span>}
                  <span style={s.badge(SENTIMENT_CONFIG[post.sentiment]?.color || "#94a3b8", SENTIMENT_CONFIG[post.sentiment]?.bg || "transparent")}>{post.sentiment}</span>
                </div>
                <span style={{ color: "#475569", fontSize: 12 }}>
                  {post.posted_at ? new Date(post.posted_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
                </span>
              </div>
              <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6, marginBottom: 10 }}>{post.content}</p>
              {post.ai_summary && <div style={s.aiBox}>AI: {post.ai_summary}</div>}
              <div style={{ display: "flex", gap: 16, fontSize: 12, color: "#475569", alignItems: "center" }}>
                <span>{post.author}</span>
                {post.engagement?.upvotes > 0 && <span>+{post.engagement.upvotes}</span>}
                {post.engagement?.comments > 0 && <span>{post.engagement.comments} comments</span>}
                {post.post_url && <a href={post.post_url} target="_blank" rel="noopener noreferrer" style={{ color: "#6366f1", fontSize: 12 }}>View Post</a>}
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === "settings" && (
        <div>
          <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Select a competitor to configure social handles.</p>
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {competitors.map(c => (
              <button key={c.id} style={{ ...s.btn(settingsTarget?.id === c.id ? "primary" : "ghost"), padding: "7px 16px", fontSize: 13 }} onClick={() => openSettings(c)}>
                {c.name}
              </button>
            ))}
          </div>
          {settingsTarget && (
            <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 24 }}>
              <h3 style={{ color: "#f1f5f9", fontWeight: 700, marginTop: 0, marginBottom: 20 }}>{settingsTarget.name}</h3>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block" }}>Twitter/X Handle (without @)</label>
                <input style={s.input} placeholder="e.g. stripe" value={settingsForm.twitter_handle} onChange={e => setSettingsForm(f => ({ ...f, twitter_handle: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block" }}>Reddit Keywords</label>
                <input style={s.input} placeholder={settingsTarget.name} value={settingsForm.reddit_keywords} onChange={e => setSettingsForm(f => ({ ...f, reddit_keywords: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, display: "block" }}>LinkedIn URL (optional)</label>
                <input style={s.input} placeholder="https://linkedin.com/company/..." value={settingsForm.linkedin_url} onChange={e => setSettingsForm(f => ({ ...f, linkedin_url: e.target.value }))} />
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <button style={{ ...s.btn(), opacity: settingsSaving ? 0.7 : 1 }} onClick={saveSettings} disabled={settingsSaving}>
                  {settingsSaving ? "Saving..." : "Save Handles"}
                </button>
                <button style={{ ...s.btn("ghost"), opacity: scanningId === settingsTarget?.id ? 0.7 : 1 }} onClick={() => handleScanOne(settingsTarget.id)} disabled={!!scanningId}>
                  {scanningId === settingsTarget?.id ? "Scanning..." : "Scan Now"}
                </button>
                {settingsMsg && <span style={{ color: settingsMsg === "Saved!" ? "#22c55e" : "#ef4444", fontSize: 13 }}>{settingsMsg}</span>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
