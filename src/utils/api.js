const API_BASE = '';
class ApiClient {
  constructor() { this.base = API_BASE; this.token = localStorage.getItem('radar_token') || null; }
  setToken(t) { this.token = t; if (t) localStorage.setItem('radar_token', t); else localStorage.removeItem('radar_token'); }
  getToken() { return this.token || localStorage.getItem('radar_token'); }
  isLoggedIn() { return !!this.getToken(); }
  logout() { this.token = null; localStorage.removeItem('radar_token'); localStorage.removeItem('radar_user'); }
  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' }; const token = this.getToken(); if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers }; if (body) opts.body = JSON.stringify(body);
    try { const res = await fetch(`${this.base}${path}`, opts); const text = await res.text(); let data; try { data = JSON.parse(text); } catch { throw new Error(`Invalid response: ${text.slice(0, 100)}`); }
      if (!res.ok) { const msg = typeof data.detail === 'string' ? data.detail : (data.message || JSON.stringify(data.detail) || `Error ${res.status}`); throw new Error(msg); } return data;
    } catch (err) { if (err.message === 'Failed to fetch') throw new Error('Cannot connect.'); throw err; }
  }
  async signup(e, p, n) { const d = await this.request('POST', '/api/auth/signup', { email:e, password:p, name:n }); this.setToken(d.access_token); localStorage.setItem('radar_user', JSON.stringify(d.user)); return d; }
  async login(e, p) { const d = await this.request('POST', '/api/auth/login', { email:e, password:p }); this.setToken(d.access_token); localStorage.setItem('radar_user', JSON.stringify(d.user)); return d; }
  async getMe() { return this.request('GET', '/api/auth/me'); }
  async getCompetitors() { return this.request('GET', '/api/competitors/'); }
  async addCompetitor(data) { return this.request('POST', '/api/competitors/', data); }
  async deleteCompetitor(id) { return this.request('DELETE', `/api/competitors/${id}`); }
  async scanAll() { return this.request('POST', '/api/scan/all'); }
  async scanOne(id) { return this.request('POST', `/api/scan/${id}`); }
  async getChanges(l=30,c=null,m=0) { let u=`/api/changes/?limit=${l}&min_significance=${m}`; if(c) u+=`&competitor_id=${c}`; return this.request('GET',u); }
  async getReports(l=20,c=null) { let u=`/api/reports/?limit=${l}`; if(c) u+=`&competitor_id=${c}`; return this.request('GET',u); }
  async getReport(id) { return this.request('GET', `/api/reports/${id}`); }
  async loadDemo() { return this.request('POST', '/api/demo/setup'); }
  async getPlans() { return this.request('GET', '/api/payments/plans'); }
  async createCheckout(plan) { return this.request('POST', '/api/payments/create-checkout', { plan }); }
  async getPaymentStatus() { return this.request('GET', '/api/payments/status'); }
  async setSlackWebhook(url) { return this.request('POST', '/api/auth/slack-webhook', { webhook_url: url }); }
  exportBriefUrl(id) { return `/api/export/brief/${id}?token=${this.getToken()}`; }
  exportAllUrl() { return `/api/export/all?token=${this.getToken()}`; }
  async getSocialSummary() { return this.request('GET', '/api/social/summary'); }
  async getCompetitorPosts(id, platform=null) { let u=`/api/social/posts/${id}`; if(platform) u+=`?platform=${platform}`; return this.request('GET',u); }
  async scanSocial(id) { return this.request('POST', `/api/social/scan/${id}`); }
  async scanAllSocial() { return this.request('POST', '/api/social/scan-all'); }
  async getSocialSettings(id) { return this.request('GET', `/api/social/settings/${id}`); }
  async updateSocialSettings(id, data) { return this.request('PUT', `/api/social/settings/${id}`, data); }
}
export const api = new ApiClient();
export default api;
