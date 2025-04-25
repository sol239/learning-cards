import { useState } from '#app';
import type { Deck } from '~/model/Deck'; // Adjust path if needed

export const useDecks = () => {
  const decks = useState<Deck[]>('decks', () => []);

  const setDecks = (newDecks: Deck[]) => {
    decks.value = newDecks;
  };

  return {
    decks,
    setDecks,
  };
};