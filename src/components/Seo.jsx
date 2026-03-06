import React, { useState, useEffect } from 'react'

const theme = {bg:'#05050d',bgCard:'rgba(255,255,255,0.02)',border:'rgba(255,255,255,0.06)',text:'#e2e8f0',textMuted:'#64748b',textDim:'#475569',accent:'#6366f1',red:'#ef4444',amber:'#f59e0b',green:'#10b981',cyan:'#06b6d4',mono:"'IBM Plex Mono', monospace"}
const css = {card:{background:theme.bgCard,border:`1px solid ${theme.border}`,borderRadius:14,padding:20}}

function ScoreCircle({score,size=60}){const color=score>=80?theme.green:score>=60?theme.amber:theme.red;return(<div style={{width:size,height:size,borderRadius:'50%',border:`3px solid ${color}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><span style={{fontSize:size*0.35,fontWeight:800,color}}>{score}</span></div>)}

export default function SeoPage({competitors}){
  const[data,setData]=useState([])
  const[loading,setLoading]=useState(true)
  const[selected,setSelected]=useState(null)
  const[detail,setDetail]=useState(null)
  
  useEffect(()=>{
    const token=localStorage.getItem('radar_token')
    fetch('/api/seo/overview',{headers:{'Authorization':'Bearer '+token,'Content-Type':'application/json'}})
    .then(r=>r.json()).then(d=>{if(Array.isArray(d))setData(d);setLoading(false)}).catch(()=>setLoading(false))
  },[])
  
  const loadDetail=async(comp)=>{
    const cObj=competitors.find(c=>c.name===comp.competitor)
    if(!cObj)return
    setSelected(comp.competitor)
    const token=localStorage.getItem('radar_token')
    try{const r=await fetch('/api/seo/analyze/'+cObj.id,{headers:{'Authorization':'Bearer '+token}});const d=await r.json();setDetail(d)}catch(e){}
  }
  
  if(loading)return(<div style={{padding:40,textAlign:'center',color:theme.textMuted}}>Loading SEO data...</div>)
  
  if(detail&&selected){
    return(<div>
      <button onClick={()=>{setDetail(null);setSelected(null)}} style={{padding:'6px 16px',borderRadius:8,border:`1px solid ${theme.border}`,background:'transparent',color:theme.textMuted,fontSize:12,cursor:'pointer',marginBottom:20,fontFamily:"'Sora',sans-serif"}}>Back</button>
      <h1 style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:24}}>{selected} - SEO Analysis</h1>
      {(detail.seo_analysis||[]).map((page,i)=>(<div key={i} style={{...css.card,marginBottom:16}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div><div style={{fontSize:15,fontWeight:700,color:'#fff'}}>{page.page_type}</div><div style={{fontSize:11,color:theme.accent,fontFamily:theme.mono}}>{page.url}</div></div>
          <ScoreCircle score={page.overall_score} size={50}/>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:16}}>
          {[{l:'Title',s:page.title?.score,t:page.title?.tip},{l:'Meta',s:page.meta_description?.score,t:page.meta_description?.tip},{l:'Headings',s:page.headings?.score,t:page.headings?.tip},{l:'Content',s:page.content?.score,t:page.content?.tip}].map((m,j)=>{const c=m.s>=80?theme.green:m.s>=60?theme.amber:theme.red;return(<div key={j} style={{textAlign:'center',padding:10,borderRadius:8,background:`${c}08`,border:`1px solid ${c}20`}}><div style={{fontSize:20,fontWeight:800,color:c}}>{m.s}</div><div style={{fontSize:10,color:c,fontWeight:600}}>{m.l}</div><div style={{fontSize:9,color:theme.textDim,marginTop:2}}>{m.t}</div></div>)})}
        </div>
        {page.keywords&&page.keywords.length>0&&<div><div style={{fontSize:11,fontWeight:700,color:theme.textMuted,marginBottom:8,fontFamily:theme.mono}}>TOP KEYWORDS</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{page.keywords.map((k,j)=>(<span key={j} style={{padding:'3px 10px',borderRadius:20,fontSize:11,background:'rgba(99,102,241,0.08)',color:theme.accent,fontFamily:theme.mono}}>{k.word} ({k.count})</span>))}</div></div>}
      </div>))}
    </div>)
  }
  
  return(<div>
    <h1 style={{fontSize:22,fontWeight:800,color:'#fff',margin:'0 0 4px'}}>SEO Tracker</h1>
    <p style={{color:theme.textMuted,fontSize:13,marginBottom:24}}>SEO health scores across competitors</p>
    {data.length===0&&<div style={{...css.card,textAlign:'center',padding:40}}><p style={{color:theme.textMuted}}>No SEO data yet. Run a scan first to generate SEO analysis.</p></div>}
    <div style={{display:'grid',gap:12}}>
      {data.map((comp,i)=>(<div key={i} onClick={()=>loadDetail(comp)} style={{...css.card,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <ScoreCircle score={comp.overall_score}/>
          <div><div style={{fontSize:15,fontWeight:700,color:'#fff'}}>{comp.competitor}</div><div style={{fontSize:11,color:theme.accent,fontFamily:theme.mono}}>{comp.url?.replace('https://','')}</div><div style={{fontSize:11,color:theme.textDim,marginTop:4}}>{comp.word_count} words</div></div>
        </div>
        <div style={{display:'flex',gap:12}}>
          {[{l:'Title',s:comp.title_score},{l:'Meta',s:comp.meta_score},{l:'Headings',s:comp.heading_score},{l:'Content',s:comp.content_score}].map((m,j)=>{const c=m.s>=80?theme.green:m.s>=60?theme.amber:theme.red;return(<div key={j} style={{textAlign:'center'}}><div style={{fontSize:16,fontWeight:800,color:c}}>{m.s}</div><div style={{fontSize:9,color:theme.textDim}}>{m.l}</div></div>)})}
        </div>
      </div>))}
    </div>
  </div>)
}
