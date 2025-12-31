import React, { useState } from 'react';
import '../../styles/components/tribe-members-modal.scss';

const TribeMembersModal = ({
  isOpen,
  onClose,
  tribe,
  requests,
  onAccept,
  onReject,
  onKickMember,
  onRenameTribe,
  onLeaveTribe,
  onDeleteTribe,
  onTransferOwnership
}) => {
  const [processing, setProcessing] = useState(null);
  const [activeTab, setActiveTab] = useState('members');
  const [newTribeName, setNewTribeName] = useState('');
  const [newTribeDescription, setNewTribeDescription] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedNewOwner, setSelectedNewOwner] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  if (!isOpen) return null;

  const isOwner = tribe?.user_role === 'owner';
  const members = tribe?.members || [];

  const handleAccept = async (requestId) => {
    setProcessing(requestId);
    try {
      await onAccept(requestId);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessing(requestId);
    try {
      await onReject(requestId);
    } finally {
      setProcessing(null);
    }
  };

  const handleKick = async (memberId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir expulser ce membre ?')) return;

    setProcessing(memberId);
    try {
      await onKickMember(memberId);
    } finally {
      setProcessing(null);
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!newTribeName.trim() && !newTribeDescription.trim()) return;

    setIsRenaming(true);
    try {
      const updates = {};
      if (newTribeName.trim()) updates.name = newTribeName.trim();
      if (newTribeDescription.trim()) updates.description = newTribeDescription.trim();

      await onRenameTribe(updates);
      setNewTribeName('');
      setNewTribeDescription('');
      onClose();
    } finally {
      setIsRenaming(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir quitter cette tribu ? Vous devrez demander à rejoindre à nouveau.')) return;

    setIsLeaving(true);
    try {
      await onLeaveTribe();
      onClose();
    } finally {
      setIsLeaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmation = window.confirm(
      '⚠️ ATTENTION : Vous allez SUPPRIMER DÉFINITIVEMENT cette tribu.\n\n' +
      'Cette action est IRRÉVERSIBLE et supprimera :\n' +
      '- Tous les membres de la tribu\n' +
      '- Tous les dinosaures associés\n' +
      '- Toutes les personnalisations\n\n' +
      'Êtes-vous ABSOLUMENT SÛR de vouloir continuer ?'
    );

    if (!confirmation) return;

    // Double confirmation pour plus de sécurité
    const finalConfirmation = window.confirm(
      '🔴 DERNIÈRE CONFIRMATION\n\n' +
      `Tapez OK pour supprimer définitivement la tribu "${tribe?.name}".\n\n` +
      'Cette action ne peut PAS être annulée.'
    );

    if (!finalConfirmation) return;

    setIsDeleting(true);
    try {
      await onDeleteTribe();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTransferOwnership = async (e) => {
    e.preventDefault();
    if (!selectedNewOwner) return;

    const selectedMember = members.find(m => m.user_id === parseInt(selectedNewOwner));

    if (!selectedMember) return;

    const confirmation = window.confirm(
      `⚠️ ATTENTION : Vous allez transférer la propriété de la tribu à ${selectedMember.username}.\n\n` +
      'Après cette action :\n' +
      '- Vous deviendrez un membre normal\n' +
      `- ${selectedMember.username} deviendra le nouveau chef\n` +
      '- Vous pourrez alors quitter la tribu si vous le souhaitez\n\n' +
      'Êtes-vous sûr de vouloir continuer ?'
    );

    if (!confirmation) return;

    setIsTransferring(true);
    try {
      await onTransferOwnership(parseInt(selectedNewOwner));
      setSelectedNewOwner('');
      onClose();
    } finally {
      setIsTransferring(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="tribe-members-modal">
      <div className="tribe-members-modal__overlay" onClick={onClose} />
      <div className="tribe-members-modal__content">
        <div className="tribe-members-modal__header">
          <h2 className="tribe-members-modal__title">
            <span className="tribe-members-modal__icon">👥</span>
            Gestion de la tribu
          </h2>
          <button
            className="tribe-members-modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Navigation par onglets */}
        <div className="tribe-members-modal__tabs">
          <button
            className={`tribe-members-modal__tab ${activeTab === 'members' ? 'tribe-members-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            <span className="tribe-members-modal__tab-icon">👥</span>
            Membres
          </button>
          <button
            className={`tribe-members-modal__tab ${activeTab === 'requests' ? 'tribe-members-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            <span className="tribe-members-modal__tab-icon">📬</span>
            Demandes
            {requests.length > 0 && (
              <span className="tribe-members-modal__badge">{requests.length}</span>
            )}
          </button>
          <button
            className={`tribe-members-modal__tab ${activeTab === 'settings' ? 'tribe-members-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="tribe-members-modal__tab-icon">⚙️</span>
            Paramètres
          </button>
        </div>

        <div className="tribe-members-modal__body">
          {/* Onglet Membres */}
          {activeTab === 'members' && (
            <div className="tribe-members-modal__members">
              <h3 className="tribe-members-modal__subtitle">
                Membres de la tribu ({members.length})
              </h3>
              {members.length === 0 ? (
                <div className="tribe-members-modal__empty">
                  <span className="tribe-members-modal__empty-icon">👥</span>
                  <p>Aucun membre dans cette tribu</p>
                </div>
              ) : (
                <div className="tribe-members-modal__list">
                  {members.map((member) => (
                    <div key={member.user_id} className="tribe-member">
                      <div className="tribe-member__info">
                        <span className="tribe-member__avatar">
                          {member.role === 'owner' ? '👑' : '👤'}
                        </span>
                        <div>
                          <h4 className="tribe-member__username">
                            {member.username}
                            {member.role === 'owner' && (
                              <span className="tribe-member__role"> (Chef)</span>
                            )}
                          </h4>
                          <p className="tribe-member__date">
                            Membre depuis le {formatDate(member.joined_at)}
                          </p>
                        </div>
                      </div>
                      {member.role !== 'owner' && (
                        <button
                          className="tribe-member__kick-btn"
                          onClick={() => handleKick(member.id)}
                          disabled={processing === member.id}
                        >
                          {processing === member.id ? '⏳' : '🚫'} Expulser
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglet Demandes */}
          {activeTab === 'requests' && (
            <div className="tribe-members-modal__requests">
              <h3 className="tribe-members-modal__subtitle">
                Demandes en attente ({requests.length})
              </h3>
              {requests.length === 0 ? (
                <div className="tribe-members-modal__empty">
                  <span className="tribe-members-modal__empty-icon">✅</span>
                  <p>Aucune demande en attente</p>
                </div>
              ) : (
                <div className="tribe-members-modal__list">
                  {requests.map((request) => (
                    <div key={request.id} className="tribe-request">
                      <div className="tribe-request__header">
                        <div className="tribe-request__user">
                          <span className="tribe-request__avatar">👤</span>
                          <div>
                            <h4 className="tribe-request__username">
                              {request.username}
                            </h4>
                            <p className="tribe-request__email">{request.email}</p>
                          </div>
                        </div>
                        <span className="tribe-request__date">
                          {formatDate(request.requested_at)}
                        </span>
                      </div>

                      {request.request_message && (
                        <div className="tribe-request__message">
                          <strong>Pseudo ARK:</strong> {request.request_message}
                        </div>
                      )}

                      <div className="tribe-request__actions">
                        <button
                          className="tribe-request__btn tribe-request__btn--accept"
                          onClick={() => handleAccept(request.id)}
                          disabled={processing === request.id}
                        >
                          {processing === request.id ? '⏳' : '✅'} Accepter
                        </button>
                        <button
                          className="tribe-request__btn tribe-request__btn--reject"
                          onClick={() => handleReject(request.id)}
                          disabled={processing === request.id}
                        >
                          {processing === request.id ? '⏳' : '❌'} Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Onglet Paramètres */}
          {activeTab === 'settings' && (
            <div className="tribe-members-modal__settings">
              <h3 className="tribe-members-modal__subtitle">Paramètres de la tribu</h3>

              {/* Modifier la tribu */}
              <form onSubmit={handleRename} className="tribe-rename-form">
                <label className="tribe-rename-form__label">
                  Nom de la tribu
                </label>
                <input
                  type="text"
                  className="tribe-rename-form__input"
                  placeholder={tribe?.name || 'Nouveau nom'}
                  value={newTribeName}
                  onChange={(e) => setNewTribeName(e.target.value)}
                  disabled={isRenaming}
                  maxLength={50}
                />

                <label className="tribe-rename-form__label">
                  Description de la tribu
                </label>
                <textarea
                  className="tribe-rename-form__textarea"
                  placeholder={tribe?.description || 'Description de la tribu'}
                  value={newTribeDescription}
                  onChange={(e) => setNewTribeDescription(e.target.value)}
                  disabled={isRenaming}
                  maxLength={500}
                  rows={4}
                />

                <button
                  type="submit"
                  className="tribe-rename-form__btn"
                  disabled={isRenaming || (!newTribeName.trim() && !newTribeDescription.trim())}
                >
                  {isRenaming ? '⏳ Mise à jour...' : '💾 Mettre à jour'}
                </button>
              </form>

              {/* Transférer la propriété (owner uniquement) */}
              {isOwner && members.length > 1 && (
                <div className="tribe-transfer-ownership">
                  <h4 className="tribe-transfer-ownership__title">
                    <span className="tribe-transfer-ownership__icon">👑</span>
                    Transférer la propriété
                  </h4>
                  <p className="tribe-transfer-ownership__description">
                    Vous pouvez désigner un nouveau chef pour la tribu. Vous deviendrez ensuite un membre normal.
                  </p>
                  <form onSubmit={handleTransferOwnership} className="tribe-transfer-ownership__form">
                    <label className="tribe-transfer-ownership__label">
                      Choisir le nouveau chef
                    </label>
                    <select
                      className="tribe-transfer-ownership__select"
                      value={selectedNewOwner}
                      onChange={(e) => setSelectedNewOwner(e.target.value)}
                      disabled={isTransferring}
                    >
                      <option value="">-- Sélectionner un membre --</option>
                      {members
                        .filter(member => member.role !== 'owner')
                        .map(member => (
                          <option key={member.user_id} value={member.user_id}>
                            {member.username}
                          </option>
                        ))}
                    </select>
                    <button
                      type="submit"
                      className="tribe-transfer-ownership__btn"
                      disabled={isTransferring || !selectedNewOwner}
                    >
                      {isTransferring ? '⏳ Transfert en cours...' : '👑 Transférer la propriété'}
                    </button>
                  </form>
                </div>
              )}

              {/* Zone dangereuse */}
              <div className="tribe-danger-zone">
                <h4 className="tribe-danger-zone__title">⚠️ Zone dangereuse</h4>

                {!isOwner && (
                  <div className="tribe-danger-zone__action">
                    <div className="tribe-danger-zone__info">
                      <h5>Quitter la tribu</h5>
                      <p>Vous serez retiré de la tribu et devrez demander à rejoindre à nouveau.</p>
                    </div>
                    <button
                      className="tribe-danger-zone__btn tribe-danger-zone__btn--warning"
                      onClick={handleLeave}
                      disabled={isLeaving}
                    >
                      {isLeaving ? '⏳ En cours...' : '🚪 Quitter la tribu'}
                    </button>
                  </div>
                )}

                {isOwner && (
                  <div className="tribe-danger-zone__action">
                    <div className="tribe-danger-zone__info">
                      <h5>Supprimer la tribu</h5>
                      <p>⚠️ Supprime définitivement la tribu, tous les membres et tous les dinosaures. Cette action est irréversible.</p>
                    </div>
                    <button
                      className="tribe-danger-zone__btn tribe-danger-zone__btn--danger"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? '⏳ Suppression...' : '🗑️ Supprimer définitivement'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="tribe-members-modal__footer">
          <button
            className="tribe-members-modal__btn"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TribeMembersModal;
