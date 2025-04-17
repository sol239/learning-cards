<script setup>
import { useRoute } from 'vue-router';
import { ref } from 'vue';
import { navigateTo } from '#app';

// Načti route a získej ID z URL
const route = useRoute();
const deckId = route.params.id;

const deck = ref(null);
const error = ref(null);

// Importuj všechny decky
const deckModules = import.meta.glob('~/assets/decks/*.json', { eager: true });

try {
    const decks = Object.values(deckModules).map(module => module.default?.deck).filter(Boolean);
    deck.value = decks.find(d => d.id === deckId);

    if (!deck.value) {
        error.value = `Deck with ID '${deckId}' not found.`;
    }
} catch (err) {
    console.error('Error loading decks:', err);
    error.value = 'An error occurred while loading the deck.';
}

// Zvýšení levelu otázky (lokálně – neukládá se zatím)
function increaseLevel(questionKey) {
    const question = deck.value?.questions?.[questionKey];
    if (!question) return;

    if (question.level === undefined) question.level = 0;
    question.level = (question.level + 1) % 6;
}

function resetDeckLevels() {
    if (!deck.value || !deck.value.questions) return;

    Object.values(deck.value.questions).forEach(question => {
        question.level = 0;
    });

    console.log(`Levels reset for deck: ${deck.value.name} (ID: ${deck.value.id})`);
}

function goBackToDecks() {
    navigateTo('/decks'); // Nebo '/decks' pokud máš stránku přímo na této adrese
}

const hoveredQuestion = ref(null);

function handleHover(question) {
    hoveredQuestion.value = question;
}

function clearHover() {
    hoveredQuestion.value = null;
}

const items = ref(['Grid', 'List'])
const value = ref('Grid')

// Track which questions have their back side visible
const visibleBacks = ref({})

function toggleBackVisibility(key) {
    if (visibleBacks.value[key]) {
        visibleBacks.value[key] = false
    } else {
        visibleBacks.value[key] = true
    }
}
</script>

<template>
    <div class="p-6">
        <div v-if="error" class="text-red-500 font-semibold">{{ error }}</div>

        <div v-else-if="deck">
            <h1 class="text-3xl font-bold mb-4">{{ deck.name }}</h1>

            <div class="flex items-center gap-4 mb-4">
                <UButton icon="i-lucide-arrow-left" size="sm" color="primary" variant="soft" @click="goBackToDecks">
                    Decks
                </UButton>

                <USelect v-model="value" :items="items" class="w-48" />

                <UButton icon="i-lucide-rotate-ccw" size="sm" color="neutral" variant="outline"
                    @click="resetDeckLevels">
                    Reset
                </UButton>
            </div>

            <div v-if="deck.questions && Object.keys(deck.questions).length > 0">
                <!-- Grid view -->
                <UCard class="mb-4" v-if="value === 'Grid'">
                    <div class="heatmap-container">
                        <div v-for="(question, key) in deck.questions" :key="key" class="heatmap-cell"
                            :class="`heat-${question.level || 0}`" :title="question.front" 
                            @click="increaseLevel(key)"
                            @mouseover="handleHover(question)" @mouseleave="clearHover" />
                    </div>
                </UCard>

                <!-- List view -->
                <div v-else class="question-list">
                    <UCard v-for="(question, key) in deck.questions" :key="key" class="mb-3">
                        <div class="flex items-start">
                            <div class="flex-1">
                                <div class="font-semibold mb-2">{{ question.front }}</div>
                                
                                <div v-if="visibleBacks[key]" class="mt-2 pt-2 border-t border-gray-200">
                                    <div class="text-gray-700">{{ question.back }}</div>
                                </div>
                            </div>
                            
                            <div class="flex flex-col items-end space-y-2 ml-4">
                                <div class="heatmap-cell-list" 
                                    :class="`heat-${question.level || 0}`"
                                    @click="increaseLevel(key)" />
                                
                                <UButton  size="sm" color="neutral" variant="outline" 
                                    :icon="visibleBacks[key] ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                                    @click="toggleBackVisibility(key)">
                                    {{ visibleBacks[key] ? 'Hide' : 'Show' }}
                                </UButton>
                            </div>
                        </div>
                    </UCard>
                </div>
            </div>

            <div v-else class="text-gray-500 italic">No questions in this deck.</div>
        </div>

        <div class="flex gap-4 mt-6" v-if="value === 'Grid'">
            <UCard class="w-1/2 min-h-[100px]">
                <template #header>
                    <div class="font-semibold text-lg">Front</div>
                </template>
                <div>
                    <p v-if="hoveredQuestion">{{ hoveredQuestion.front }}</p>
                    <p v-else class="text-gray-400 italic">Najetím na otázku zobrazíš její front.</p>
                </div>
            </UCard>

            <UCard class="w-1/2 min-h-[100px]">
                <template #header>
                    <div class="font-semibold text-lg">Back</div>
                </template>
                <div>
                    <p v-if="hoveredQuestion">{{ hoveredQuestion.back }}</p>
                    <p v-else class="text-gray-400 italic">Najetím na otázku zobrazíš její back.</p>
                </div>
            </UCard>
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

.heatmap-cell-list {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;
    transition: transform 0.1s ease, background-color 0.2s ease;
}

.heatmap-cell-list:hover {
    transform: scale(1.1);
}

.question-list {
    max-height: 600px;
    overflow-y: auto;
    padding-right: 4px;
}

.heat-0 {
    background-color: #ebedf0;
}

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