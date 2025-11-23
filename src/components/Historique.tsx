import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vente, Retour, Client } from '../types';
import { api } from '../utils/api';
import './Historique.css';

interface HistoriqueProps {
  onLogout: () => void;
}

const Historique = ({ onLogout }: HistoriqueProps) => {
  const navigate = useNavigate();
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [retours, setRetours] = useState<Retour[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeTab, setActiveTab] = useState<'ventes' | 'retours' | 'credits'>('ventes');
  const [selectedVente, setSelectedVente] = useState<Vente | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ventesData, retoursData, clientsData] = await Promise.all([
        api.getVentes(),
        api.getRetours(),
        api.getClients(),
      ]);
      setVentes(ventesData);
      setRetours(retoursData);
      setClients(clientsData);
    } catch (err: any) {
      alert(err.message || 'Erreur lors du chargement des données');
    }
  };

  const clientsAvecCredit = clients.filter(c => c.credit > 0);

  const totalCredit = clients.reduce((sum, c) => sum + c.credit, 0);

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

  const exportData = () => {
    const data = {
      ventes,
      retours,
      clientsAvecCredit: clientsAvecCredit.map(c => ({
        nom: c.nom,
        prenom: c.prenom,
        credit: c.credit,
      })),
      totalCredit,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-gestion-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="historique-container">
      <div className="historique-header">
        <div>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Retour
          </button>
          <h1>🧾 Historique / Factures</h1>
        </div>
        <div className="header-actions">
          <button className="export-button" onClick={exportData}>
            📥 Exporter
          </button>
          <button className="logout-button" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'ventes' ? 'active' : ''}`}
          onClick={() => setActiveTab('ventes')}
        >
          Factures ({ventes.length})
        </button>
        <button
          className={`tab ${activeTab === 'retours' ? 'active' : ''}`}
          onClick={() => setActiveTab('retours')}
        >
          Retours ({retours.length})
        </button>
        <button
          className={`tab ${activeTab === 'credits' ? 'active' : ''}`}
          onClick={() => setActiveTab('credits')}
        >
          Crédits ({clientsAvecCredit.length})
        </button>
      </div>

      <div className="content-area">
        {activeTab === 'ventes' && (
          <div className="ventes-list">
            {ventes.length === 0 ? (
              <div className="empty-state">
                <p>Aucune facture enregistrée</p>
              </div>
            ) : (
              ventes.map(vente => (
                <div key={vente.id} className="vente-card">
                  <div className="vente-card-header">
                    <div>
                      <h3>Facture #{vente.id}</h3>
                      <p className="vente-date">{new Date(vente.date).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div className="vente-actions">
                      <button className="print-button" onClick={() => printFacture(vente)}>
                        🖨️ Imprimer
                      </button>
                      <button className="view-button" onClick={() => setSelectedVente(vente)}>
                        👁️ Voir
                      </button>
                    </div>
                  </div>
                  <div className="vente-card-info">
                    <p><strong>Client:</strong> {vente.clientName}</p>
                    <p><strong>Total:</strong> {vente.total.toFixed(2)} €</p>
                    <p><strong>Payé:</strong> {vente.montantPaye.toFixed(2)} €</p>
                    {vente.credit > 0 && (
                      <p className="credit-info"><strong>Crédit:</strong> {vente.credit.toFixed(2)} €</p>
                    )}
                    <p><strong>Produits:</strong> {vente.items.length}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'retours' && (
          <div className="retours-list">
            {retours.length === 0 ? (
              <div className="empty-state">
                <p>Aucun retour enregistré</p>
              </div>
            ) : (
              retours.map(retour => (
                <div key={retour.id} className="retour-card">
                  <div className="retour-card-header">
                    <h3>Retour #{retour.id}</h3>
                    <span className="retour-date">{new Date(retour.date).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="retour-card-info">
                    <p><strong>Client:</strong> {retour.clientName}</p>
                    <p><strong>Produit:</strong> {retour.productName}</p>
                    <p><strong>Quantité:</strong> {retour.quantity}</p>
                    <p><strong>Vente:</strong> #{retour.venteId}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'credits' && (
          <div className="credits-list">
            <div className="total-credit-card">
              <h2>Total crédit dû</h2>
              <p className="total-amount">{totalCredit.toFixed(2)} €</p>
            </div>
            {clientsAvecCredit.length === 0 ? (
              <div className="empty-state">
                <p>Aucun crédit en cours</p>
              </div>
            ) : (
              clientsAvecCredit.map(client => (
                <div key={client.id} className="credit-card">
                  <div className="credit-card-header">
                    <h3>{client.prenom} {client.nom}</h3>
                    <span className="credit-amount">{client.credit.toFixed(2)} €</span>
                  </div>
                  <div className="credit-card-info">
                    <p><strong>Téléphone:</strong> {client.telephone}</p>
                    {client.adresse && <p><strong>Adresse:</strong> {client.adresse}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedVente && (
        <div className="modal-overlay" onClick={() => setSelectedVente(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Détails de la facture #{selectedVente.id}</h2>
            <div className="facture-details">
              <div className="detail-section">
                <h3>Client</h3>
                <p>{selectedVente.clientName}</p>
              </div>
              <div className="detail-section">
                <h3>Date</h3>
                <p>{new Date(selectedVente.date).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="detail-section">
                <h3>Produits</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Quantité</th>
                      <th>Prix</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedVente.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{item.price.toFixed(2)} €</td>
                        <td>{(item.price * item.quantity).toFixed(2)} €</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="detail-section">
                <h3>Paiement</h3>
                <p>Total: {selectedVente.total.toFixed(2)} €</p>
                <p>Payé: {selectedVente.montantPaye.toFixed(2)} €</p>
                {selectedVente.credit > 0 && (
                  <p className="credit-info">Crédit: {selectedVente.credit.toFixed(2)} €</p>
                )}
              </div>
            </div>
            <button className="close-button" onClick={() => setSelectedVente(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Historique;

