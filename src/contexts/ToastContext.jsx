import React, { createContext, useContext, useState } from 'react';
import '../styles/components/toast.scss';

const ToastContext = createContext();

/**
 * Hook pour utiliser le contexte Toast
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé dans un ToastProvider');
  }
  return context;
};

/**
 * Composant Toast individuel
 */
const Toast = ({ id, message, type, onRemove }) => {
  return (
    <div className={`toast toast--${type}`}>
      <div className="toast__content">
        <span className="toast__message">{message}</span>
        <button className="toast__close" onClick={() => onRemove(id)}>
          ×
        </button>
      </div>
      <div className="toast__progress" />
    </div>
  );
};

/**
 * Provider pour gérer les toasts globalement
 */
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-dismiss après 3 secondes
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            {...toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastContext;
