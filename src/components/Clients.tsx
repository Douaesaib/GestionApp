import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '../types';
import { api } from '../utils/api';
import './Clients.css';

interface ClientsProps {
  onLogout: () => void;
}

const Clients = ({ onLogout }: ClientsProps) => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [ventes, setVentes] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    adresse: '',
    telephone: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError('');
      const [allClients, allVentes] = await Promise.all([
        api.getClients(),
        api.getVentes(),
      ]);
      setClients(allClients);
      setVentes(allVentes);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const clientData = {
        nom: formData.nom,
        prenom: formData.prenom,
        adresse: formData.adresse || undefined,
        telephone: formData.telephone,
        credit: editingClient?.credit || 0,
      };

      if (editingClient) {
        await api.updateClient(editingClient.id, clientData);
      } else {
        await api.createClient(clientData);
      }
      
      await loadClients();
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      prenom: '',
      adresse: '',
      telephone: '',
    });
    setEditingClient(null);
    setShowModal(false);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      nom: client.nom,
      prenom: client.prenom,
      adresse: client.adresse || '',
      telephone: client.telephone,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        setLoading(true);
        setError('');
        await api.deleteClient(id);
        await loadClients();
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setShowDetails(true);
  };

  const getClientVentes = (clientId: string) => {
    return ventes.filter(v => v.clientId === clientId);
  };

  return (
    <div className="clients-container">
      <div className="clients-header">
        <div>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Retour
          </button>
          <h1>👥 Clients</h1>
        </div>
        <div className="header-actions">
          <button className="add-button" onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            + Ajouter Client
          </button>
          <button className="logout-button" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '10px', margin: '10px', background: '#fee', color: '#c33', borderRadius: '5px' }}>
          {error}
        </div>
      )}

      {loading && <div style={{ padding: '20px', textAlign: 'center' }}>Chargement...</div>}

      <div className="clients-grid">
        {clients.length === 0 ? (
          <div className="empty-state">
            <p>Aucun client enregistré</p>
          </div>
        ) : (
          clients.map((client) => {
            const ventes = getClientVentes(client.id);
            return (
              <div key={client.id} className="client-card">
                <div className="client-header">
                  <h3>{client.prenom} {client.nom}</h3>
                  {client.credit > 0 && (
                    <span className="credit-badge">💳 {client.credit.toFixed(2)} €</span>
                  )}
                </div>
                <div className="client-info">
                  <p><strong>Téléphone:</strong> {client.telephone}</p>
                  {client.adresse && <p><strong>Adresse:</strong> {client.adresse}</p>}
                  <p><strong>Crédit:</strong> {client.credit.toFixed(2)} €</p>
                  <p><strong>Nombre d'achats:</strong> {ventes.length}</p>
                </div>
                <div className="client-actions">
                  <button className="view-button" onClick={() => handleViewDetails(client)}>
                    👁️ Détails
                  </button>
                  <button className="edit-button" onClick={() => handleEdit(client)}>
                    ✏️ Modifier
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(client.id)}>
                    🗑️ Supprimer
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingClient ? 'Modifier le client' : 'Ajouter un client'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Prénom *</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Téléphone *</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Adresse (optionnel)</label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                />
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={resetForm}>
                  Annuler
                </button>
                <button type="submit" className="submit-button">
                  {editingClient ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedClient && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content details-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Détails du client: {selectedClient.prenom} {selectedClient.nom}</h2>
            <div className="details-content">
              <div className="detail-section">
                <h3>Informations</h3>
                <p><strong>Téléphone:</strong> {selectedClient.telephone}</p>
                {selectedClient.adresse && <p><strong>Adresse:</strong> {selectedClient.adresse}</p>}
                <p><strong>Crédit actuel:</strong> <span className="credit-amount">{selectedClient.credit.toFixed(2)} €</span></p>
              </div>
              <div className="detail-section">
                <h3>Historique des achats</h3>
                {getClientVentes(selectedClient.id).length === 0 ? (
                  <p className="no-data">Aucun achat enregistré</p>
                ) : (
                  <div className="ventes-list">
                    {getClientVentes(selectedClient.id).map((vente) => (
                      <div key={vente.id} className="vente-item">
                        <p><strong>Date:</strong> {new Date(vente.date).toLocaleDateString('fr-FR')}</p>
                        <p><strong>Total:</strong> {vente.total.toFixed(2)} €</p>
                        <p><strong>Payé:</strong> {vente.montantPaye.toFixed(2)} €</p>
                        {vente.credit > 0 && <p><strong>Crédit:</strong> {vente.credit.toFixed(2)} €</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <button className="close-button" onClick={() => setShowDetails(false)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;

