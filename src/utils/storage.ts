import { Product, Client, Vente, Retour } from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'app_gestion_products',
  CLIENTS: 'app_gestion_clients',
  VENTES: 'app_gestion_ventes',
  RETOURS: 'app_gestion_retours',
  PIN: 'app_gestion_pin',
};

export const storage = {
  // Products
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  saveProducts: (products: Product[]) => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  
  // Clients
  getClients: (): Client[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
  },
  saveClients: (clients: Client[]) => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  },
  
  // Ventes
  getVentes: (): Vente[] => {
    const data = localStorage.getItem(STORAGE_KEYS.VENTES);
    return data ? JSON.parse(data) : [];
  },
  saveVentes: (ventes: Vente[]) => {
    localStorage.setItem(STORAGE_KEYS.VENTES, JSON.stringify(ventes));
  },
  
  // Retours
  getRetours: (): Retour[] => {
    const data = localStorage.getItem(STORAGE_KEYS.RETOURS);
    return data ? JSON.parse(data) : [];
  },
  saveRetours: (retours: Retour[]) => {
    localStorage.setItem(STORAGE_KEYS.RETOURS, JSON.stringify(retours));
  },
  
  // PIN
  getPIN: (): string => {
    return localStorage.getItem(STORAGE_KEYS.PIN) || '0000';
  },
  setPIN: (pin: string) => {
    localStorage.setItem(STORAGE_KEYS.PIN, pin);
  },
};

