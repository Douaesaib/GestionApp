import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, Client, Vente, VenteItem, ModeVente } from '../types';
import { storage } from '../utils/storage';
import './Ventes.css';

interface VentesProps {
  onLogout: () => void;
}

const Ventes = ({ onLogout }: VentesProps) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [modeVente, setModeVente] = useState<ModeVente>('detail');
  const [venteItems, setVenteItems] = useState<VenteItem[]>([]);
  const [montantPaye, setMontantPaye] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setClients(storage.getClients());
    setProducts(storage.getProducts());
  };

  const addProductToVente = (product: Product) => {
    const existingItem = venteItems.find(item => item.productId === product.id && item.modeVente === modeVente);
    
    if (existingItem) {
      setVenteItems(venteItems.map(item =>
        item.productId === product.id && item.modeVente === modeVente
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const price = modeVente === 'gros' ? product.priceGros : product.priceDetail;
      setVenteItems([...venteItems, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price,
        modeVente,
      }]);
    }
  };

  const updateQuantity = (productId: string, modeVente: ModeVente, quantity: number) => {
    if (quantity <= 0) {
      setVenteItems(venteItems.filter(item => !(item.productId === productId && item.modeVente === modeVente)));
    } else {
      setVenteItems(venteItems.map(item =>
        item.productId === productId && item.modeVente === modeVente
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const removeItem = (productId: string, modeVente: ModeVente) => {
    setVenteItems(venteItems.filter(item => !(item.productId === productId && item.modeVente === modeVente)));
  };

  const total = venteItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const montantPayeNum = parseFloat(montantPaye) || 0;
  const credit = Math.max(0, total - montantPayeNum);

  const handleSubmit = () => {
    if (!selectedClient) {
      alert('Veuillez sélectionner un client');
      return;
    }
    if (venteItems.length === 0) {
      alert('Veuillez ajouter au moins un produit');
      return;
    }

    // Vérifier le stock
    for (const item of venteItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        alert(`Stock insuffisant pour ${item.productName}`);
        return;
      }
    }

    // Créer la vente
    const vente: Vente = {
      id: Date.now().toString(),
      clientId: selectedClient.id,
      clientName: `${selectedClient.prenom} ${selectedClient.nom}`,
      items: venteItems,
      total,
      montantPaye: montantPayeNum,
      credit,
      date: new Date().toISOString(),
      printed: false,
    };

    // Mettre à jour le stock
    const updatedProducts = products.map(product => {
      const item = venteItems.find(i => i.productId === product.id);
      if (item) {
        return { ...product, stock: product.stock - item.quantity };
      }
      return product;
    });
    storage.saveProducts(updatedProducts);

    // Mettre à jour le crédit du client
    const updatedClients = clients.map(client => {
      if (client.id === selectedClient.id) {
        return { ...client, credit: client.credit + credit };
      }
      return client;
    });
    storage.saveClients(updatedClients);

    // Sauvegarder la vente
    const ventes = storage.getVentes();
    ventes.push(vente);
    storage.saveVentes(ventes);

    // Imprimer la facture
    printFacture(vente);

    // Réinitialiser
    setSelectedClient(null);
    setVenteItems([]);
    setMontantPaye('');
    loadData();
    alert('Vente enregistrée avec succès !');
  };

  const printFacture = (vente: Vente) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const client = clients.find(c => c.id === vente.clientId);
    const factureHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${vente.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #667eea; }
            .header { margin-bottom: 30px; }
            .client-info { margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #667eea; color: white; }
            .total { font-size: 1.2em; font-weight: bold; margin-top: 20px; }
            .credit { color: #e74c3c; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURE #${vente.id}</h1>
            <p>Date: ${new Date(vente.date).toLocaleDateString('fr-FR')}</p>
          </div>
          <div class="client-info">
            <h3>Client: ${vente.clientName}</h3>
            ${client?.telephone ? `<p>Téléphone: ${client.telephone}</p>` : ''}
            ${client?.adresse ? `<p>Adresse: ${client.adresse}</p>` : ''}
          </div>
          <table>
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${vente.items.map(item => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${item.price.toFixed(2)} €</td>
                  <td>${(item.price * item.quantity).toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total: ${vente.total.toFixed(2)} €</p>
            <p>Montant payé: ${vente.montantPaye.toFixed(2)} €</p>
            ${vente.credit > 0 ? `<p class="credit">Crédit restant: ${vente.credit.toFixed(2)} €</p>` : ''}
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(factureHTML);
    printWindow.document.close();
    printWindow.print();
  };

  const availableProducts = products.filter(p => p.stock > 0);

  return (
    <div className="ventes-container">
      <div className="ventes-header">
        <div>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Retour
          </button>
          <h1>🛒 Vente / Facture</h1>
        </div>
        <button className="logout-button" onClick={onLogout}>
          Déconnexion
        </button>
      </div>

      <div className="ventes-content">
        <div className="ventes-left">
          <div className="section-card">
            <h2>1. Choisir un client</h2>
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
                  {client.prenom} {client.nom} {client.credit > 0 && `(Crédit: ${client.credit.toFixed(2)} €)`}
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

          <div className="section-card">
            <h2>2. Mode de vente</h2>
            <select
              value={modeVente}
              onChange={(e) => setModeVente(e.target.value as ModeVente)}
              className="mode-select"
            >
              <option value="detail">Détail</option>
              <option value="gros">Gros</option>
            </select>
          </div>

          <div className="section-card">
            <h2>3. Choisir des produits</h2>
            <div className="products-list">
              {availableProducts.length === 0 ? (
                <p className="no-products">Aucun produit en stock</p>
              ) : (
                availableProducts.map(product => {
                  const price = modeVente === 'gros' ? product.priceGros : product.priceDetail;
                  const isLowStock = product.stock <= product.stockCritique;
                  return (
                    <div key={product.id} className={`product-item ${isLowStock ? 'low-stock' : ''}`}>
                      <div className="product-info">
                        <strong>{product.name}</strong>
                        <span>Stock: {product.stock}</span>
                        <span>Prix: {price.toFixed(2)} €</span>
                      </div>
                      <button
                        className="add-product-button"
                        onClick={() => addProductToVente(product)}
                        disabled={product.stock === 0}
                      >
                        + Ajouter
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="ventes-right">
          <div className="section-card">
            <h2>Panier</h2>
            {venteItems.length === 0 ? (
              <p className="empty-cart">Le panier est vide</p>
            ) : (
              <>
                <div className="cart-items">
                  {venteItems.map((item) => (
                    <div key={`${item.productId}-${item.modeVente}`} className="cart-item">
                      <div className="cart-item-info">
                        <strong>{item.productName}</strong>
                        <span>{item.modeVente === 'gros' ? 'Gros' : 'Détail'}</span>
                        <span>{item.price.toFixed(2)} € × {item.quantity}</span>
                      </div>
                      <div className="cart-item-actions">
                        <button onClick={() => updateQuantity(item.productId, item.modeVente, item.quantity - 1)}>
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.modeVente, item.quantity + 1)}>
                          +
                        </button>
                        <button className="remove-button" onClick={() => removeItem(item.productId, item.modeVente)}>
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <p><strong>Total: {total.toFixed(2)} €</strong></p>
                </div>
              </>
            )}
          </div>

          <div className="section-card">
            <h2>Paiement</h2>
            <div className="form-group">
              <label>Montant payé (€)</label>
              <input
                type="number"
                step="0.01"
                value={montantPaye}
                onChange={(e) => setMontantPaye(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="payment-summary">
              <p>Total: <strong>{total.toFixed(2)} €</strong></p>
              <p>Payé: <strong>{montantPayeNum.toFixed(2)} €</strong></p>
              {credit > 0 && (
                <p className="credit-amount">Crédit restant: <strong>{credit.toFixed(2)} €</strong></p>
              )}
            </div>
            <button
              className="submit-vente-button"
              onClick={handleSubmit}
              disabled={!selectedClient || venteItems.length === 0}
            >
              💾 Enregistrer et Imprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ventes;

