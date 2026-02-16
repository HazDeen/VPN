const API_URL = 'https://vpn-production-702c.up.railway.app';

const getUsername = (): string => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsed = JSON.parse(user);
      return parsed.username || '';
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }
  return '';
};

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const username = getUsername();
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Username': username,
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
    loginByUsername: (username: string) => apiFetch('/auth/login-by-username', {
      method: 'POST',
      body: JSON.stringify({ username })
    }),
  },
  user: {
    getBalance: () => apiFetch('/user/balance'),
    getProfile: () => apiFetch('/user/profile'),
    topUp: (amount: number) => apiFetch('/user/topup', { 
      method: 'POST', 
      body: JSON.stringify({ amount }) 
    }),
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
  admin: {
    getAllUsers: () => apiFetch('/admin/users'),
    getUserDevices: (userId: number) => apiFetch(`/admin/users/${userId}/devices`),
    updateUserBalance: (userId: number, balance: number) => apiFetch(`/admin/users/${userId}/balance`, {
      method: 'PUT',
      body: JSON.stringify({ balance })
    }),
    setAdminStatus: (userId: number, isAdmin: boolean) => apiFetch(`/admin/users/${userId}/admin`, {
      method: 'PUT',
      body: JSON.stringify({ isAdmin })
    }),
  },
};