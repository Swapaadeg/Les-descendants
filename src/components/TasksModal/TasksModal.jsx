import React, { useState, useEffect } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../contexts/ToastContext';
import { getFullImageUrl } from '../../services/api';
import '../../styles/components/tasks-modal.scss';

const TasksModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const { tasks, loading, completeTask, refreshTasks } = useTasks(activeTab);
  const { showToast } = useToast();
  const [processing, setProcessing] = useState(null);

  // Recharger les tâches quand le tab change
  useEffect(() => {
    if (isOpen) {
      refreshTasks();
    }
  }, [activeTab, isOpen]);

  if (!isOpen) return null;

  const handleCompleteTask = async (taskId) => {
    setProcessing(taskId);
    try {
      await completeTask(taskId);
      showToast('✅ Tâche marquée comme terminée !', 'success');
      refreshTasks();
    } catch (error) {
      showToast('❌ Erreur lors de la complétion de la tâche', 'error');
    } finally {
      setProcessing(null);
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

  const getStatLabel = (statName) => {
    const labels = {
      health: 'Vie',
      stamina: 'Endurance',
      oxygen: 'Oxygène',
      food: 'Nourriture',
      weight: 'Poids',
      damage: 'Dégâts',
      crafting: 'Fabrication'
    };
    return labels[statName] || statName;
  };

  return (
    <div className="tasks-modal">
      <div className="tasks-modal__overlay" onClick={onClose} />
      <div className="tasks-modal__content">
        <div className="tasks-modal__header">
          <h2 className="tasks-modal__title">
            <span className="tasks-modal__icon">📋</span>
            Tâches de la tribu
          </h2>
          <button
            className="tasks-modal__close"
            onClick={onClose}
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Navigation par onglets */}
        <div className="tasks-modal__tabs">
          <button
            className={`tasks-modal__tab ${activeTab === 'pending' ? 'tasks-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            <span className="tasks-modal__tab-icon">⏳</span>
            En attente
          </button>
          <button
            className={`tasks-modal__tab ${activeTab === 'completed' ? 'tasks-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            <span className="tasks-modal__tab-icon">✅</span>
            Terminées
          </button>
          <button
            className={`tasks-modal__tab ${activeTab === 'all' ? 'tasks-modal__tab--active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            <span className="tasks-modal__tab-icon">📊</span>
            Toutes
          </button>
        </div>

        <div className="tasks-modal__body">
          {loading ? (
            <div className="tasks-modal__loading">
              <div className="tasks-modal__spinner"></div>
              <p>Chargement des tâches...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="tasks-modal__empty">
              <span className="tasks-modal__empty-icon">
                {activeTab === 'pending' ? '✨' : '📋'}
              </span>
              <p>
                {activeTab === 'pending'
                  ? 'Aucune tâche en attente'
                  : activeTab === 'completed'
                  ? 'Aucune tâche terminée'
                  : 'Aucune tâche'}
              </p>
            </div>
          ) : (
            <div className="tasks-modal__list">
              {tasks.map((task) => (
                <div key={task.id} className={`task-card ${task.status === 'completed' ? 'task-card--completed' : ''}`}>
                  <div className="task-card__header">
                    <div className="task-card__dino">
                      {task.dinoPhoto && (
                        <img
                          src={getFullImageUrl(task.dinoPhoto)}
                          alt={task.dinoSpecies}
                          className="task-card__dino-photo"
                        />
                      )}
                      <div className="task-card__dino-info">
                        <h4 className="task-card__dino-name">{task.dinoSpecies}</h4>
                        <p className="task-card__stat-change">
                          <span className="task-card__stat-label">
                            {getStatLabel(task.statName)}
                            {task.statType === 'mutated' && ' (muté)'}
                          </span>
                          <span className="task-card__stat-values">
                            {task.oldValue} → {task.newValue}
                            <span className={`task-card__stat-diff ${task.newValue > task.oldValue ? 'task-card__stat-diff--positive' : 'task-card__stat-diff--negative'}`}>
                              {task.newValue > task.oldValue ? '+' : ''}{task.newValue - task.oldValue}
                            </span>
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="task-card__footer">
                    <div className="task-card__info">
                      <p className="task-card__created-by">
                        Par <strong>{task.createdBy.username}</strong>
                      </p>
                      <p className="task-card__date">
                        {formatDate(task.createdAt)}
                      </p>
                    </div>

                    {task.status === 'pending' ? (
                      <button
                        className="task-card__complete-btn"
                        onClick={() => handleCompleteTask(task.id)}
                        disabled={processing === task.id}
                      >
                        {processing === task.id ? '⏳' : '✅'} Marquer comme fait
                      </button>
                    ) : (
                      <div className="task-card__completed-info">
                        <span className="task-card__completed-badge">✅ Terminé</span>
                        {task.completedBy && (
                          <p className="task-card__completed-by">
                            par <strong>{task.completedBy.username}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tasks-modal__footer">
          <button
            className="tasks-modal__btn"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TasksModal;
