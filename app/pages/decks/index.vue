<script setup>
import { ref, onMounted } from 'vue';
import { navigateTo } from '#app'; // Import pro Nuxt 3 navigaci

const deckModules = import.meta.glob('~/assets/decks/*.json', { eager: true });
const decks = Object.values(deckModules).map((module) => module.default);
const decksRef = ref([]);


try {
  decksRef.value = Object.values(deckModules).map((module, index) => { 
    const deckData = module.default?.deck;

    if (!deckData || !deckData.id) {
      console.warn(`Deck data or ID missing in one of the JSON files (module index: ${index}). Skipping.`);
      return null;
    }

    return {
      id: deckData.id,
      name: deckData.name || 'Untitled Deck',
      questions: deckData.questions || {}
    };
  }).filter(deck => deck !== null);

} catch (error) {
  console.error('Error processing loaded decks:', error);
}

console.log('Loaded decks:', decksRef.value);


function increaseLevel(deckIndex, questionValueIndex) {
  const deck = decksRef.value[deckIndex];
  if (!deck || !deck.questions) return;

  const questions = deck.questions;
  const questionKeys = Object.keys(questions);
  const questionKey = questionKeys[questionValueIndex];


  if (questionKey && questions[questionKey]) {
    if (questions[questionKey].level === undefined) {
      questions[questionKey].level = 0;
    }
    questions[questionKey].level = (questions[questionKey].level + 1) % 6;
    console.log(`Increased level for question key ${questionKey} in deck ${deck.name} (ID: ${deck.id}) to ${questions[questionKey].level}`);
  } else {
    console.warn(`Question not found for deckIndex ${deckIndex} and questionValueIndex ${questionValueIndex}`);
  }
}

function navigateToStudy(deckId) {
  if (!deckId) {
    console.error("Cannot navigate to study: deckId is missing.");
    return;
  }
  console.log(`Navigating to study deck with id: ${deckId}`);
  navigateTo(`/decks/${deckId}`);
}

function keyDownAction(event) {
  console.log(event.key);
}

function resetDeck(deckIndex) {
  const deck = decksRef.value[deckIndex];
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

onMounted(() => {
  window.addEventListener('keydown', keyDownAction);
})

</script>

<template>
  <div class="p-6">
    <div v-for="(deck, deckIndex) in decksRef" :key="deck.id" class="mb-12">
      <h1 class="text-2xl font-bold mb-4">{{ deck.name }}</h1>

      <div class="flex space-x-2 mb-4">
        <UButton icon="i-lucide-book-marked" size="sm" color="primary" variant="solid"
          @click="navigateToStudy(deck.id)">
          Study
        </UButton>

        <UButton icon="i-lucide-rotate-ccw" size="sm" color="neutral" variant="outline" @click="resetDeck(deckIndex)">
          Reset
        </UButton>
      </div>

      <UCard v-if="Object.keys(deck.questions).length > 0" class="mb-4">
        <div class="heatmap-container">
          <div v-for="(question, questionValueIndex) in Object.values(deck.questions)" :key="questionValueIndex"
            class="heatmap-cell" :class="`heat-${question.level === undefined ? 0 : question.level}`"
            :title="question.front || 'No question text available'"
            @click="increaseLevel(deckIndex, questionValueIndex)" />
        </div>
      </UCard>
      <div v-else class="text-gray-500 italic mb-4">
        No questions found in this deck.
      </div>
    </div>
    <div v-if="decksRef.length === 0" class="text-center text-gray-600">
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
.heat-0 {
  background-color: #ebedf0;
}

/* GitHub-like šedá pro 0 */
.heat-1 {
  background-color: #9be9a8;
}

.heat-2 {
  background-color: #40c463;
}

.heat-3 {
  background-color: #30a14e;
}

.heat-4 {
  background-color: #216e39;
}

.heat-5 {
  background-color: #16442a;
}
</style>