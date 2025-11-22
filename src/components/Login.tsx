import { useState } from 'react';
import { storage } from '../utils/storage';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = storage.getPIN();
    
    if (pin === correctPin) {
      setError('');
      onLogin();
    } else {
      setError('Code PIN incorrect');
      setPin('');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>🔐 Connexion</h1>
        <p className="login-subtitle">Entrez votre code PIN</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="pin-input"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              setError('');
            }}
            placeholder="Code PIN"
            maxLength={4}
            autoFocus
          />
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="login-button">
            Se connecter
          </button>
        </form>
        <p className="pin-info">Code PIN par défaut: 0000</p>
      </div>
    </div>
  );
};

export default Login;

