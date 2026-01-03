import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminTribes } from '../../hooks/useAdminTribes';
import AdminLayout from './components/AdminLayout';
import TribeCard from './components/TribeCard';
import './TribesManagement.scss';

const TribesManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'pending';

  const {
    tribes,
    pagination,
    loading,
    error,
    status,
    setStatus,
    currentPage,
    setCurrentPage,
    approveTribe,
    rejectTribe,
    refreshTribes
  } = useAdminTribes(initialStatus);

  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    setSearchParams({ status });
  }, [status, setSearchParams]);

  if (!user?.is_admin) return null;

  const handleApprove = async (tribeId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await approveTribe(tribeId);
      setConfirmAction(null);
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (tribeId) => {
    try {
      setActionLoading(true);
      setActionError(null);
      await rejectTribe(tribeId, rejectionReason || null);
      setConfirmAction(null);
      setRejectionReason('');
    } catch (err) {
      setActionError(err.response?.data?.message || err.message || 'Erreur lors du rejet');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusCount = (statusType) => {
    // This would ideally come from the stats API
    return '';
  };

  return (
    <AdminLayout>
      <div className="tribes-management">
        <div className="tribes-management__header">
          <h1 className="tribes-management__title">
            <span className="tribes-management__title-icon">🏛️</span>
            Gestion des tribus
          </h1>
          <button onClick={() => refreshTribes(currentPage)} className="tribes-management__refresh-btn">
            <span>🔄</span> Actualiser
          </button>
        </div>

        {/* Tabs */}
        <div className="tribes-management__tabs">
          <button
            className={`tribes-management__tab ${status === 'pending' ? 'tribes-management__tab--active' : ''}`}
            onClick={() => handleStatusChange('pending')}
          >
            <span className="tribes-management__tab-icon">⏳</span>
            En attente
          </button>
          <button
            className={`tribes-management__tab ${status === 'approved' ? 'tribes-management__tab--active' : ''}`}
            onClick={() => handleStatusChange('approved')}
          >
            <span className="tribes-management__tab-icon">✅</span>
            Approuvées
          </button>
          <button
            className={`tribes-management__tab ${status === 'all' ? 'tribes-management__tab--active' : ''}`}
            onClick={() => handleStatusChange('all')}
          >
            <span className="tribes-management__tab-icon">📋</span>
            Toutes
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="tribes-management__loading">
            <div className="tribes-management__spinner"></div>
            <p>Chargement des tribus...</p>
          </div>
        ) : error ? (
          <div className="tribes-management__error">
            <span className="tribes-management__error-icon">⚠️</span>
            <h2>Erreur de chargement</h2>
            <p>{error}</p>
            <button onClick={() => refreshTribes(currentPage)} className="tribes-management__retry-btn">
              Réessayer
            </button>
          </div>
        ) : tribes.length === 0 ? (
          <div className="tribes-management__empty">
            <span className="tribes-management__empty-icon">
              {status === 'pending' ? '⏳' : status === 'approved' ? '✅' : '🏛️'}
            </span>
            <h2>Aucune tribu trouvée</h2>
            <p>
              {status === 'pending' && 'Aucune tribu en attente de validation.'}
              {status === 'approved' && 'Aucune tribu approuvée pour le moment.'}
              {status === 'all' && 'Aucune tribu dans le système.'}
            </p>
          </div>
        ) : (
          <>
            <div className="tribes-management__grid">
              {tribes.map((tribe) => (
                <TribeCard
                  key={tribe.id}
                  tribe={tribe}
                  onApprove={() => setConfirmAction({ type: 'approve', tribe })}
                  onReject={() => setConfirmAction({ type: 'reject', tribe })}
                  showActions={status === 'pending' || status === 'all'}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.total_pages > 1 && (
              <div className="tribes-management__pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!pagination.has_prev}
                  className="tribes-management__pagination-btn"
                >
                  ◀ Précédent
                </button>
                <span className="tribes-management__pagination-info">
                  Page {pagination.current_page} sur {pagination.total_pages}
                  <span className="tribes-management__pagination-count">
                    ({pagination.total_count} tribu{pagination.total_count > 1 ? 's' : ''})
                  </span>
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!pagination.has_next}
                  className="tribes-management__pagination-btn"
                >
                  Suivant ▶
                </button>
              </div>
            )}
          </>
        )}

        {/* Confirmation Modal */}
        {confirmAction && (
          <div className="tribes-management__modal-overlay" onClick={() => !actionLoading && setConfirmAction(null)}>
            <div className="tribes-management__modal" onClick={(e) => e.stopPropagation()}>
              <div className="tribes-management__modal-header">
                <h2>
                  {confirmAction.type === 'approve' ? '✓ Approuver la tribu' : '✗ Rejeter la tribu'}
                </h2>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="tribes-management__modal-close"
                  disabled={actionLoading}
                >
                  ✕
                </button>
              </div>

              <div className="tribes-management__modal-body">
                <div className="tribes-management__modal-tribe-info">
                  <h3>{confirmAction.tribe.name}</h3>
                  <p>
                    Créée par <strong>{confirmAction.tribe.owner.username}</strong>
                  </p>
                  {confirmAction.tribe.description && (
                    <p className="tribes-management__modal-description">
                      {confirmAction.tribe.description}
                    </p>
                  )}
                </div>

                {confirmAction.type === 'approve' ? (
                  <p className="tribes-management__modal-confirm-text">
                    Êtes-vous sûr de vouloir <strong className="tribes-management__modal-approve-text">approuver</strong> cette tribu ?
                    Elle sera visible publiquement et les membres pourront la rejoindre.
                  </p>
                ) : (
                  <>
                    <p className="tribes-management__modal-confirm-text">
                      Êtes-vous sûr de vouloir <strong className="tribes-management__modal-reject-text">rejeter</strong> cette tribu ?
                      Elle sera définitivement supprimée.
                    </p>
                    <div className="tribes-management__modal-input-group">
                      <label htmlFor="rejection-reason">Raison du rejet (optionnel) :</label>
                      <textarea
                        id="rejection-reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Ex: Nom inapproprié, contenu offensant..."
                        disabled={actionLoading}
                        rows={3}
                      />
                    </div>
                  </>
                )}

                {actionError && (
                  <div className="tribes-management__modal-error">
                    <span>⚠️</span> {actionError}
                  </div>
                )}
              </div>

              <div className="tribes-management__modal-actions">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={actionLoading}
                  className="tribes-management__modal-btn tribes-management__modal-btn--cancel"
                >
                  Annuler
                </button>
                <button
                  onClick={() =>
                    confirmAction.type === 'approve'
                      ? handleApprove(confirmAction.tribe.id)
                      : handleReject(confirmAction.tribe.id)
                  }
                  disabled={actionLoading}
                  className={`tribes-management__modal-btn tribes-management__modal-btn--${confirmAction.type}`}
                >
                  {actionLoading ? (
                    <>
                      <span className="tribes-management__modal-spinner"></span>
                      Traitement...
                    </>
                  ) : confirmAction.type === 'approve' ? (
                    <>✓ Confirmer l'approbation</>
                  ) : (
                    <>✗ Confirmer le rejet</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default TribesManagement;
