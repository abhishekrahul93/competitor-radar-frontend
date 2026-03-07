import { useState, useEffect } from 'react';
import { SkeletonDashboard, ErrorCard, Spinner } from './UIComponents';

const th = {bg:'#05050d',bgCard:'rgba(255,255,255,0.02)',border:'rgba(255,255,255,0.06)',text:'#e2e8f0',textMuted:'#64748b',textDim:'#475569',accent:'#6366f1',accentGlow:'rgba(99,102,241,0.15)',red:'#ef4444',amber:'#f59e0b',green:'#10b981',cyan:'#06b6d4',font:"'Sora', sans-serif",mono:"'IBM Plex Mono', monospace"};
const card = {background:th.bgCard,border:`1px solid ${th.border}`,borderRadius:14,padding:20};

function MiniBar({data, color, height=40}) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  return (
    <div style={{display:'flex',alignItems:'flex-end',gap:2,height}}>
      {data.map((v,i) => (
        <div key={i} style={{flex:1,background:color||th.accent,opacity:0.3+0.7*(v/max),borderRadius:2,minHeight:2,height:`${Math.max(8,(v/max)*100)}%`}}/>
      ))}
    </div>
  );
}

function StatCard({label, value, sub, color, icon, trend, sparkData, loading: isLoading}) {
  if (isLoading) {
    return (
      <div style={{...card,padding:'18px 16px',position:'relative',overflow:'hidden'}}>
        <div style={{background:'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%)',backgroundSize:'200% 100%',animation:'ui-shimmer 1.5s ease-in-out infinite',height:10,width:80,borderRadius:6,marginBottom:12}} />
        <div style={{background:'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%)',backgroundSize:'200% 100%',animation:'ui-shimmer 1.5s ease-in-out infinite',height:28,width:50,borderRadius:6,marginBottom:8}} />
        <div style={{background:'linear-gradient(90deg,rgba(255,255,255,0.03) 25%,rgba(255,255,255,0.06) 50%,rgba(255,255,255,0.03) 75%)',backgroundSize:'200% 100%',animation:'ui-shimmer 1.5s ease-in-out infinite',height:8,width:100,borderRadius:4}} />
        <style>{`@keyframes ui-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
      </div>
    );
  }
  return (
    <div style={{...card,padding:'18px 16px',position:'relative',overflow:'hidden'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <div style={{fontSize:10,fontWeight:700,color:th.textDim,letterSpacing:1.5,fontFamily:th.mono,marginBottom:6}}>{label}</div>
          <div style={{fontSize:32,fontWeight:800,color:color||'#fff'}}>{value}</div>
          {sub && <div style={{fontSize:11,color:th.textMuted,marginTop:4}}>{sub}</div>}
        </div>
        <div style={{fontSize:24,opacity:0.6}}>{icon}</div>
      </div>
      {trend !== undefined && (
        <div style={{marginTop:8,fontSize:11,fontWeight:600,color:trend>0?th.green:trend<0?th.red:th.textMuted}}>
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)} this week
        </div>
      )}
      {sparkData && <div style={{marginTop:10}}><MiniBar data={sparkData} color={color} height={30}/></div>}
    </div>
  );
}

function ThreatMeter({changes}) {
  const high = changes.filter(c => c.significance >= 0.8).length;
  const med = changes.filter(c => c.significance >= 0.5 && c.significance < 0.8).length;
  const low = changes.filter(c => c.significance < 0.5).length;
  const total = changes.length || 1;
  return (
    <div style={card}>
      <h3 style={{fontSize:14,fontWeight:700,color:'#fff',margin:'0 0 14px'}}>Threat Distribution</h3>
      <div style={{display:'flex',gap:4,height:8,borderRadius:4,overflow:'hidden',marginBottom:16}}>
        <div style={{width:`${(high/total)*100}%`,background:th.red,borderRadius:4,minWidth:high?4:0,transition:'width 0.6s ease'}}/>
        <div style={{width:`${(med/total)*100}%`,background:th.amber,borderRadius:4,minWidth:med?4:0,transition:'width 0.6s ease'}}/>
        <div style={{width:`${(low/total)*100}%`,background:th.green,borderRadius:4,minWidth:low?4:0,transition:'width 0.6s ease'}}/>
      </div>
      <div style={{display:'flex',justifyContent:'space-between'}}>
        {[{l:'Critical',v:high,c:th.red},{l:'Medium',v:med,c:th.amber},{l:'Low',v:low,c:th.green}].map((t,i) => (
          <div key={i} style={{textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:800,color:t.c}}>{t.v}</div>
            <div style={{fontSize:10,color:th.textMuted,fontFamily:th.mono,letterSpacing:1}}>{t.l.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompetitorLeaderboard({competitors, changes}) {
  const compChanges = {};
  changes.forEach(c => { compChanges[c.competitor_name] = (compChanges[c.competitor_name] || 0) + 1; });
  const sorted = competitors.map(c => ({
    ...c, changeCount: compChanges[c.name] || 0,
    avgSig: changes.filter(ch => ch.competitor_name === c.name).reduce((a, ch) => a + (ch.significance || 0), 0) / (compChanges[c.name] || 1)
  })).sort((a, b) => b.changeCount - a.changeCount);

  return (
    <div style={card}>
      <h3 style={{fontSize:14,fontWeight:700,color:'#fff',margin:'0 0 14px'}}>Competitor Activity</h3>
      {sorted.length === 0 && <p style={{color:th.textDim,fontSize:13}}>No competitors yet.</p>}
      {sorted.map((c, i) => (
        <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:`1px solid ${th.border}`}}>
          <div style={{width:28,height:28,borderRadius:8,background:i===0?'rgba(239,68,68,0.15)':i===1?'rgba(245,158,11,0.15)':'rgba(16,185,129,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:i===0?th.red:i===1?th.amber:th.green,fontFamily:th.mono,flexShrink:0}}>
            {i + 1}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
            <div style={{fontSize:11,color:th.accent,fontFamily:th.mono}}>{c.website_url?.replace('https://','').replace('www.','')}</div>
          </div>
          <div style={{textAlign:'right',flexShrink:0}}>
            <div style={{fontSize:16,fontWeight:800,color:c.changeCount>3?th.red:c.changeCount>1?th.amber:th.green}}>{c.changeCount}</div>
            <div style={{fontSize:9,color:th.textDim,fontFamily:th.mono}}>CHANGES</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentTimeline({changes, reports}) {
  const items = [
    ...changes.slice(0, 8).map(c => ({type:'change',text:c.summary?.slice(0,80),comp:c.competitor_name,sig:c.significance,time:c.detected_at})),
    ...reports.slice(0, 4).map(r => ({type:'report',text:r.title?.slice(0,80),comp:r.competitor_name,threat:r.threat_level,time:r.created_at}))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

  const timeAgo = (t) => {
    if (!t) return '';
    const diff = Date.now() - new Date(t).getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return 'just now';
    if (hrs < 24) return hrs + 'h ago';
    return Math.floor(hrs / 24) + 'd ago';
  };

  return (
    <div style={card}>
      <h3 style={{fontSize:14,fontWeight:700,color:'#fff',margin:'0 0 14px'}}>Activity Timeline</h3>
      {items.length === 0 && <p style={{color:th.textDim,fontSize:13}}>No activity yet. Run a scan!</p>}
      {items.map((item, i) => (
        <div key={i} style={{display:'flex',gap:12,padding:'8px 0',borderBottom:i<items.length-1?`1px solid ${th.border}`:'none'}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:2,paddingTop:2}}>
            <div style={{width:8,height:8,borderRadius:'50%',background:item.type==='report'?th.cyan:item.sig>=0.8?th.red:item.sig>=0.5?th.amber:th.green,flexShrink:0}}/>
            {i < items.length - 1 && <div style={{width:1,flex:1,background:th.border}}/>}
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,color:'#cbd5e1',lineHeight:1.5}}>{item.text}</div>
            <div style={{display:'flex',gap:8,marginTop:3}}>
              <span style={{fontSize:10,color:th.accent,fontWeight:600}}>{item.comp}</span>
              <span style={{fontSize:10,color:th.textDim}}>{timeAgo(item.time)}</span>
              {item.type === 'report' && <span style={{fontSize:9,padding:'1px 6px',borderRadius:10,background:'rgba(6,182,212,0.15)',color:th.cyan,fontFamily:th.mono}}>AI BRIEF</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickInsights({competitors, changes, reports}) {
  const insights = [];
  if (changes.length > 0) {
    const mostActive = {};
    changes.forEach(c => { mostActive[c.competitor_name] = (mostActive[c.competitor_name] || 0) + 1; });
    const top = Object.entries(mostActive).sort((a, b) => b[1] - a[1])[0];
    if (top) insights.push({icon:'🔥',text:`${top[0]} is most active with ${top[1]} changes`,color:th.red});
  }
  const highThreats = changes.filter(c => c.significance >= 0.8);
  if (highThreats.length > 0) insights.push({icon:'⚠️',text:`${highThreats.length} high-priority changes need attention`,color:th.amber});
  if (reports.length > 0) insights.push({icon:'📊',text:`${reports.length} AI briefs available for review`,color:th.cyan});
  const pricingChanges = changes.filter(c => c.page_type === 'pricing');
  if (pricingChanges.length > 0) insights.push({icon:'💰',text:`${pricingChanges.length} pricing changes detected`,color:th.green});
  if (insights.length === 0) insights.push({icon:'🎯',text:'Run a scan to start getting competitive insights!',color:th.accent});

  return (
    <div style={card}>
      <h3 style={{fontSize:14,fontWeight:700,color:'#fff',margin:'0 0 14px'}}>Quick Insights</h3>
      {insights.map((ins, i) => (
        <div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'8px 0',borderBottom:i<insights.length-1?`1px solid ${th.border}`:'none'}}>
          <span style={{fontSize:18}}>{ins.icon}</span>
          <span style={{fontSize:12,color:ins.color,fontWeight:500}}>{ins.text}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard({competitors, changes, reports, onScan, scanning, onLoadDemo, demoLoading, isNewUser, loading, error, onRetry}) {

  /* ── Loading state: show skeleton dashboard ──────────────── */
  if (loading) {
    return <SkeletonDashboard />;
  }

  /* ── Error state: show error with retry ──────────────────── */
  if (error) {
    return (
      <ErrorCard
        title="Failed to load dashboard"
        message={typeof error === 'string' ? error : 'Could not connect to the server. Please check your connection and try again.'}
        onRetry={onRetry}
      />
    );
  }

  /* ── New user welcome state ──────────────────────────────── */
  if (isNewUser && competitors.length === 0) {
    return (
      <div>
        <div style={{textAlign:'center',padding:'40px 0 20px'}}>
          <div style={{fontSize:48,marginBottom:12}}>🎯</div>
          <h1 style={{fontSize:26,fontWeight:800,color:'#fff',margin:'0 0 8px'}}>Welcome to Competitor<span style={{color:th.accent}}>Radar</span></h1>
          <p style={{color:th.textMuted,fontSize:14,margin:0,maxWidth:500,marginLeft:'auto',marginRight:'auto'}}>AI-powered competitive intelligence.</p>
        </div>
        <div style={{maxWidth:700,margin:'30px auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:14,marginBottom:30}}>
            {[{s:'01',t:'Load Demo',d:'See it in action',i:'📊'},{s:'02',t:'Explore',d:'Browse changes',i:'🔍'},{s:'03',t:'Add Own',d:'Track competitors',i:'🚀'}].map((s,i) => (
              <div key={i} style={{...card,textAlign:'center',padding:20}}>
                <div style={{fontSize:10,fontWeight:700,color:th.accent,letterSpacing:2,fontFamily:th.mono,marginBottom:8}}>STEP {s.s}</div>
                <div style={{fontSize:24,marginBottom:8}}>{s.i}</div>
                <div style={{fontSize:14,fontWeight:700,color:'#fff',marginBottom:6}}>{s.t}</div>
                <div style={{fontSize:12,color:th.textMuted}}>{s.d}</div>
              </div>
            ))}
          </div>
          <div style={{...card,textAlign:'center',padding:30,borderColor:'rgba(99,102,241,0.2)',background:'rgba(99,102,241,0.03)'}}>
            <h3 style={{fontSize:18,fontWeight:700,color:'#fff',margin:'0 0 20px'}}>Ready?</h3>
            <button onClick={onLoadDemo} disabled={demoLoading} style={{
              display:'inline-flex',alignItems:'center',gap:8,
              padding:'14px 36px',borderRadius:10,border:'none',
              background:`linear-gradient(135deg, ${th.accent}, #4f46e5)`,color:'white',
              fontSize:15,fontWeight:600,fontFamily:th.font,cursor:'pointer',
              opacity:demoLoading?0.6:1
            }}>
              {demoLoading && <Spinner size={16} color="#fff" />}
              {demoLoading?'Loading Demo...':'🎯 Load Demo Data'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Main dashboard ──────────────────────────────────────── */
  const weekChanges = changes.filter(c => c.detected_at && (Date.now() - new Date(c.detected_at).getTime()) < 7*24*3600000);
  const dayBuckets = Array(7).fill(0);
  weekChanges.forEach(c => { const d = Math.floor((Date.now() - new Date(c.detected_at).getTime()) / 86400000); if (d < 7) dayBuckets[6 - d]++; });
  const avgSig = changes.length > 0 ? (changes.reduce((a,c) => a + (c.significance||0), 0) / changes.length) : 0;

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'#fff',margin:'0 0 4px'}}>Intelligence Dashboard</h1>
          <p style={{color:th.textMuted,fontSize:13,margin:0}}>Real-time competitive signals</p>
        </div>
        <button onClick={onScan} disabled={scanning} style={{
          display:'inline-flex',alignItems:'center',gap:8,
          padding:'12px 28px',borderRadius:10,border:'none',
          background:`linear-gradient(135deg, ${th.accent}, #4f46e5)`,color:'white',
          fontSize:14,fontWeight:600,fontFamily:th.font,cursor:'pointer',
          opacity:scanning?0.6:1
        }}>
          {scanning ? <><Spinner size={16} color="#fff" /> Scanning...</> : '🔍 Scan Now'}
        </button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:14,marginBottom:20}}>
        <StatCard label="COMPETITORS" value={competitors.length} icon="🎯" color={th.accent} sub="being tracked"/>
        <StatCard label="TOTAL CHANGES" value={changes.length} icon="◈" color={th.red} trend={weekChanges.length} sparkData={dayBuckets}/>
        <StatCard label="AI BRIEFS" value={reports.length} icon="◆" color={th.cyan} sub="generated"/>
        <StatCard label="AVG THREAT" value={Math.round(avgSig * 100) + '%'} icon="⚡" color={avgSig>=0.7?th.red:avgSig>=0.4?th.amber:th.green} sub="significance score"/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
        <ThreatMeter changes={changes}/>
        <QuickInsights competitors={competitors} changes={changes} reports={reports}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <RecentTimeline changes={changes} reports={reports}/>
        <CompetitorLeaderboard competitors={competitors} changes={changes}/>
      </div>
    </div>
  );
}
