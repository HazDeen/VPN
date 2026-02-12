import type { DeviceType } from '../types/device';  // 👈 import type!

const API_URL = 'https://vpnvpn-backend.onrender.com';

// Получаем initData из Telegram
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
  return import.meta.env.VITE_MOCK_INIT_DATA || '';
};

// Базовый fetch с авторизацией
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const initData = getInitData();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `tma ${initData}`,
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
  // Auth
  auth: {
    telegram: () => apiFetch('/auth/telegram', { method: 'POST' }),
    getMe: () => apiFetch('/auth/me'),
  },

  // User
  user: {
    getBalance: () => apiFetch('/user/balance'),
    getProfile: () => apiFetch('/user/profile'),
  },

  // Devices
  devices: {
    getAll: () => apiFetch('/devices'),
    add: (data: { name: string; customName?: string; type: DeviceType }) => 
      apiFetch('/devices', { 
        method: 'POST', 
        body: JSON.stringify(data) 
      }),
    replace: (id: number) => 
      apiFetch(`/devices/${id}/replace`, { method: 'POST' }),
    updateName: (id: number, customName: string) => 
      apiFetch(`/devices/${id}/name`, { 
        method: 'PUT', 
        body: JSON.stringify({ customName }) 
      }),
    delete: (id: number) => 
      apiFetch(`/devices/${id}`, { method: 'DELETE' }),
  },

  // Subscriptions
  subscriptions: {
    activate: (deviceId: number) => 
      apiFetch(`/subscriptions/activate/${deviceId}`, { method: 'POST' }),
    deactivate: (deviceId: number) => 
      apiFetch(`/subscriptions/deactivate/${deviceId}`, { method: 'POST' }),
  },

  // Transactions
  transactions: {
    getAll: () => apiFetch('/transactions'),
  },

  // Payments
  payments: {
    createInvoice: (amount: number) => 
      apiFetch('/payments/create-invoice', { 
        method: 'POST', 
        body: JSON.stringify({ amount }) 
      }),
  },
};