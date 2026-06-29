(function () {
  class CredentialBackend {
    constructor(options = {}) {
      this.apiService = options.apiService || new window.ApiService();
      this.currentUser = null;
    }

    async init() {
      try {
        const users = await this.apiService.getUsers();
        this.currentUser = null;
        return users;
      } catch (error) {
        console.warn('Unable to load users from API:', error);
        return {};
      }
    }

    getCurrentUser() {
      return this.currentUser;
    }

    setCurrentUser(userId) {
      this.currentUser = userId;
    }

    clearCurrentUser() {
      this.currentUser = null;
    }

    async signIn(userId, password) {
      try {
        const result = await this.apiService.signIn(userId, password);
        this.setCurrentUser(result.userId);
        return result;
      } catch (error) {
        return { ok: false, message: error.message };
      }
    }

    async signUp(userId, password) {
      try {
        const result = await this.apiService.signUp(userId, password);
        this.setCurrentUser(result.userId);
        return result;
      } catch (error) {
        return { ok: false, message: error.message };
      }
    }

    async updatePassword(userId, newPassword) {
      try {
        return await this.apiService.updatePassword(userId, newPassword);
      } catch (error) {
        return { ok: false, message: error.message };
      }
    }

    async deleteAccount(userId) {
      try {
        const result = await this.apiService.deleteAccount(userId);
        this.clearCurrentUser();
        return result;
      } catch (error) {
        return { ok: false, message: error.message };
      }
    }

    async logout() {
      try {
        const result = await this.apiService.logout();
        this.clearCurrentUser();
        return result;
      } catch (error) {
        return { ok: false, message: error.message };
      }
    }
  }

  window.CredentialBackend = CredentialBackend;
})();
