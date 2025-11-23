import { useState } from 'react';
import { api } from '../utils/api';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Tentative de connexion avec:', username);
      const result = await api.login(username, password);
      console.log('✅ Connexion réussie:', result.user);
      onLogin();
    } catch (err: any) {
      console.error('❌ Erreur de connexion:', err);
      const errorMessage = err.message || 'Erreur de connexion';
      
      // Message d'erreur plus clair
      if (errorMessage.includes('Impossible de se connecter') || 
          errorMessage.includes('Failed to fetch') ||
          errorMessage.includes('Load failed')) {
        setError('❌ Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur http://localhost:3000');
      } else if (errorMessage.includes('401') || errorMessage.includes('Identifiants')) {
        setError('❌ Identifiants incorrects. Utilisateur: admin / Mot de passe: admin123');
      } else {
        setError(`❌ ${errorMessage}`);
      }
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🔐 Connexion</h1>
        <p className="login-subtitle">Entrez vos identifiants</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="pin-input"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setError('');
            }}
            placeholder="Nom d'utilisateur"
            required
            autoFocus
          />
          <input
            type="password"
            className="pin-input"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            placeholder="Mot de passe"
            required
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="pin-info">Utilisateur par défaut: admin / admin123</p>
      </div>
    </div>
  );
};

export default Login;

