const API_BASE = '';

class ApiClient {
  constructor() {
    this.base = API_BASE;
    this.token = localStorage.getItem('radar_token') || null;
  }
  setToken(token) {
    this.token = token;
    if (token) localStorage.setItem('radar_token', token);
    else localStorage.removeItem('radar_token');
  }
  getToken() { return this.token || localStorage.getItem('radar_token'); }
  isLoggedIn() { return !!this.getToken(); }
  logout() { this.token = null; localStorage.removeItem('radar_token'); localStorage.removeItem('radar_user'); }
  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res = await fetch(`${this.base}${path}`, opts);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { throw new Error(`Invalid response: ${text.slice(0, 100)}`); }
      if (!res.ok) { const msg = typeof data.detail === 'string' ? data.detail : (data.message || JSON.stringify(data.detail) || `Error ${res.status}`); throw new Error(msg); }
      return data;
    } catch (err) {
      if (err.message === 'Failed to fetch') throw new Error('Cannot connect to server.');
      throw err;
    }
  }
  async signup(email, password, name) { const d = await this.request('POST', '/api/auth/signup', { email, password, name }); this.setToken(d.access_token); localStorage.setItem('radar_user', JSON.stringify(d.user)); return d; }
  async login(email, password) { const d = await this.request('POST', '/api/auth/login', { email, password }); this.setToken(d.access_token); localStorage.setItem('radar_user', JSON.stringify(d.user)); return d; }
  async getMe() { return this.request('GET', '/api/auth/me'); }
  async getCompetitors() { return this.request('GET', '/api/competitors/'); }
  async addCompetitor(data) { return this.request('POST', '/api/competitors/', data); }
  async deleteCompetitor(id) { return this.request('DELETE', `/api/competitors/${id}`); }
  async scanAll() { return this.request('POST', '/api/scan/all'); }
  async scanOne(id) { return this.request('POST', `/api/scan/${id}`); }
  async getChanges(limit = 30, cid = null, minSig = 0) { let u = `/api/changes/?limit=${limit}&min_significance=${minSig}`; if (cid) u += `&competitor_id=${cid}`; return this.request('GET', u); }
  async getReports(limit = 20, cid = null) { let u = `/api/reports/?limit=${limit}`; if (cid) u += `&competitor_id=${cid}`; return this.request('GET', u); }
  async getReport(id) { return this.request('GET', `/api/reports/${id}`); }
  async loadDemo() { return this.request('POST', '/api/demo/setup'); }
  async getPlans() { return this.request('GET', '/api/payments/plans'); }
  async createCheckout(plan) { return this.request('POST', '/api/payments/create-checkout', { plan }); }
  async getPaymentStatus() { return this.request('GET', '/api/payments/status'); }
}

export const api = new ApiClient();
export default api;
