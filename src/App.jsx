import { useState } from 'react';
import Header from './components/Header';
import DinoForm from './components/DinoForm';
import DinoList from './components/DinoList';
import { useDinosaurs } from './hooks/useDinosaurs';
import './styles/main.scss';
import './App.scss';

function App() {
  const { dinos, loading, error, addDinosaur, updateDinosaur, deleteDinosaur } = useDinosaurs();
  const [showForm, setShowForm] = useState(false);

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
      <div className="app">
        <Header />
        <main className="app__main">
          <div className="container">
            <div className="app__loading">
              <div className="app__loading-spinner"></div>
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
      <div className="app">
        <Header />
        <main className="app__main">
          <div className="container">
            <div className="app__error">
              <h2>Erreur de connexion à la base de données</h2>
              <p>{error}</p>
              <p>Vérifiez votre configuration Supabase dans le fichier .env.local</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <main className="app__main">
        <div className="container">
          {/* Bouton toggle formulaire */}
          <div className="app__actions">
            <button
              className={`app__toggle-btn ${showForm ? 'app__toggle-btn--active' : ''}`}
              onClick={() => setShowForm(!showForm)}
            >
              <span className="app__toggle-icon">{showForm ? '✕' : '➕'}</span>
              <span>{showForm ? 'Fermer le formulaire' : 'Ajouter un dinosaure'}</span>
            </button>
          </div>

          {/* Formulaire */}
          {showForm && (
            <div className="app__form-container">
              <DinoForm onAddDino={handleAddDino} existingDinos={dinos} />
            </div>
          )}

          {/* Liste des dinosaures */}
          <div className="app__list-container">
            <DinoList
              dinos={dinos}
              onUpdateDino={handleUpdateDino}
              onDeleteDino={handleDeleteDino}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="app__footer">
        <div className="container">
          <p className="app__footer-text">
            Made with ❤️ for ARK: Survival Ascended
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
