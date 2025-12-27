import { useState, useEffect } from 'react';

// Hook personnalisé pour gérer localStorage
export const useLocalStorage = (key, initialValue) => {
  // State pour stocker notre valeur
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Récupérer depuis localStorage
      const item = window.localStorage.getItem(key);
      // Parser le JSON stocké ou retourner initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Erreur lors de la lecture de localStorage:', error);
      return initialValue;
    }
  });

  // Fonction pour sauvegarder dans localStorage
  const setValue = (value) => {
    try {
      // Permettre à value d'être une fonction comme useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Sauvegarder le state
      setStoredValue(valueToStore);

      // Sauvegarder dans localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans localStorage:', error);
    }
  };

  return [storedValue, setValue];
};

// Fonction pour convertir un File en base64
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Fonction pour préparer un dinosaure pour le stockage
export const prepareDinoForStorage = async (dino) => {
  const dinoCopy = { ...dino };

  // Convertir la photo en base64 si c'est un objet File
  if (dinoCopy.photo && dinoCopy.photo instanceof File) {
    try {
      const base64 = await fileToBase64(dinoCopy.photo);
      dinoCopy.photoUrl = base64;
      delete dinoCopy.photo; // Supprimer l'objet File
    } catch (error) {
      console.error('Erreur lors de la conversion de la photo:', error);
      delete dinoCopy.photo;
    }
  }

  return dinoCopy;
};

export default useLocalStorage;
