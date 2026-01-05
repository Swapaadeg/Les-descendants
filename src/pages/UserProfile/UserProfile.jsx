import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI } from '../../services/api';
import '../../styles/pages/user-profile.scss';

const UserProfile = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.photo_profil || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleEmailChange = (e) => {
    const { name, value } = e.target;
    setEmailData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await userAPI.changeEmail(emailData.newEmail, emailData.password);
      setSuccess('Email modifié avec succès ! Vérifiez votre nouvelle adresse email.');
      setEmailData({ newEmail: '', password: '' });
      await refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement d\'email');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    setLoading(true);

    try {
      await userAPI.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Mot de passe modifié avec succès !');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!avatarFile) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setLoading(true);

    try {
      // Upload de l'avatar
      const response = await userAPI.uploadAvatar(avatarFile);

      // Rafraîchir les données utilisateur depuis le serveur
      await refreshUser();

      setSuccess(response.message || 'Photo de profil mise à jour !');
      setAvatarFile(null);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Erreur lors de l\'upload de la photo');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <Header />
      <div className="user-profile">
        <div className="user-profile__container">
          <h1 className="user-profile__title">Mon Profil</h1>

          {error && (
            <div className="user-profile__error">
              <span>⚠️</span> {error}
            </div>
          )}

          {success && (
            <div className="user-profile__success">
              <span>✓</span> {success}
            </div>
          )}

          {/* Section Avatar */}
          <section className="user-profile__section">
            <h2 className="user-profile__section-title">Photo de profil</h2>
            <form className="user-profile__form" onSubmit={handleAvatarSubmit}>
              <div className="user-profile__avatar-container">
                <div className="user-profile__avatar-preview">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" />
                  ) : (
                    <div className="user-profile__avatar-placeholder">
                      {user?.username?.charAt(0).toUpperCase() || '👤'}
                    </div>
                  )}
                </div>
                <div className="user-profile__avatar-upload">
                  <input
                    type="file"
                    id="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="user-profile__file-input"
                  />
                  <label htmlFor="avatar" className="user-profile__file-label">
                    Choisir une image
                  </label>
                </div>
              </div>
              <button
                type="submit"
                className="user-profile__btn user-profile__btn--primary"
                disabled={loading || !avatarFile}
              >
                {loading ? 'Envoi...' : 'Mettre à jour la photo'}
              </button>
            </form>
          </section>

          {/* Section Email */}
          <section className="user-profile__section">
            <h2 className="user-profile__section-title">Modifier l'email</h2>
            <p className="user-profile__current-info">
              Email actuel: <strong>{user?.email}</strong>
            </p>
            <form className="user-profile__form" onSubmit={handleEmailSubmit}>
              <div className="user-profile__field">
                <label htmlFor="newEmail">Nouvel email</label>
                <input
                  type="email"
                  id="newEmail"
                  name="newEmail"
                  value={emailData.newEmail}
                  onChange={handleEmailChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="user-profile__field">
                <label htmlFor="emailPassword">Mot de passe actuel</label>
                <input
                  type="password"
                  id="emailPassword"
                  name="password"
                  value={emailData.password}
                  onChange={handleEmailChange}
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="user-profile__btn user-profile__btn--primary"
                disabled={loading}
              >
                {loading ? 'Modification...' : 'Modifier l\'email'}
              </button>
            </form>
          </section>

          {/* Section Mot de passe */}
          <section className="user-profile__section">
            <h2 className="user-profile__section-title">Modifier le mot de passe</h2>
            <form className="user-profile__form" onSubmit={handlePasswordSubmit}>
              <div className="user-profile__field">
                <label htmlFor="currentPassword">Mot de passe actuel</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="user-profile__field">
                <label htmlFor="newPassword">Nouveau mot de passe</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="user-profile__field">
                <label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  disabled={loading}
                />
              </div>
              <button
                type="submit"
                className="user-profile__btn user-profile__btn--primary"
                disabled={loading}
              >
                {loading ? 'Modification...' : 'Modifier le mot de passe'}
              </button>
            </form>
          </section>

          {/* Section Déconnexion */}
          <section className="user-profile__section">
            <button
              onClick={handleLogout}
              className="user-profile__btn user-profile__btn--danger"
            >
              Se déconnecter
            </button>
          </section>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
