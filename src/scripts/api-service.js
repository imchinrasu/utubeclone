(function () {
  class ApiService {
    constructor(baseUrl = '/api') {
      this.baseUrl = baseUrl;
    }

    async request(path, options = {}) {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || 'Request failed');
      }

      return payload;
    }

    async getUsers() {
      return this.request('/users');
    }

    async signIn(userId, password) {
      return this.request('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ userId, password })
      });
    }

    async signUp(userId, password) {
      return this.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ userId, password })
      });
    }

    async updatePassword(userId, password) {
      return this.request(`/users/${encodeURIComponent(userId)}/password`, {
        method: 'PUT',
        body: JSON.stringify({ password })
      });
    }

    async deleteAccount(userId) {
      return this.request(`/users/${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
    }

    async logout() {
      return this.request('/auth/logout', {
        method: 'POST'
      });
    }
  }

  window.ApiService = ApiService;
})();
