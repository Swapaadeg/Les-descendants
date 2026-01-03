import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminStats } from '../../hooks/useAdminStats';
import AdminLayout from './components/AdminLayout';
import StatsCard from './components/StatsCard';
import './AdminDashboard.scss';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, loading, error, refreshStats } = useAdminStats();

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user?.is_admin) return null;

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard__loading">
          <div className="admin-dashboard__spinner"></div>
          <p>Chargement des statistiques...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !stats) {
    return (
      <AdminLayout>
        <div className="admin-dashboard__error">
          <span className="admin-dashboard__error-icon">⚠️</span>
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button onClick={refreshStats} className="admin-dashboard__retry-btn">
            Réessayer
          </button>
        </div>
      </AdminLayout>
    );
  }

  const getActionLabel = (actionType) => {
    const labels = {
      tribe_created: 'Tribu créée',
      tribe_approved: 'Tribu approuvée',
      tribe_rejected: 'Tribu rejetée',
      tribe_deleted: 'Tribu supprimée',
      event_created: 'Événement créé',
      event_updated: 'Événement modifié',
      event_deleted: 'Événement supprimé',
      user_banned: 'Utilisateur banni'
    };
    return labels[actionType] || actionType;
  };

  const getActionIcon = (actionType) => {
    const icons = {
      tribe_created: '🏛️',
      tribe_approved: '✅',
      tribe_rejected: '❌',
      tribe_deleted: '🗑️',
      event_created: '🎉',
      event_updated: '✏️',
      event_deleted: '🗑️',
      user_banned: '🚫'
    };
    return icons[actionType] || '📝';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} j`;

    return date.toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="admin-dashboard">
        <div className="admin-dashboard__header">
          <h1 className="admin-dashboard__title">
            <span className="admin-dashboard__title-icon">📊</span>
            Tableau de bord
          </h1>
          <button onClick={refreshStats} className="admin-dashboard__refresh-btn">
            <span>🔄</span> Actualiser
          </button>
        </div>

        <div className="admin-dashboard__stats">
          <StatsCard
            title="Tribus en attente"
            value={stats.pending_tribes}
            icon="⏳"
            color="warning"
            link={stats.pending_tribes > 0 ? "/admin/tribes?status=pending" : null}
          />
          <StatsCard
            title="Tribus totales"
            value={stats.total_tribes}
            icon="🏛️"
            color="success"
            link="/admin/tribes?status=approved"
          />
          <StatsCard
            title="Utilisateurs"
            value={stats.total_users}
            icon="👥"
            color="info"
          />
          <StatsCard
            title="Événements"
            value={stats.total_events}
            icon="🎉"
            color="primary"
            link="/admin/events"
          />
        </div>

        {stats.total_dinosaurs !== undefined && (
          <div className="admin-dashboard__secondary-stats">
            <div className="admin-dashboard__stat-item">
              <span className="admin-dashboard__stat-icon">🦖</span>
              <div className="admin-dashboard__stat-content">
                <span className="admin-dashboard__stat-label">Dinosaures</span>
                <span className="admin-dashboard__stat-value">{stats.total_dinosaurs}</span>
              </div>
            </div>
          </div>
        )}

        <div className="admin-dashboard__activity">
          <div className="admin-dashboard__activity-header">
            <h2 className="admin-dashboard__activity-title">
              <span className="admin-dashboard__activity-title-icon">📜</span>
              Activité récente
            </h2>
          </div>

          {stats.recent_activity && stats.recent_activity.length > 0 ? (
            <div className="admin-dashboard__activity-list">
              {stats.recent_activity.map((activity) => (
                <div key={activity.id} className="admin-dashboard__activity-item">
                  <span className="admin-dashboard__activity-icon">
                    {getActionIcon(activity.action_type)}
                  </span>
                  <div className="admin-dashboard__activity-content">
                    <div className="admin-dashboard__activity-main">
                      <span className="admin-dashboard__activity-admin">
                        {activity.admin_username}
                      </span>
                      <span className="admin-dashboard__activity-action">
                        {getActionLabel(activity.action_type)}
                      </span>
                      {activity.details?.tribe_name && (
                        <span className="admin-dashboard__activity-entity">
                          "{activity.details.tribe_name}"
                        </span>
                      )}
                      {activity.details?.event_name && (
                        <span className="admin-dashboard__activity-entity">
                          "{activity.details.event_name}"
                        </span>
                      )}
                    </div>
                    <div className="admin-dashboard__activity-meta">
                      <span className="admin-dashboard__activity-date">
                        {formatDate(activity.created_at)}
                      </span>
                      {activity.details?.rejection_reason && (
                        <span className="admin-dashboard__activity-note">
                          Raison: {activity.details.rejection_reason}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-dashboard__activity-empty">
              <p>Aucune activité récente</p>
            </div>
          )}
        </div>

        <div className="admin-dashboard__quick-links">
          <h2 className="admin-dashboard__quick-links-title">Accès rapide</h2>
          <div className="admin-dashboard__quick-links-grid">
            <Link to="/admin/tribes" className="admin-dashboard__quick-link">
              <span className="admin-dashboard__quick-link-icon">🏛️</span>
              <span className="admin-dashboard__quick-link-label">Gérer les tribus</span>
            </Link>
            <Link to="/admin/events" className="admin-dashboard__quick-link">
              <span className="admin-dashboard__quick-link-icon">🎉</span>
              <span className="admin-dashboard__quick-link-label">Gérer les événements</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
