import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client, Product, Vente, Retour } from '../types';
import { storage } from '../utils/storage';
import './Retours.css';

interface RetoursProps {
  onLogout: () => void;
}

const Retours = ({ onLogout }: RetoursProps) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientVentes, setClientVentes] = useState<Vente[]>([]);
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      const clientVentesList = ventes.filter(v => v.clientId === selectedClient.id);
      setClientVentes(clientVentesList);
      setSelectedVente(null);
      setSelectedProduct('');
      setQuantity('');
    }
  }, [selectedClient, ventes]);

  const loadData = () => {
    setClients(storage.getClients());
    setProducts(storage.getProducts());
    setVentes(storage.getVentes());
  };

  const handleSubmit = () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }
    if (!selectedVente) {
      alert('Veuillez sélectionner une vente');
      return;
    }
    if (!selectedProduct) {
      alert('Veuillez sélectionner un produit');
      return;
    }
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      alert('Veuillez entrer une quantité valide');
      return;
    }

    const venteItem = selectedVente.items.find(item => item.productId === selectedProduct);
    if (!venteItem) {
      alert('Produit non trouvé dans cette vente');
      return;
    }
    if (qty > venteItem.quantity) {
      alert('La quantité retournée ne peut pas dépasser la quantité achetée');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    // Créer le retour
    const retour: Retour = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      clientName: `${selectedClient.prenom} ${selectedClient.nom}`,
      venteId: selectedVente.id,
      productId: selectedProduct,
      productName: product.name,
      quantity: qty,
      date: new Date().toISOString(),
    };

    const retours = storage.getRetours();
    retours.push(retour);
    storage.saveRetours(retours);

    // Ajuster le stock
    const updatedProducts = products.map(p => {
      if (p.id === selectedProduct) {
        return { ...p, stock: p.stock + qty };
      }
      return p;
    });
    storage.saveProducts(updatedProducts);

    // Ajuster le crédit du client
    const montantRetour = venteItem.price * qty;
    const updatedClients = clients.map(c => {
      if (c.id === selectedClient.id) {
        const newCredit = Math.max(0, c.credit - montantRetour);
        return { ...c, credit: newCredit };
      }
      return c;
    });
    storage.saveClients(updatedClients);

    // Réinitialiser
    setSelectedClient(null);
    setSelectedVente(null);
    setSelectedProduct('');
    setQuantity('');
    loadData();
    alert('Retour enregistré avec succès !');
  };

  const availableProducts = selectedVente
    ? selectedVente.items.map(item => {
        const product = products.find(p => p.id === item.productId);
        return product ? { ...item, productName: product.name } : null;
      }).filter(Boolean) as Array<Vente['items'][0] & { productName: string }>
    : [];

  return (
    <div className="retours-container">
      <div className="retours-header">
        <div>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Retour
          </button>
          <h1>↩️ Retours</h1>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Déconnexion
        </button>
      </div>

      <div className="retours-content">
        <div className="section-card">
          <h2>1. Sélectionner un client</h2>
          <select
            className="client-select"
            value={selectedClient?.id || ''}
            onChange={(e) => {
              const client = clients.find(c => c.id === e.target.value);
              setSelectedClient(client || null);
            }}
          >
            <option value="">-- Sélectionner un client --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.prenom} {client.nom}
              </option>
            ))}
          </select>
          {selectedClient && (
            <div className="client-info-card">
              <p><strong>Client:</strong> {selectedClient.prenom} {selectedClient.nom}</p>
              <p><strong>Crédit actuel:</strong> {selectedClient.credit.toFixed(2)} €</p>
            </div>
          )}
        </div>

        {selectedClient && clientVentes.length > 0 && (
          <div className="section-card">
            <h2>2. Sélectionner une vente</h2>
            <div className="ventes-list">
              {clientVentes.map(vente => (
                <div
                  key={vente.id}
                  className={`vente-card ${selectedVente?.id === vente.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedVente(vente);
                    setSelectedProduct('');
                    setQuantity('');
                  }}
                >
                  <div className="vente-card-header">
                    <strong>Vente #{vente.id}</strong>
                    <span>{new Date(vente.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="vente-card-info">
                    <p>Total: {vente.total.toFixed(2)} €</p>
                    <p>Produits: {vente.items.length}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedClient && clientVentes.length === 0 && (
          <div className="section-card">
            <p className="no-data">Ce client n'a effectué aucun achat</p>
          </div>
        )}

        {selectedVente && (
          <div className="section-card">
            <h2>3. Sélectionner un produit retourné</h2>
            <select
              className="product-select"
              value={selectedProduct}
              onChange={(e) => {
                setSelectedProduct(e.target.value);
                setQuantity('');
              }}
            >
              <option value="">-- Sélectionner un produit --</option>
              {availableProducts.map(item => (
                <option key={item.productId} value={item.productId}>
                  {item.productName} (Quantité achetée: {item.quantity})
                </option>
              ))}
            </select>
            {selectedProduct && (
              <div className="product-info-card">
                {(() => {
                  const item = availableProducts.find(i => i.productId === selectedProduct);
                  return item ? (
                    <>
                      <p><strong>Produit:</strong> {item.productName}</p>
                      <p><strong>Quantité achetée:</strong> {item.quantity}</p>
                      <p><strong>Prix unitaire:</strong> {item.price.toFixed(2)} €</p>
                    </>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}

        {selectedProduct && (
          <div className="section-card">
            <h2>4. Quantité retournée</h2>
            <div className="form-group">
              <label>Quantité</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                min="1"
                max={availableProducts.find(i => i.productId === selectedProduct)?.quantity || 0}
              />
            </div>
            {quantity && (() => {
              const item = availableProducts.find(i => i.productId === selectedProduct);
              const qty = parseInt(quantity);
              const montantRetour = item ? item.price * qty : 0;
              return (
                <div className="retour-summary">
                  <p>Montant du retour: <strong>{montantRetour.toFixed(2)} €</strong></p>
                  <p>Nouveau crédit client: <strong>{(selectedClient!.credit - montantRetour).toFixed(2)} €</strong></p>
                </div>
              );
            })()}
            <button
              className="submit-retour-button"
              onClick={handleSubmit}
              disabled={!quantity || parseInt(quantity) <= 0}
            >
              💾 Enregistrer le retour
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Retours;

