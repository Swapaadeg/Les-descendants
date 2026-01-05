import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/pages/auth.scss';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
  });
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur du champ quand on le modifie
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Les mots de passe ne correspondent pas';
    }

    if (formData.password.length < 8) {
      newErrors.password = ['Le mot de passe doit contenir au moins 8 caractères'];
    } else {
      const passwordErrors = [];
      if (!/[a-z]/.test(formData.password)) {
        passwordErrors.push('Au moins une lettre minuscule');
      }
      if (!/[A-Z]/.test(formData.password)) {
        passwordErrors.push('Au moins une lettre majuscule');
      }
      if (!/[0-9]/.test(formData.password)) {
        passwordErrors.push('Au moins un chiffre');
      }
      if (!/[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
        passwordErrors.push('Au moins un caractère spécial (!@#$%^&*...)');
      }
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors;
      }
    }

    if (newErrors && Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setErrors({});
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      setSuccess(true);
      setFormData({
        email: '',
        username: '',
        password: '',
        password_confirm: '',
      });
    } catch (err) {
      console.log('Erreur complète:', err);
      console.log('err.details:', err.details);
      console.log('err.message:', err.message);
      
      // Gérer les erreurs détaillées de l'API
      if (err.details && typeof err.details === 'object') {
        console.log('Affichage des détails:', err.details);
        setErrors(err.details);
      }
      setGeneralError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Header />
        <div className="auth">
          <div className="auth__container">
          <div className="auth__card">
            <h1 className="auth__title">Compte créé ! 🎉</h1>
            <p className="auth__subtitle">Bienvenue dans Arki'Family !</p>

            <div className="auth__success">
              <span>✓</span>
              Un email de confirmation a été envoyé à ton adresse. Vérifie ta boîte mail pour activer ton compte !
            </div>

            <div className="auth__info">
              <p>Prochaines étapes :</p>
              <ul>
                <li>Consulte ton email (pense à vérifier les spams)</li>
                <li>Clique sur le lien de confirmation</li>
                <li>Connecte-toi et rejoins une tribu !</li>
              </ul>
            </div>

            <Link to="/login" className="auth__btn auth__btn--primary" style={{ textAlign: 'center', display: 'block', marginTop: '2rem' }}>
              Aller à la connexion
            </Link>

            <Link to="/" className="auth__back">
              ← Retour à l'accueil
            </Link>
          </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="auth">
        <div className="auth__container">
        <div className="auth__card">
          <h1 className="auth__title">Créer un compte</h1>
          <p className="auth__subtitle">Rejoins l'aventure Arki'Family ! 🦖</p>

          {generalError && (
            <div className="auth__error">
              <span>⚠️</span> {generalError}
            </div>
          )}

          <form className="auth__form" onSubmit={handleSubmit}>
            <div className="auth__field">
              <label className="auth__label" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className={`auth__input ${errors.email ? 'auth__input--error' : ''}`}
                placeholder="ton-email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="email"
              />
              {errors.email && (
                <span className="auth__field-error">
                  {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                </span>
              )}
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="username">
                Pseudo
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className={`auth__input ${errors.username ? 'auth__input--error' : ''}`}
                placeholder="TonPseudo"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={50}
                disabled={loading}
                autoComplete="username"
              />
              {errors.username && (
                <span className="auth__field-error">
                  {Array.isArray(errors.username) ? errors.username[0] : errors.username}
                </span>
              )}
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="password">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className={`auth__input ${errors.password ? 'auth__input--error' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.password && (
                <div className="auth__field-errors">
                  {Array.isArray(errors.password) ? (
                    errors.password.map((err, idx) => (
                      <span key={idx} className="auth__field-error">
                        ✗ {err}
                      </span>
                    ))
                  ) : (
                    <span className="auth__field-error">{errors.password}</span>
                  )}
                </div>
              )}
            </div>

            <div className="auth__field">
              <label className="auth__label" htmlFor="password_confirm">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="password_confirm"
                name="password_confirm"
                className={`auth__input ${errors.password_confirm ? 'auth__input--error' : ''}`}
                placeholder="••••••••"
                value={formData.password_confirm}
                onChange={handleChange}
                required
                disabled={loading}
                autoComplete="new-password"
              />
              {errors.password_confirm && (
                <span className="auth__field-error">{errors.password_confirm}</span>
              )}
            </div>

            <div className="auth__info">
              <p>Le mot de passe doit contenir :</p>
              <ul>
                <li className={formData.password.length >= 8 ? 'auth__requirement--valid' : ''}>
                  ✓ Au moins 8 caractères
                </li>
                <li className={/[a-z]/.test(formData.password) ? 'auth__requirement--valid' : ''}>
                  ✓ Au moins une lettre minuscule
                </li>
                <li className={/[A-Z]/.test(formData.password) ? 'auth__requirement--valid' : ''}>
                  ✓ Au moins une lettre majuscule
                </li>
                <li className={/[0-9]/.test(formData.password) ? 'auth__requirement--valid' : ''}>
                  ✓ Au moins un chiffre
                </li>
                <li className={/[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'auth__requirement--valid' : ''}>
                  ✓ Au moins un caractère spécial (!@#$%^&*...)
                </li>
              </ul>
            </div>

            <button
              type="submit"
              className="auth__btn auth__btn--primary"
              disabled={loading}
            >
              {loading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="auth__footer">
            <p>Déjà un compte ?</p>
            <Link to="/login" className="auth__link auth__link--highlight">
              Se connecter
            </Link>
          </div>

          <Link to="/" className="auth__back">
            ← Retour à l'accueil
          </Link>
        </div>
        </div>
      </div>
    </>
  );
};

export default Register;
