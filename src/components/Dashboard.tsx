import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: '🏷️', title: 'Produits / Stock', path: '/products' },
    { icon: '👥', title: 'Clients', path: '/clients' },
    { icon: '🛒', title: 'Ventes', path: '/ventes' },
    { icon: '↩️', title: 'Retours', path: '/retours' },
    { icon: '🧾', title: 'Historique / Factures', path: '/historique' },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Dashboard</h1>
        <button className="logout-button" onClick={onLogout}>
          Déconnexion
        </button>
      </div>
      <div className="dashboard-grid">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className="dashboard-card"
            onClick={() => navigate(item.path)}
          >
            <div className="card-icon">{item.icon}</div>
            <div className="card-title">{item.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

