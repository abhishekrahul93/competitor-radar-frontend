import { useState, useEffect, useRef } from 'react';

export default function Chat({ api }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [competitors, setCompetitors] = useState([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSuggestions();
    loadCompetitors();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSuggestions = async () => {
    try {
      const token = localStorage.getItem('radar_token');
      const resp = await fetch('/api/chat/suggestions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (e) {
      console.error('Failed to load suggestions:', e);
    }
  };

  const loadCompetitors = async () => {
    try {
      const token = localStorage.getItem('radar_token');
      const resp = await fetch('/api/competitors/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setCompetitors(data);
      }
    } catch (e) {
      console.error('Failed to load competitors:', e);
    }
  };

  const sendMessage = async (text) => {
    const question = text || input.trim();
    if (!question || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setInput('');
    setLoading(true);
    try {
      const token = localStorage.getItem('radar_token');
      const body = { message: question };
      if (selectedCompetitor) body.competitor_id = selectedCompetitor;
      const resp = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (resp.ok) {
        const data = await resp.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply, sources: data.sources_used }]);
      } else {
        const err = await resp.json();
        setMessages(prev => [...prev, { role: 'assistant', content: 'Error: ' + (err.error || 'Unknown error'), isError: true }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Could not connect to server.', isError: true }]);
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatMsg = (content) => {
    return content.split('\n').map((line) => {
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('- ') || line.startsWith('* ')) return '<div style="padding-left:16px;margin:2px 0">' + line + '</div>';
      if (line.startsWith('### ')) return '<div style="font-weight:bold;margin-top:12px;color:#a78bfa">' + line.slice(4) + '</div>';
      if (line.startsWith('## ')) return '<div style="font-weight:bold;font-size:1.05em;margin-top:14px;color:#a78bfa">' + line.slice(3) + '</div>';
      if (line.trim() === '') return '<br/>';
      return '<div>' + line + '</div>';
    }).join('');
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>AI Chat Assistant</h1>
        <p style={{ color: '#9ca3af', fontSize: '15px' }}>Ask anything about your competitors — powered by your collected intelligence data</p>
      </div>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ color: '#9ca3af', fontSize: '14px' }}>Context:</span>
        <button onClick={() => setSelectedCompetitor(null)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', cursor: 'pointer', background: !selectedCompetitor ? '#7c3aed' : '#1e1e2e', color: !selectedCompetitor ? '#fff' : '#9ca3af' }}>All Competitors</button>
        {competitors.map(c => (
          <button key={c.id} onClick={() => setSelectedCompetitor(c.id)} style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', fontSize: '13px', cursor: 'pointer', background: selectedCompetitor === c.id ? '#7c3aed' : '#1e1e2e', color: selectedCompetitor === c.id ? '#fff' : '#9ca3af' }}>{c.name}</button>
        ))}
      </div>
      <div style={{ background: '#0f0f1a', borderRadius: '16px', border: '1px solid #1e1e2e', height: '500px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', paddingTop: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#129302;</div>
              <h3 style={{ color: '#fff', marginBottom: '8px', fontSize: '18px' }}>CompetitorRadar AI</h3>
              <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>Ask me about your competitors, market trends, or strategic recommendations</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '600px', margin: '0 auto' }}>
                {suggestions.map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)} style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #2d2d44', background: '#1a1a2e', color: '#c4b5fd', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}>{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '16px' }}>
              <div style={{ maxWidth: '80%', padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? '#7c3aed' : msg.isError ? '#7f1d1d' : '#1a1a2e', color: '#fff', fontSize: '14px', lineHeight: '1.6', border: msg.role === 'user' ? 'none' : '1px solid #2d2d44' }}>
                {msg.role === 'assistant' ? (
                  <div>
                    <div dangerouslySetInnerHTML={{ __html: formatMsg(msg.content) }} />
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #2d2d44', fontSize: '11px', color: '#6b7280' }}>Sources: {msg.sources.join(', ')}</div>
                    )}
                  </div>
                ) : msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
              <div style={{ padding: '12px 20px', borderRadius: '16px 16px 16px 4px', background: '#1a1a2e', border: '1px solid #2d2d44', color: '#9ca3af', fontSize: '14px' }}>Analyzing your data ...</div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e1e2e', background: '#0a0a14' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about your competitors..." rows={1} style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #2d2d44', background: '#1a1a2e', color: '#fff', fontSize: '14px', resize: 'none', outline: 'none', fontFamily: 'inherit', minHeight: '44px', maxHeight: '120px' }} />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading} style={{ padding: '12px 20px', borderRadius: '12px', border: 'none', background: input.trim() && !loading ? '#7c3aed' : '#2d2d44', color: input.trim() && !loading ? '#fff' : '#6b7280', fontSize: '14px', fontWeight: 'bold', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', minWidth: '80px' }}>{loading ? '...' : 'Send'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}