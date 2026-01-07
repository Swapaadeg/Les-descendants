import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { useToast } from '../../contexts/ToastContext';
import TasksModal from '../TasksModal/TasksModal';
import { DEFAULT_AVATAR_IMAGE } from '../../config/api';
import '../../styles/components/header.scss';

const Header = () => {
  const { user } = useAuth();
  const [showTasksModal, setShowTasksModal] = useState(false);
  const { pendingCount, refreshPendingCount } = useTasks();
  const { showToast } = useToast();
  const previousCount = useRef(0);

  // Rafraîchir le compteur de tâches toutes les 30 secondes
  useEffect(() => {
    if (user) {
      refreshPendingCount();
      const interval = setInterval(refreshPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user, refreshPendingCount]);

  // Afficher une notification quand le count augmente
  useEffect(() => {
    if (pendingCount > previousCount.current && previousCount.current > 0) {
      const diff = pendingCount - previousCount.current;
      showToast(
        `🦖 ${diff} nouvelle${diff > 1 ? 's' : ''} tâche${diff > 1 ? 's' : ''} de dinosaure !`,
        'info'
      );
    }
    previousCount.current = pendingCount;
  }, [pendingCount, showToast]);

  return (
    <header className="header">
      <Link to="/" className="header__logo-link">
        <img
          src="/assets/seasonal/winter/logo-hiver.png"
          alt="Arki'Family"
          className="header__logo"
        />
      </Link>
      <img
        src="/assets/seasonal/winter/banner-hiver.png"
        alt="Arki-Family Hiver"
        className="header__banner"
      />

      {user && (
        <button
          className="header__tasks-btn"
          onClick={() => setShowTasksModal(true)}
          aria-label="Tâches de la tribu"
        >
          <span className="header__tasks-icon">📋</span>
          {pendingCount > 0 && (
            <span className="header__tasks-badge">{pendingCount}</span>
          )}
        </button>
      )}

      {user?.is_admin && (
        <Link to="/admin" className="header__admin-link">
          <span className="header__admin-icon">⚙️</span>
          <span className="header__admin-text">Admin</span>
        </Link>
      )}
      {user && (
        <Link to="/profile" className="header__user-avatar">
          <img
            src={user.photo_profil || DEFAULT_AVATAR_IMAGE}
            alt={user.username}
            className="header__user-avatar-img"
          />
        </Link>
      )}

      <TasksModal
        isOpen={showTasksModal}
        onClose={() => setShowTasksModal(false)}
      />
    </header>
  );
};

export default Header;
 
