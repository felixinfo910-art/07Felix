// api.js - 统一 API 请求与数据交互层
export const Api = {
  async get(action, params = {}) {
    const query = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`api.php?${query}`);
    return await res.json();
  },

  async post(action, data = {}) {
    const res = await fetch(`api.php?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return await res.json();
  },

  async upload(action, formData) {
    const res = await fetch(`api.php?action=${encodeURIComponent(action)}`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  }
};
