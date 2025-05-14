<script setup>
import { ref, onMounted, onUnmounted } from 'vue'; // Added onUnmounted
import { navigateTo } from '#app';

import { DropboxHandler } from '~/model/Dropbox';

import { useDecks } from '~/composables/useDecks'; // Import the shared state composable
const { decks } = useDecks(); // Use 'decks' directly from the composable


// Removed the try...catch block for local loading

function increaseLevel(deckIndex, questionValueIndex) {
  // Access the shared state using .value
  const deck = decks.value[deckIndex];
  if (!deck || !deck.cards) {
    console.warn(`Deck or questions not found at index ${deckIndex}`);
    return;
  }

  const cards = deck.cards;
  // Get keys to access the specific question by its original key, using the index from Object.values
  const questionKeys = Object.keys(cards);
  if (questionValueIndex < 0 || questionValueIndex >= questionKeys.length) {
    console.warn(`Invalid questionValueIndex: ${questionValueIndex}`);
    return;
  }
  const questionKey = questionKeys[questionValueIndex]; // Get key based on index

  if (questionKey && cards[questionKey]) {
    // Initialize level if undefined
    if (cards[questionKey].level === undefined || cards[questionKey].level === null) {
      cards[questionKey].level = 0;
    }
    // Mutate the level directly on the shared state object
    cards[questionKey].level = (cards[questionKey].level + 1) % 6; // Cycle through 0-5
    console.log(`Increased level for question key ${questionKey} in deck ${deck.name} (ID: ${deck.id}) to ${cards[questionKey].level}`);
    decks.value = [...decks.value]; // Trigger reactivity (if needed)
    // Note: Direct mutation is okay for simple cases with useState, but for complex logic,
    const dh = new DropboxHandler(); // Initialize DropboxHandler

    dh.saveDeckToDropbox(deck).then(() => {
      console.log(`Deck ${deck.name} saved successfully after level increase.`);
    }).catch((error) => {
      console.error(`Error saving deck ${deck.name}:`, error);
    });


    // consider adding update functions to the useDecks composable.
  } else {
    console.warn(`Question not found for key ${questionKey} derived from index ${questionValueIndex}`);
  }
}

function navigateToStudy(deckId) {
  if (!deckId) {
    console.error("Cannot navigate to study: deckId is missing.");
    return;
  }
  console.log(`Navigating to study deck with id: ${deckId}`);
  navigateTo(`/decks/${deckId}`); // Ensure this route exists
}

function navigateToCreateDeck() {
  console.log("Navigating to create deck page.");
  navigateTo('/decks/create');
}

// Example keydown listener (consider if still needed)
function keyDownAction(event) {
  console.log(`Key pressed: ${event.key}`);
  // Add specific key handling logic here if required
}

function resetDeck(deckIndex) {

  // print all decks to console
  console.log(decks.value);

  // Access the shared state using .value
  const deck = decks.value[deckIndex];
  if (!deck || !deck.cards) {
    console.error(`Cannot reset deck: Deck not found at index ${deckIndex}`);
    return;
  }
  console.log(`Resetting levels for deck: ${deck.name} (ID: ${deck.id})`);
  const cards = deck.cards;
  let resetCount = 0;
  Object.keys(cards).forEach(questionKey => {
    if (cards[questionKey]) {
      // Mutate the level directly
      cards[questionKey].level = 0;
      resetCount++;
    }
  });

  const dh = new DropboxHandler(); // Initialize DropboxHandler

  dh.saveDeckToDropbox(deck).then(() => {
    console.log(`Deck ${deck.name} saved successfully after reset.`);
  }).catch((error) => {
    console.error(`Error saving deck ${deck.name}:`, error);
  });

  console.log(`Levels reset for ${resetCount} questions in deck: ${deck.name}`);
}

async function confirmDelete(deckIndex) {
  const deck = decks.value[deckIndex];
  if (!deck) {
    console.error(`Cannot delete deck: Deck not found at index ${deckIndex}`);
    return;
  }

  // Use the browser's confirm dialog
  const confirmed = window.confirm(`Are you sure you want to delete the deck "${deck.name || 'Untitled Deck'}"? This action cannot be undone.`);

  if (confirmed) {
    console.log(`Attempting to delete deck: ${deck.name} (ID: ${deck.id})`);
    try {
      const dh = new DropboxHandler();
      // Assuming DropboxHandler has a deleteDeckFromDropbox method
      // You might need to implement this method in your DropboxHandler class
      await dh.deleteDeckFromDropbox(deck); // Pass the whole deck or just the ID/filename
      console.log(`Deck ${deck.name} deleted successfully from Dropbox.`);

      // Remove the deck from the local state
      decks.value.splice(deckIndex, 1);
      console.log(`Deck ${deck.name} removed from local state.`);

    } catch (error) {
      console.error(`Error deleting deck ${deck.name}:`, error);
      // Optionally, show an error message to the user
      alert(`Failed to delete deck "${deck.name}". Please check the console for details.`);
    }
  } else {
    console.log(`Deletion cancelled for deck: ${deck.name}`);
  }
}

onMounted(() => {
  // Add the keydown listener

  window.addEventListener('keydown', keyDownAction);
});

onUnmounted(() => {
  // Clean up the listener when the component is destroyed
  window.removeEventListener('keydown', keyDownAction);
});

</script>

<template>



  <div class="p-6">
    <div class="flex space-x-2 mb-6">
      <UButton icon="i-lucide-plus" size="sm" color="primary" variant="solid" aria-label="Create New Deck" @click="navigateToCreateDeck"></UButton>
      <UButton icon="i-lucide-upload" size="sm" color="primary" variant="outline" aria-label="Import Deck"></UButton> 
      <UButton icon="i-lucide-settings" size="sm" color="gray" variant="ghost" aria-label="Settings"></UButton> 
    </div>
    
    <!-- Iterate over the shared 'decks' ref -->
    <div v-for="(deck, deckIndex) in decks" :key="deck.id || deckIndex" class="mb-12"> <!-- Added fallback key -->
      <h1 class="text-2xl font-bold mb-4">{{ deck.name || 'Untitled Deck' }}</h1>

      <div class="flex space-x-2 mb-4">
        <UButton icon="i-lucide-book-marked" size="sm" color="primary" variant="solid" :disabled="!deck.id"
          @click="navigateToStudy(deck.id)">
          Study
        </UButton>

        <UButton icon="i-lucide-rotate-ccw" size="sm" color="neutral" variant="outline" @click="resetDeck(deckIndex)">
          Reset Levels
        </UButton>

        <UButton icon="i-lucide-trash-2" size="sm" color="secondary" variant="outline"
          @click="confirmDelete(deckIndex)">
          Delete
        </UButton>
      </div>

      <!-- Check if questions exist and is an object with keys -->
      <UCard v-if="deck.cards && typeof deck.cards === 'object' && Object.keys(deck.cards).length > 0" class="mb-4">
        <div class="heatmap-container">
          <!-- Iterate over question *values*. Use index as key if question itself lacks unique ID -->
          <div v-for="(question, questionValueIndex) in Object.values(deck.cards)" :key="questionValueIndex"
            class="heatmap-cell"
            :class="`heat-${question.level === undefined || question.level === null ? 0 : question.level}`"
            :title="`${Object.keys(deck.cards)[questionValueIndex]}: ${question.front || 'No front text'}\nLevel: ${question.level === undefined || question.level === null ? 0 : question.level}`"
            @click="increaseLevel(deckIndex, questionValueIndex)" />
        </div>
      </UCard>
      <div v-else class="text-gray-500 italic mb-4">
        No questions found in this deck or questions data is invalid.
      </div>
    </div>
    <!-- Check the shared 'decks' ref for length -->
    <div v-if="!decks || decks.length === 0" class="text-center text-gray-600 mt-8">
      No decks loaded. Please log in via Dropbox in the navigation bar.
    </div>
  </div>
</template>

<style scoped>
.heatmap-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20px, 1fr));
  gap: 4px;
  width: 100%;
  padding: 5px;
  /* Add some padding inside the card */
}

.heatmap-cell {
  width: 20px;
  height: 20px;
  border-radius: 3px;
  /* Slightly more rounded */
  border: 1px solid rgba(0, 0, 0, 0.05);
  /* Subtle border */
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.2s ease;
  user-select: none;
  /* Prevent text selection on click */
  display: flex;
  /* For potential future content inside cell */
  align-items: center;
  justify-content: center;
}

.heatmap-cell:hover {
  transform: scale(1.15);
  /* Slightly larger hover effect */
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  /* Add shadow on hover */
  z-index: 1;
  /* Ensure hovered cell is on top */
}

/* Heatmap Colors (GitHub-like) */
.heat-0 {
  background-color: #ebedf0;
}

/* Default/Level 0 */
.heat-1 {
  background-color: #9be9a8;
}

/* Level 1 */
.heat-2 {
  background-color: #40c463;
}

/* Level 2 */
.heat-3 {
  background-color: #30a14e;
}

/* Level 3 */
.heat-4 {
  background-color: #216e39;
}

/* Level 4 */
.heat-5 {
  background-color: #16442a;
}

/* Level 5 */

/* Add styles for buttons if needed */
.flex.space-x-2>* {
  margin-right: 0.5rem;
  /* Ensure spacing works */
}

.flex.space-x-2>*:last-child {
  margin-right: 0;
}
</style>