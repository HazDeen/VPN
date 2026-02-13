const API_URL = 'https://vpn-production-702c.up.railway.app';

const getInitData = (): string => {
  try {
    // @ts-ignore
    if (window.Telegram?.WebApp?.initData) {
      // @ts-ignore
      return window.Telegram.WebApp.initData;
    }
  } catch (e) {
    console.warn('Not in Telegram environment');
  }
  
  return '';
};

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const initData = getInitData();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(initData && { 'Authorization': `tma ${initData}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'API Error',
        error: data.error
      };
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export const api = {
  auth: {
    telegram: () => apiFetch('/auth/telegram', { method: 'POST' }),
    getMe: () => apiFetch('/auth/me'),
  },
  user: {
    getBalance: () => apiFetch('/user/balance'),
    getProfile: () => apiFetch('/user/profile'),
  },
  devices: {
    getAll: () => apiFetch('/devices'),
    add: (data: any) => apiFetch('/devices', { 
      method: 'POST', 
      body: JSON.stringify(data) 
    }),
    delete: (id: number) => apiFetch(`/devices/${id}`, { 
      method: 'DELETE' 
    }),
  },
  transactions: {
    getAll: () => apiFetch('/transactions'),
  },
};