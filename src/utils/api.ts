import { Product, Client, Vente, Retour, VenteItem } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Log de l'URL de l'API au démarrage (seulement en développement)
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_BASE_URL);
}

// Gestion du token
export const auth = {
  getToken: (): string | null => {
    return localStorage.getItem('app_gestion_token');
  },
  setToken: (token: string) => {
    localStorage.setItem('app_gestion_token', token);
  },
  removeToken: () => {
    localStorage.removeItem('app_gestion_token');
  },
  getUser: () => {
    const user = localStorage.getItem('app_gestion_user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any) => {
    localStorage.setItem('app_gestion_user', JSON.stringify(user));
  },
  removeUser: () => {
    localStorage.removeItem('app_gestion_user');
  },
};

// Fonction helper pour les requêtes
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = auth.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    console.log(`📡 Requête API: ${options.method || 'GET'} ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    console.log(`📥 Réponse API: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
      console.error(`❌ API Error [${response.status}]:`, error);
      throw new Error(error.error || `Erreur ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('❌ Erreur de requête:', error);
    
    if (error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('Load failed') ||
        error.name === 'TypeError') {
      const errorMsg = `Impossible de se connecter au serveur backend.\n\nVérifiez que:\n1. Le backend est démarré sur ${API_BASE_URL}\n2. Le serveur est accessible\n3. Il n'y a pas de problème de réseau`;
      console.error('🔴 Erreur de connexion:', errorMsg);
      throw new Error(errorMsg);
    }
    throw error;
  }
}

// API Auth
export const api = {
  // Authentification
  login: async (username: string, password: string) => {
    const data = await request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    auth.setToken(data.token);
    auth.setUser(data.user);
    return data;
  },

  logout: () => {
    auth.removeToken();
    auth.removeUser();
  },

  getMe: async () => {
    return request<{ user: any }>('/auth/me');
  },

  // Produits
  getProducts: async (): Promise<Product[]> => {
    const data = await request<{ products: Product[] }>('/products');
    return data.products;
  },

  getProduct: async (id: string): Promise<Product> => {
    const data = await request<{ product: Product }>(`/products/${id}`);
    return data.product;
  },

  createProduct: async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const data = await request<{ product: Product }>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
    return data.product;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const data = await request<{ product: Product }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
    return data.product;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await request(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Clients
  getClients: async (): Promise<Client[]> => {
    const data = await request<{ clients: Client[] }>('/clients');
    return data.clients;
  },

  getClient: async (id: string): Promise<Client> => {
    const data = await request<{ client: Client }>(`/clients/${id}`);
    return data.client;
  },

  createClient: async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const data = await request<{ client: Client }>('/clients', {
      method: 'POST',
      body: JSON.stringify(client),
    });
    return data.client;
  },

  updateClient: async (id: string, client: Partial<Client>): Promise<Client> => {
    const data = await request<{ client: Client }>(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client),
    });
    return data.client;
  },

  deleteClient: async (id: string): Promise<void> => {
    await request(`/clients/${id}`, {
      method: 'DELETE',
    });
  },

  // Ventes
  getVentes: async (): Promise<Vente[]> => {
    const data = await request<{ ventes: Vente[] }>('/ventes');
    return data.ventes;
  },

  getVente: async (id: string): Promise<Vente> => {
    const data = await request<{ vente: Vente }>(`/ventes/${id}`);
    return data.vente;
  },

  createVente: async (vente: {
    clientId: string;
    items: VenteItem[];
    total: number;
    montantPaye: number;
    credit: number;
  }): Promise<Vente> => {
    const data = await request<{ vente: Vente }>('/ventes', {
      method: 'POST',
      body: JSON.stringify(vente),
    });
    return data.vente;
  },

  markVentePrinted: async (id: string): Promise<void> => {
    await request(`/ventes/${id}/print`, {
      method: 'PATCH',
    });
  },

  // Retours
  getRetours: async (): Promise<Retour[]> => {
    const data = await request<{ retours: Retour[] }>('/retours');
    return data.retours;
  },

  getRetour: async (id: string): Promise<Retour> => {
    const data = await request<{ retour: Retour }>(`/retours/${id}`);
    return data.retour;
  },

  createRetour: async (retour: {
    clientId: string;
    venteId: string;
    productId: string;
    productName: string;
    quantity: number;
  }): Promise<Retour> => {
    const data = await request<{ retour: Retour }>('/retours', {
      method: 'POST',
      body: JSON.stringify(retour),
    });
    return data.retour;
  },

  deleteRetour: async (id: string): Promise<void> => {
    await request(`/retours/${id}`, {
      method: 'DELETE',
    });
  },
};

