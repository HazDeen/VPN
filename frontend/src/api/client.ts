const API_URL = 'https://vpn-production-702c.up.railway.app';

const getUsername = (): string => {
  // Пробуем до 3 раз с интервалом
  for (let i = 0; i < 3; i++) {
    const user = localStorage.getItem('user');
    console.log(`🔍 getUsername attempt ${i + 1}:`, user);
    
    if (user) {
      try {
        const parsed = JSON.parse(user);
        if (parsed.username) {
          console.log('✅ Username found:', parsed.username);
          return parsed.username;
        }
      } catch (e) {
        console.error('❌ Failed to parse user:', e);
      }
    }
    // Ждём 100ms перед следующей попыткой
    if (i < 2) {
      const start = Date.now();
      while (Date.now() - start < 100) {}
    }
  }
  console.log('❌ No username after 3 attempts');
  return '';
};

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const username = getUsername();
  
  console.log(`📡 Fetching ${endpoint} with username:`, username);
  
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
    login: (username: string, password: string) => apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
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