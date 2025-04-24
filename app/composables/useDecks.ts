// filepath: c:\Users\david_dyn8g78\Documents\Projects\learn\composables\useDecks.ts
import { useState } from '#app';
import type { Deck } from '~/model/Deck'; // Adjust path if needed

export const useDecks = () => {
  // Create a reactive state variable 'decks' initialized as an empty array
  // The key 'decks' ensures this state is shared across the app
  const decks = useState<Deck[]>('decks', () => []);

  // Function to update the decks (optional, but good practice)
  const setDecks = (newDecks: Deck[]) => {
    decks.value = newDecks;
  };

  return {
    decks,
    setDecks,
  };
};