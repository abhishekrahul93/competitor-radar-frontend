const API_BASE = '';

class ApiClient {
  constructor() {
    this.base = API_BASE;
    this.token = localStorage.getItem('radar_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('radar_token', token);
    } else {
      localStorage.removeItem('radar_token');
    }
  }

  getToken() {
    return this.token || localStorage.getItem('radar_token');
  }

  isLoggedIn() {
    return !!this.getToken();
  }

  logout() {
    this.token = null;
    localStorage.removeItem('radar_token');
    localStorage.removeItem('radar_user');
  }

  async request(method, path, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const opts = { method, headers };
    if (body) opts.body = JSON.stringify(body);

    try {
      const res = await fetch(`${this.base}${path}`, opts);
      const data = await res.json();

      if (!res.ok) {
        const msg = typeof data.detail === 'string' ? data.detail : (data.message || JSON.stringify(data.detail) || `Request failed: ${res.status}`);
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Is the backend running?');
      }
      throw err;
    }
  }

  async signup(email, password, name) {
    const data = await this.request('POST', '/api/auth/signup', { email, password, name });
    this.setToken(data.access_token);
    localStorage.setItem('radar_user', JSON.stringify(data.user));
    return data;
  }

  async login(email, password) {
    const data = await this.request('POST', '/api/auth/login', { email, password });
    this.setToken(data.access_token);
    localStorage.setItem('radar_user', JSON.stringify(data.user));
    return data;
  }

  async getMe() {
    return this.request('GET', '/api/auth/me');
  }

  async getCompetitors() {
    return this.request('GET', '/api/competitors/');
  }

  async addCompetitor(data) {
    return this.request('POST', '/api/competitors/', data);
  }

  async deleteCompetitor(id) {
    return this.request('DELETE', `/api/competitors/${id}`);
  }

  async scanAll() {
    return this.request('POST', '/api/scan/all');
  }

  async scanOne(competitorId) {
    return this.request('POST', `/api/scan/${competitorId}`);
  }

  async getChanges(limit = 30, competitorId = null, minSig = 0) {
    let url = `/api/changes/?limit=${limit}&min_significance=${minSig}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return this.request('GET', url);
  }

  async getReports(limit = 20, competitorId = null) {
    let url = `/api/reports/?limit=${limit}`;
    if (competitorId) url += `&competitor_id=${competitorId}`;
    return this.request('GET', url);
  }

  async getReport(id) {
    return this.request('GET', `/api/reports/${id}`);
  }

  async loadDemo() {
    return this.request('POST', '/api/demo/setup');
  }
}

export const api = new ApiClient();
export default api;