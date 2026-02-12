const API_URL = 'https://vpn-production-702c.up.railway.app';

const getInitData = (): string => {
  try {
    // ✅ Telegram Web App (мобильное приложение)
    // @ts-ignore
    if (window.Telegram?.WebApp?.initData) {
      // @ts-ignore
      return window.Telegram.WebApp.initData;
    }
    
    // ✅ Telegram Web (web.telegram.org)
    // @ts-ignore
    if (window.Telegram?.WebView?.initParams?.tgWebAppData) {
      // @ts-ignore
      return window.Telegram.WebView.initParams.tgWebAppData;
    }
    
    // ✅ URL параметры (для теста)
    const urlParams = new URLSearchParams(window.location.search);
    const tgWebAppData = urlParams.get('tgWebAppData');
    if (tgWebAppData) {
      return tgWebAppData;
    }
    
  } catch (e) {
    console.warn('Error getting initData:', e);
  }
  
  console.warn('⚠️ No initData found - using mock for development');
  // ✅ ДЛЯ ЛОКАЛЬНОЙ РАЗРАБОТКИ
  if (window.location.hostname === 'localhost') {
    return "query_id=AAH5VE4M...&user=%7B%22id%22%3A1314191617%7D";
  }
  
  return '';
};

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

// ✅ ЭКСПОРТИРУЕМ api!
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
    add: (data: any) => apiFetch('/devices', { method: 'POST', body: JSON.stringify(data) }),
    replace: (id: number) => apiFetch(`/devices/${id}/replace`, { method: 'POST' }),
    updateName: (id: number, customName: string) => 
      apiFetch(`/devices/${id}/name`, { method: 'PUT', body: JSON.stringify({ customName }) }),
    delete: (id: number) => apiFetch(`/devices/${id}`, { method: 'DELETE' }),
  },
  subscriptions: {
    activate: (deviceId: number) => apiFetch(`/subscriptions/activate/${deviceId}`, { method: 'POST' }),
    deactivate: (deviceId: number) => apiFetch(`/subscriptions/deactivate/${deviceId}`, { method: 'POST' }),
  },
  transactions: {
    getAll: () => apiFetch('/transactions'),
  },
  payments: {
    testPayment: (amount: number) => 
      apiFetch('/payments/test-payment', { 
        method: 'POST', 
        body: JSON.stringify({ amount }) 
      }),
    createInvoice: (amount: number) => 
      apiFetch('/payments/create-invoice', { 
        method: 'POST', 
        body: JSON.stringify({ amount }) 
      }),
  },
};