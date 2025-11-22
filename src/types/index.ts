export interface Product {
  id: string;
  name: string;
  priceGros: number;
  priceDetail: number;
  stock: number;
  stockCritique: number;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  adresse?: string;
  telephone: string;
  credit: number;
  createdAt: string;
  updatedAt: string;
}

export interface VenteItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  modeVente: 'gros' | 'detail';
}

export interface Vente {
  id: string;
  clientId: string;
  clientName: string;
  items: VenteItem[];
  total: number;
  montantPaye: number;
  credit: number;
  date: string;
  printed: boolean;
}

export interface Retour {
  id: string;
  clientId: string;
  clientName: string;
  venteId: string;
  productId: string;
  productName: string;
  quantity: number;
  date: string;
}

export type ModeVente = 'gros' | 'detail';

