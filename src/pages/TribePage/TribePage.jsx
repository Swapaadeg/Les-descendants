import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DinoCardCompact from '../../components/DinoCardCompact/DinoCardCompact';
import { TribeSkeleton } from '../../components/Skeleton/Skeleton';
import TribeMembersModal from '../../components/TribeMembersModal/TribeMembersModal';
import { useTribe } from '../../hooks/useTribe';
import { useAuth } from '../../contexts/AuthContext';
import { tribeAPI } from '../../services/api';
import '../../styles/pages/tribe-page.scss';

const TribePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tribe, loading: tribeLoading, refreshTribe } = useTribe();
  const [recentDinos, setRecentDinos] = useState([]);
  const [dinosLoading, setDinosLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Charger les dinosaures récents et les demandes en attente
  useEffect(() => {
    if (tribe) {
      loadRecentDinos();
      if (tribe.user_role === 'owner') {
        loadPendingRequests();
      }
    }
  }, [tribe]);

  const loadRecentDinos = async () => {
    try {
      setDinosLoading(true);
      const data = await tribeAPI.getRecentDinos(tribe.id);
      setRecentDinos(data);
    } catch (err) {
      console.error('Erreur chargement dinos:', err);
    } finally {
      setDinosLoading(false);
    }
  };

  const loadPendingRequests = async () => {
    try {
      console.log('🔍 Chargement des demandes en attente...');
      const data = await tribeAPI.members.getRequests();
      console.log('📋 Demandes reçues:', data);
      setPendingRequests(data.requests || []);
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
    }
  };

  // Gérer l'acceptation d'une demande
  const handleAcceptRequest = async (requestId) => {
    try {
      await tribeAPI.members.handleRequest(requestId, 'accept');
      // Recharger les demandes et les données de la tribu
      await loadPendingRequests();
      await refreshTribe();
    } catch (err) {
      console.error('Erreur lors de l\'acceptation:', err);
      setError('Erreur lors de l\'acceptation de la demande');
    }
  };

  // Gérer le refus d'une demande
  const handleRejectRequest = async (requestId) => {
    try {
      await tribeAPI.members.handleRequest(requestId, 'reject');
      // Recharger les demandes
      await loadPendingRequests();
    } catch (err) {
      console.error('Erreur lors du refus:', err);
      setError('Erreur lors du refus de la demande');
    }
  };

  // Si pas de tribu, rediriger vers dashboard
  useEffect(() => {
    if (!tribeLoading && !tribe) {
      navigate('/dashboard');
    }
  }, [tribe, tribeLoading, navigate]);

  // Fonction pour convertir hex en RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
  };

  // Appliquer les couleurs et les polices de la tribu via CSS custom properties
  const tribeStyle = tribe ? {
    '--tribe-primary': tribe.primary_color || '#00f0ff',
    '--tribe-secondary': tribe.secondary_color || '#b842ff',
    '--tribe-primary-rgb': hexToRgb(tribe.primary_color || '#00f0ff'),
    '--tribe-secondary-rgb': hexToRgb(tribe.secondary_color || '#b842ff'),
    '--tribe-body-font': tribe.font_family || '"Orbitron", sans-serif',
    '--tribe-title-font': tribe.title_font_family || '"Orbitron", sans-serif',
  } : {};

  if (tribeLoading) {
    return (
      <div className="tribe-page">
        <TribeSkeleton />
      </div>
    );
  }

  if (!tribe) {
    return null;
  }

  const isOwner = tribe.user_role === 'owner';
  const bannerUrl = tribe.banner_url || '/assets/seasonal/winter/banner-hiver.png';

  const pageStyle = {
    ...tribeStyle,
    backgroundImage: `url(${bannerUrl})`,
  };

  return (
    <div className="tribe-page" style={pageStyle}>
      <div className="tribe-page__overlay" />

      {/* Logo Arki'Family centré */}
      <Link to="/" className="tribe-page__home-logo-link">
        <img
          src="/assets/seasonal/winter/logo-hiver.png"
          alt="Arki'Family"
          className="tribe-page__home-logo"
        />
      </Link>

      {/* Bouton Admin */}
      {user?.is_admin && (
        <Link to="/admin" className="tribe-page__admin-link">
          <span className="tribe-page__admin-icon">⚙️</span>
          <span className="tribe-page__admin-text">Admin</span>
        </Link>
      )}

      {/* Avatar utilisateur */}
      {user && (
        <Link to="/profile" className="tribe-page__user-avatar">
          {user.photo_profil ? (
            <img
              src={user.photo_profil}
              alt={user.username}
              className="tribe-page__user-avatar-img"
            />
          ) : (
            <div className="tribe-page__user-avatar-placeholder">
              {user.username?.charAt(0).toUpperCase() || '👤'}
            </div>
          )}
        </Link>
      )}

      {/* Header avec titre */}
      <div className="tribe-page__header">
        <div className="tribe-page__header-content">
          <h1 className="tribe-page__title">{tribe.name}</h1>
        </div>
      </div>

      {/* Logo */}
      <div className="tribe-page__logo-container">
        {tribe.logo_url ? (
          <img
            src={tribe.logo_url}
            alt={`Logo ${tribe.name}`}
            className="tribe-page__logo"
          />
        ) : (
          <div className="tribe-page__logo tribe-page__logo--placeholder">
            🏛️
          </div>
        )}
      </div>

      {/* Informations de la tribu */}
      <div className="tribe-page__info">
        {tribe.description && (
          <p className="tribe-page__description">{tribe.description}</p>
        )}
        <div className="tribe-page__stats">
          <span className="tribe-page__stat">
            <span className="tribe-page__stat-icon">👥</span>
            {tribe.members?.length || 0} membres
          </span>
          <span className="tribe-page__stat">
            <span className="tribe-page__stat-icon">🦖</span>
            {recentDinos.length} dinosaures récents
          </span>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="tribe-page__actions">
        <button
          className="tribe-page__btn tribe-page__btn--primary"
          onClick={() => navigate('/dashboard')}
        >
          <span className="tribe-page__btn-icon">🦖</span>
          {isOwner ? 'Gérer les dinosaures' : 'Voir tous les dinosaures'}
        </button>

        {isOwner && (
          <Link
            to="/tribe/customize"
            className="tribe-page__btn tribe-page__btn--secondary"
          >
            <span className="tribe-page__btn-icon">🎨</span>
            Personnaliser
          </Link>
        )}

        <button
          className="tribe-page__btn tribe-page__btn--accent"
          onClick={() => {
            // Recharger les demandes avant d'ouvrir la modal
            if (isOwner) {
              loadPendingRequests();
            }
            setIsModalOpen(true);
          }}
        >
          <span className="tribe-page__btn-icon">👥</span>
          Gérer la tribu
          {isOwner && pendingRequests.length > 0 && ` (${pendingRequests.length})`}
        </button>
      </div>

      {/* Section dinosaures mis en vitrine */}
      <div className="tribe-page__section">
        <h2 className="tribe-page__section-title">
          <span className="tribe-page__section-icon">⭐</span>
          Dinosaures mis en vitrine
        </h2>

        {error && (
          <div className="tribe-page__error">
            <span>⚠️</span> {error}
          </div>
        )}

        {dinosLoading ? (
          <div className="tribe-page__loading">
            <div className="tribe-page__spinner"></div>
            <p>Chargement des dinosaures...</p>
          </div>
        ) : recentDinos.length === 0 ? (
          <div className="tribe-page__empty">
            <span className="tribe-page__empty-icon">🦕</span>
            <h3>Aucun dinosaure récent</h3>
            <p>Les dinosaures ajoutés ou modifiés récemment apparaîtront ici</p>
            <button
              className="tribe-page__btn tribe-page__btn--primary"
              onClick={() => navigate('/dashboard')}
            >
              Ajouter un dinosaure
            </button>
          </div>
        ) : (
          <div className="tribe-page__dinos-grid">
            {recentDinos.map((dino) => (
              <DinoCardCompact
                key={dino.id}
                dino={dino}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bouton retour */}
      <div className="tribe-page__footer">
        <Link to="/dashboard" className="tribe-page__back-link">
          ← Retour au Dashboard
        </Link>
      </div>

      {/* Modal de gestion des membres */}
      <TribeMembersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tribe={tribe}
        requests={pendingRequests}
        onAccept={handleAcceptRequest}
        onReject={handleRejectRequest}
        onKickMember={async (memberId) => {
          try {
            await tribeAPI.members.remove(memberId);
            await refreshTribe();
            await loadPendingRequests();
          } catch (err) {
            console.error('Erreur expulsion membre:', err);
            setError('Erreur lors de l\'expulsion du membre');
          }
        }}
        onRenameTribe={async (updates) => {
          try {
            await tribeAPI.update({ id: tribe.id, ...updates });
            await refreshTribe();
          } catch (err) {
            console.error('Erreur mise à jour tribu:', err);
            setError('Erreur lors de la mise à jour de la tribu');
          }
        }}
        onLeaveTribe={async () => {
          try {
            // Trouver l'ID du membre actuel en utilisant current_user_id
            const currentMember = tribe.members.find(m => m.user_id === tribe.current_user_id);
            if (currentMember) {
              await tribeAPI.members.remove(currentMember.id);
              // Rediriger vers le dashboard après avoir quitté
              navigate('/dashboard');
            } else {
              console.error('Membre actuel non trouvé');
              setError('Impossible de trouver votre profil dans la tribu');
            }
          } catch (err) {
            console.error('Erreur en quittant la tribu:', err);
            setError('Erreur lors de la sortie de la tribu');
          }
        }}
        onDeleteTribe={async () => {
          try {
            await tribeAPI.delete(tribe.id);
            // Rediriger vers le dashboard après suppression
            navigate('/dashboard');
          } catch (err) {
            console.error('Erreur suppression tribu:', err);
            setError('Erreur lors de la suppression de la tribu');
          }
        }}
        onTransferOwnership={async (newOwnerId) => {
          try {
            await tribeAPI.transferOwnership(newOwnerId);
            // Recharger les données de la tribu pour voir le changement
            await refreshTribe();
            await loadPendingRequests();
          } catch (err) {
            console.error('Erreur transfert propriété:', err);
            setError('Erreur lors du transfert de propriété');
          }
        }}
      />
    </div>
  );
};

export default TribePage;
