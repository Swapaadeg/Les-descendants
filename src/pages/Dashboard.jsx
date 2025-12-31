import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import DinoForm from '../components/DinoForm';
import DinoList from '../components/DinoList';
import TribeSelector from '../components/TribeSelector';
import { useDinosaurs } from '../hooks/useDinosaurs';
import { tribeAPI } from '../services/api';
import '../styles/pages/dashboard.scss';

function Dashboard() {
  const { dinos, loading, error, addDinosaur, updateDinosaur, deleteDinosaur, refreshDinosaurs } = useDinosaurs();
  const [showForm, setShowForm] = useState(false);
  const [tribe, setTribe] = useState(null);
  const [tribeLoading, setTribeLoading] = useState(true);

  // Charger la tribu de l'utilisateur au montage
  useEffect(() => {
    loadTribe();
  }, []);

  const loadTribe = async () => {
    try {
      setTribeLoading(true);
      const data = await tribeAPI.getMy();
      setTribe(data.tribe);
    } catch (err) {
      console.error('Erreur lors du chargement de la tribu:', err);
      setTribe(null);
    } finally {
      setTribeLoading(false);
    }
  };

  const handleTribeSelected = () => {
    // Recharger la tribu et les dinosaures après création/adhésion
    loadTribe();
    refreshDinosaurs();
  };

  // Si chargement de la tribu en cours
  if (tribeLoading) {
    return (
      <div className="dashboard">
        <Header />
        <main className="dashboard__main">
          <div className="container">
            <div className="dashboard__loading">
              <div className="dashboard__loading-spinner"></div>
              <p>Chargement...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Si l'utilisateur n'a pas de tribu, afficher le sélecteur
  if (!tribe) {
    return (
      <div className="dashboard">
        <Header />
        <TribeSelector onTribeSelected={handleTribeSelected} />
      </div>
    );
  }

  const handleAddDino = async (dinoData) => {
    try {
      await addDinosaur(dinoData);
      setShowForm(false);

      // Scroll vers le bas pour voir le nouveau dino
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 100);
    } catch (error) {
      alert('Erreur lors de l\'ajout du dinosaure: ' + error.message);
    }
  };

  const handleUpdateDino = async (dinoId, updatedData) => {
    try {
      await updateDinosaur(dinoId, updatedData);
    } catch (error) {
      alert('Erreur lors de la mise à jour du dinosaure: ' + error.message);
    }
  };

  const handleDeleteDino = async (dinoId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dinosaure ?')) {
      try {
        await deleteDinosaur(dinoId);
      } catch (error) {
        alert('Erreur lors de la suppression du dinosaure: ' + error.message);
      }
    }
  };

  // Affichage du chargement
  if (loading) {
    return (
      <div className="dashboard">
        <Header />
        <main className="dashboard__main">
          <div className="container">
            <div className="dashboard__loading">
              <div className="dashboard__loading-spinner"></div>
              <p>Chargement des dinosaures...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="dashboard">
        <Header />
        <main className="dashboard__main">
          <div className="container">
            <div className="dashboard__error">
              <h2>Erreur de connexion à la base de données</h2>
              <p>{error}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header />

      {/* Lien vers la page de tribu */}
      {tribe && (
        <div className="dashboard__tribe-link">
          <Link
            to="/tribe"
            className="dashboard__tribe-btn"
            style={{
              '--tribe-primary': tribe.primary_color || '#00f0ff',
              '--tribe-secondary': tribe.secondary_color || '#b842ff'
            }}
          >
            <span className="dashboard__tribe-icon">🏛️</span>
            <span className="dashboard__tribe-name">{tribe.name}</span>
          </Link>
        </div>
      )}

      <main className="dashboard__main">
        <div className="container">
          {/* Bouton toggle formulaire */}
          <div className="dashboard__actions">
            <button
              className={`dashboard__toggle-btn ${showForm ? 'dashboard__toggle-btn--active' : ''}`}
              onClick={() => setShowForm(!showForm)}
            >
              <span className="dashboard__toggle-icon">{showForm ? '✕' : '➕'}</span>
              <span>{showForm ? 'Fermer le formulaire' : 'Ajouter un dinosaure'}</span>
            </button>
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="dashboard__form-container">
              <DinoForm onAddDino={handleAddDino} existingDinos={dinos} />
            </div>
          )}

          {/* Liste des dinosaures */}
          <div className="dashboard__list-container">
            <DinoList
              dinos={dinos}
              onUpdateDino={handleUpdateDino}
              onDeleteDino={handleDeleteDino}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="dashboard__footer">
        <div className="container">
          <p className="dashboard__footer-text">
            Made with ❤️ for ARK: Survival Ascended
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
