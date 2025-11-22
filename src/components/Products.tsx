import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, ModeVente } from '../types';
import { storage } from '../utils/storage';
import './Products.css';

interface ProductsProps {
  onLogout: () => void;
}

const Products = ({ onLogout }: ProductsProps) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [modeVente, setModeVente] = useState<ModeVente>('detail');
  const [showStockCritique, setShowStockCritique] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    priceGros: '',
    priceDetail: '',
    stock: '',
    stockCritique: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const allProducts = storage.getProducts();
    setProducts(allProducts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: editingProduct?.id || Date.now().toString(),
      name: formData.name,
      priceGros: parseFloat(formData.priceGros) || 0,
      priceDetail: parseFloat(formData.priceDetail) || 0,
      stock: parseInt(formData.stock) || 0,
      stockCritique: parseInt(formData.stockCritique) || 0,
      createdAt: editingProduct?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const allProducts = storage.getProducts();
    if (editingProduct) {
      const index = allProducts.findIndex(p => p.id === editingProduct.id);
      allProducts[index] = newProduct;
    } else {
      allProducts.push(newProduct);
    }
    storage.saveProducts(allProducts);
    loadProducts();
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      priceGros: '',
      priceDetail: '',
      stock: '',
      stockCritique: '',
    });
    setEditingProduct(null);
    setShowModal(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      priceGros: product.priceGros.toString(),
      priceDetail: product.priceDetail.toString(),
      stock: product.stock.toString(),
      stockCritique: product.stockCritique.toString(),
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const allProducts = storage.getProducts();
      const filtered = allProducts.filter(p => p.id !== id);
      storage.saveProducts(filtered);
      loadProducts();
    }
  };

  const displayedProducts = showStockCritique
    ? products.filter(p => p.stock <= p.stockCritique)
    : products;

  return (
    <div className="products-container">
      <div className="products-header">
        <div>
          <button className="back-button" onClick={() => navigate('/dashboard')}>
            ← Retour
          </button>
          <h1>🏷️ Produits / Stock</h1>
        </div>
        <div className="header-actions">
          <button
            className={`filter-button ${showStockCritique ? 'active' : ''}`}
            onClick={() => setShowStockCritique(!showStockCritique)}
          >
            {showStockCritique ? '📦 Stock Critique' : '📦 Voir Stock Critique'}
          </button>
          <button className="add-button" onClick={() => {
            resetForm();
            setShowModal(true);
          }}>
            + Ajouter Produit
          </button>
          <button className="logout-button" onClick={onLogout}>
            Déconnexion
          </button>
        </div>
      </div>

      <div className="mode-vente-selector">
        <label>Mode de vente:</label>
        <select value={modeVente} onChange={(e) => setModeVente(e.target.value as ModeVente)}>
          <option value="detail">Détail</option>
          <option value="gros">Gros</option>
        </select>
      </div>

      <div className="products-grid">
        {displayedProducts.length === 0 ? (
          <div className="empty-state">
            <p>Aucun produit {showStockCritique ? 'en stock critique' : ''}</p>
          </div>
        ) : (
          displayedProducts.map((product) => {
            const price = modeVente === 'gros' ? product.priceGros : product.priceDetail;
            const isLowStock = product.stock <= product.stockCritique;
            
            return (
              <div key={product.id} className={`product-card ${isLowStock ? 'low-stock' : ''}`}>
                <div className="product-header">
                  <h3>{product.name}</h3>
                  {isLowStock && <span className="badge">⚠️ Stock Critique</span>}
                </div>
                <div className="product-info">
                  <p><strong>Stock:</strong> {product.stock} unités</p>
                  <p><strong>Stock critique:</strong> {product.stockCritique} unités</p>
                  <p><strong>Prix {modeVente === 'gros' ? 'Gros' : 'Détail'}:</strong> {price.toFixed(2)} €</p>
                  {modeVente === 'gros' && (
                    <p className="price-detail"><strong>Prix Détail:</strong> {product.priceDetail.toFixed(2)} €</p>
                  )}
                </div>
                <div className="product-actions">
                  <button className="edit-button" onClick={() => handleEdit(product)}>
                    ✏️ Modifier
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(product.id)}>
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
            <h2>{editingProduct ? 'Modifier le produit' : 'Ajouter un produit'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom du produit *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Prix Gros (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceGros}
                    onChange={(e) => setFormData({ ...formData, priceGros: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Prix Détail (€) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.priceDetail}
                    onChange={(e) => setFormData({ ...formData, priceDetail: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Stock actuel *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Stock critique *</label>
                  <input
                    type="number"
                    value={formData.stockCritique}
                    onChange={(e) => setFormData({ ...formData, stockCritique: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={resetForm}>
                  Annuler
                </button>
                <button type="submit" className="submit-button">
                  {editingProduct ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

