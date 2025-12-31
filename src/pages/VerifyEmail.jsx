import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header/Header';
import { useAuth } from '../contexts/AuthContext';
import '../styles/pages/auth.scss';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Token de vérification manquant');
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Ton email a été vérifié avec succès !');

        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Erreur lors de la vérification de l\'email');
      }
    };

    verify();
  }, [searchParams, verifyEmail, navigate]);

  return (
    <>
      <Header />
      <div className="auth">
        <div className="auth__container">
        <div className="auth__card">
          {status === 'loading' && (
            <>
              <h1 className="auth__title">Vérification en cours...</h1>
              <div className="auth__loading">
                <div className="auth__spinner"></div>
                <p>Nous vérifions ton email, un instant...</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="auth__title">Email vérifié ! 🎉</h1>
              <p className="auth__subtitle">Bienvenue dans Arki'Family !</p>

              <div className="auth__success">
                <span>✓</span>
                {message}
              </div>

              <div className="auth__info">
                <p>Tu peux maintenant te connecter avec tes identifiants !</p>
                <p style={{ marginTop: '1rem' }}>Tu vas être redirigé vers la page de connexion dans quelques secondes...</p>
              </div>

              <Link
                to="/login"
                className="auth__btn auth__btn--primary"
                style={{ textAlign: 'center', display: 'block', marginTop: '2rem' }}
              >
                Se connecter maintenant
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <h1 className="auth__title">Erreur de vérification</h1>
              <p className="auth__subtitle">Oups, quelque chose s'est mal passé...</p>

              <div className="auth__error">
                <span>⚠️</span>
                {message}
              </div>

              <div className="auth__info">
                <p>Raisons possibles :</p>
                <ul>
                  <li>Le lien de vérification a expiré (valide 24h)</li>
                  <li>Le lien a déjà été utilisé</li>
                  <li>Le lien est invalide ou corrompu</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <Link
                  to="/login"
                  className="auth__btn auth__btn--secondary"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Se connecter
                </Link>
                <Link
                  to="/register"
                  className="auth__btn auth__btn--primary"
                  style={{ flex: 1, textAlign: 'center' }}
                >
                  Créer un compte
                </Link>
              </div>
            </>
          )}

          <Link to="/" className="auth__back">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
    </>
  );
};

export default VerifyEmail;
