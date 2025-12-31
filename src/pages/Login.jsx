import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/auth.scss';

const Login = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    remember: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      // Rediriger vers la page d'accueil
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth__container">
        <div className="auth__card">
          <h1 className="auth__title">Connexion</h1>
          <p className="auth__subtitle">Content de te revoir ! 🦖</p>

          {error && (
            <div className="auth__error">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__field">
              <label className="auth__label" htmlFor="login">
                Email ou Pseudo
              </label>
              <input
                type="text"
                id="login"
                name="login"
                className="auth__input"
                placeholder="ton-email@example.com"
                value={formData.login}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="password">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="auth__input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="auth__options">
              <label className="auth__checkbox">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  disabled={loading}
                />
                <span>Se souvenir de moi</span>
              </label>
              <Link to="/reset-password" className="auth__link">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              className="auth__btn auth__btn--primary"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="auth__footer">
            <p>Pas encore de compte ?</p>
            <Link to="/register" className="auth__link auth__link--highlight">
              Créer un compte
            </Link>
          </div>

          <Link to="/" className="auth__back">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
