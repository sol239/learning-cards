<script setup>
import { ref } from 'vue';
import { navigateTo } from '#app'; // Import pro Nuxt 3 navigaci

// Import all deck files from the assets/decks directory
const deckModules = import.meta.glob('~/assets/decks/*.json', { eager: true });
const decks = ref([]);

try {
  // Create an array of deck data from the imported modules
  decks.value = Object.values(deckModules).map((module, index) => { // Index jako záloha pro logování/debug
    const deckData = module.default?.deck; // Získáme celý objekt decku

    if (!deckData || !deckData.id) {
      console.warn(`Deck data or ID missing in one of the JSON files (module index: ${index}). Skipping.`);
      // Můžete vrátit null nebo prázdný objekt a odfiltrovat později, nebo zde vyhodit chybu
      return null; // Nebo nějaký placeholder objekt, pokud chcete zachovat pořadí
    }

    return {
      // Použijeme přímo ID z JSON souboru
      id: deckData.id,
      name: deckData.name || 'Untitled Deck',
      questions: deckData.questions || {}
      // Můžete přidat i další vlastnosti z deckData, pokud je potřebujete
      // tags: deckData.tags || [],
    };
  }).filter(deck => deck !== null); // Odfiltrujeme případné neúspěšně načtené decky

} catch (error) {
  console.error('Error processing loaded decks:', error);
}

// Log the decks for debugging
console.log('Loaded decks:', decks.value);

// Metoda pro zvýšení úrovně buňky
// Používá deckIndex pro rychlý přístup k poli a questionValueIndex pro přístup k hodnotě otázky
function increaseLevel(deckIndex, questionValueIndex) {
  const deck = decks.value[deckIndex];
  if (!deck || !deck.questions) return;

  const questions = deck.questions;
  // Získáme klíče, abychom mohli přistupovat k otázce v původním objektu
  const questionKeys = Object.keys(questions);
  // Najdeme klíč odpovídající indexu hodnoty z Object.values()
  const questionKey = questionKeys[questionValueIndex];


  if (questionKey && questions[questionKey]) {
    // Pokud level není definován, nastavíme ho na 0
    if (questions[questionKey].level === undefined) {
      questions[questionKey].level = 0;
    }

    // Zvýšíme level o 1 a zajistíme cyklování 0-5
    questions[questionKey].level = (questions[questionKey].level + 1) % 6;

    console.log(`Increased level for question key ${questionKey} in deck ${deck.name} (ID: ${deck.id}) to ${questions[questionKey].level}`);
  } else {
     console.warn(`Question not found for deckIndex ${deckIndex} and questionValueIndex ${questionValueIndex}`);
  }
}

// Metoda pro navigaci na stránku studia decku
// Přijímá unikátní deck.id
function navigateToStudy(deckId) {
  if (!deckId) {
      console.error("Cannot navigate to study: deckId is missing.");
      return;
  }
  console.log(`Navigating to study deck with id: ${deckId}`);
  // Použijeme Nuxt funkci navigateTo pro přechod na /decks/{deckId}
  navigateTo(`/decks/${deckId}`);
}

// Metoda pro resetování úrovní všech otázek v decku na 0
// Stále používá deckIndex pro efektivní nalezení decku v poli decks.value
function resetDeck(deckIndex) {
  const deck = decks.value[deckIndex];
  if (!deck || !deck.questions) {
       console.error(`Cannot reset deck: Deck not found at index ${deckIndex}`);
       return;
  }

  console.log(`Resetting levels for deck: ${deck.name} (ID: ${deck.id})`);
  const questions = deck.questions;
  let resetCount = 0;
  Object.keys(questions).forEach(questionKey => {
    if (questions[questionKey]) {
      questions[questionKey].level = 0;
      resetCount++;
    }
  });
   console.log(`Levels reset for ${resetCount} questions in deck: ${deck.name}`);
}
</script>

<template>
  <div class="p-6">
    <div v-for="(deck, deckIndex) in decks" :key="deck.id" class="mb-12">
      <h1 class="text-2xl font-bold mb-4">{{ deck.name }}</h1>

      <div class="flex space-x-2 mb-4"> <UButton icon="i-lucide-book-marked" size="sm" color="primary" variant="solid" @click="navigateToStudy(deck.id)">
          Study
        </UButton>

        <UButton icon="i-lucide-rotate-ccw" size="sm" color="neutral" variant="outline" @click="resetDeck(deckIndex)">
          Reset
        </UButton>
      </div>

      <UCard v-if="Object.keys(deck.questions).length > 0" class="mb-4">
        <div class="heatmap-container">
          <div v-for="(question, questionValueIndex) in Object.values(deck.questions)" :key="questionValueIndex" class="heatmap-cell"
               :class="`heat-${question.level === undefined ? 0 : question.level}`"
               :title="question.front || 'No question text available'"
               @click="increaseLevel(deckIndex, questionValueIndex)" />
        </div>
      </UCard>
       <div v-else class="text-gray-500 italic mb-4">
            No questions found in this deck.
       </div>
    </div>
     <div v-if="decks.length === 0" class="text-center text-gray-600">
        No decks loaded. Check the console for errors.
    </div>
  </div>
</template>

<style scoped>
.heatmap-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20px, 1fr));
  gap: 4px;
  width: 100%;
}

.heatmap-cell {
  width: 20px;
  height: 20px;
  border-radius: 2px;
  cursor: pointer;
  transition: transform 0.1s ease, background-color 0.2s ease;
  user-select: none;
}

.heatmap-cell:hover {
  transform: scale(1.2);
}

/* Barvy zůstávají stejné */
.heat-0 { background-color: #ebedf0; } /* GitHub-like šedá pro 0 */
.heat-1 { background-color: #9be9a8; }
.heat-2 { background-color: #40c463; }
.heat-3 { background-color: #30a14e; }
.heat-4 { background-color: #216e39; }
.heat-5 { background-color: #16442a; } /* Tmavší zelená */

</style>