<script setup>
import { useRoute } from 'vue-router';
import { ref } from 'vue';
import { navigateTo } from '#app';
import { marked } from 'marked';
import { useDecks } from '~/composables/useDecks'; // Import the shared state composable
import { Decks } from '~/model/Decks';
import { Deck } from '~/model/Deck';

// Načti route a získej ID z URL
const route = useRoute();
const deckId = route.params.id;

const error = ref(null);
const showAllBacks = ref(false); // State to control showing all backs
const questionKatexDict = ref(null);
let deckRef = ref(null); // State to hold the current deck

// Importuj všechny decky
const deckModules = import.meta.glob('~/assets/decks/*.json', { eager: true });

const { decks } = useDecks(); // Use 'decks' directly from the composable
console.log('Decks:', decks.value); // Log the loaded decks

// Function to render content and trigger MathJax typesetting
const renderContent = (content) => {
    if (!content) return '';
    return marked.parse(content);
};


try {

    console.log("Deck ID:", deckId); // Log the deck ID being loaded

    for (const deck of decks.value) {
        if (deck.id === deckId) {
            console.log("Found deck:", deck); // Log the found deck
            deckRef.value = deck; // Set the current deck reference
            console.log('Loaded deck:', deckRef.value); // Log the loaded deck
            questionKatexDict.value = getQuestionsKatex(deckRef.value.getCards());
            break;
        }

    }

} catch (err) {
    console.error('Error loading decks:', err);
    error.value = 'An error occurred while loading the deck.';
}

// Zvýšení levelu otázky (lokálně – neukládá se zatím)
function increaseLevel(questionKey) {
    const question = deckRef.value?.cards?.[questionKey];
    if (!question) return;

    if (question.level === undefined) question.level = 0;
    question.level = (question.level + 1) % 6;
}

function resetDeckLevels() {
    if (!deckRef.value || !deckRef.value.cards) return;

    Object.values(deckRef.value.cards).forEach(question => {
        question.level = 0;
    });

    console.log(`Levels reset for deck: ${deckRef.value.name} (ID: ${deckRef.value.id})`);
}

// Toggle visibility of all card backs
function toggleShowAllBacks() {
    showAllBacks.value = !showAllBacks.value;

    // If we're showing backs, update visibleBacks for all questions
    if (showAllBacks.value && deckRef.value && deckRef.value.cards) {
        Object.keys(deckRef.value.cards).forEach(key => {
            visibleBacks.value[key] = true;
        });
        // Trigger MathJax update after showing all backs
        setTimeout(updateMathJax, 100);
    } else {
        // Hide all backs
        visibleBacks.value = {};
    }

    console.log(`Show all backs: ${showAllBacks.value}`);
}

function goBackToDecks() {
    navigateTo('/decks'); // Nebo '/decks' pokud máš stránku přímo na této adrese
}

const hoveredQuestion = ref(null);

function handleHover(question, key) {
    hoveredQuestion.value = { ...question, key };
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
        visibleBacks.value[key] = false;
    } else {
        visibleBacks.value[key] = true;
        // Spusť MathJax po zobrazení obsahu
        setTimeout(updateMathJax, 100);
    }
}

// function for each question create katex using renderContent
function getQuestionsKatex() {
    const katexDictionary = {}; // Correct spelling
    if (deckRef.value && deckRef.value.cards) {
        Object.keys(deckRef.value.cards).forEach(key => {
            const question = deckRef.value.cards[key];
            if (question) {
                const frontKatex = renderContent(question.front);
                const backKatex = renderContent(question.back);
                katexDictionary[key] = { front: frontKatex, back: backKatex };
            }
        });
    }
    return katexDictionary; // Correct spelling
}

onMounted(() => {
    // Add MathJax script
    if (!document.getElementById('mathjax-script')) {
        const script = document.createElement('script');
        script.id = 'mathjax-script';
        script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        script.async = true;
        document.head.appendChild(script);

        // Configure MathJax
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true
            },
            startup: {
                pageReady: () => {
                    // Typeset the page when MathJax is loaded
                    if (window.MathJax.typesetPromise) {
                        window.MathJax.typesetPromise();
                    }
                }
            }
        };

        questionKatexDict.value = getQuestionsKatex();
    }
});

// Function to trigger MathJax typesetting after content updates
const updateMathJax = () => {
    setTimeout(() => {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    }, 100);
};

// Watch for changes to hoveredQuestion to trigger MathJax rendering
watch(() => hoveredQuestion.value, () => {
    updateMathJax();
}, { deep: true });
</script>

<template>
    <div class="p-6">
        <div v-if="error" class="text-red-500 font-semibold">{{ error }}</div>

        <div v-else-if="deckRef">
            <h1 class="text-3xl font-bold mb-4">{{ deckRef.name }}</h1>

            <div class="flex items-center gap-4 mb-4">
                <UButton icon="i-lucide-arrow-left" size="sm" color="primary" variant="soft" @click="goBackToDecks">
                    Decks
                </UButton>

                <USelect v-model="value" :items="items" class="w-48" />

                <UButton icon="i-lucide-rotate-ccw" size="sm" color="neutral" variant="outline"
                    @click="resetDeckLevels">
                    Reset
                </UButton>

                <UButton v-if="value !== 'Grid'" icon="i-lucide-eye" size="sm" color="neutral"
                    :variant="showAllBacks ? 'solid' : 'outline'" @click="toggleShowAllBacks">
                    {{ showAllBacks ? 'Hide All' : 'Show All' }}
                </UButton>
            </div>

            <div v-if="deckRef.cards && Object.keys(deckRef.cards).length > 0">
                <!-- Grid view -->
                <UCard class="mb-4" v-if="value === 'Grid'">
                    <div class="heatmap-container">
                        <div v-for="(question, key) in deckRef.cards" :key="key" class="heatmap-cell"
                            :class="[`heat-${question.level || 0}`, { 'show-back': showAllBacks }]"
                            :title="question.front" @click="increaseLevel(key)" @mouseover="handleHover(question, key)"
                            @mouseleave="clearHover">
                            <div v-if="showAllBacks" class="card-back" v-html="questionKatexDict[key]?.back || ''">
                            </div>
                        </div>
                    </div>
                </UCard>

                <!-- List view -->
                <div v-else class="question-list">
                    <UCard v-for="(question, key) in deckRef.cards" :key="key" class="mb-3 ml-[5px] mt-[5px] ">
                        <div class="flex items-start">
                            <div class="flex-1">
                                <div class="font-semibold mb-2" v-html="questionKatexDict[key]?.front || ''"></div>

                                <div v-if="visibleBacks[key] || showAllBacks"
                                    class="mt-2 pt-2 border-t border-gray-200">
                                    <p class="math-content" v-html="questionKatexDict[key]?.back || ''"></p>
                                </div>
                            </div>

                            <div class="flex flex-row items-center space-x-2 ml-4">
                                <div class="heatmap-cell-list" :class="`heat-${question.level || 0}`"
                                    @click="increaseLevel(key)" />

                                <UButton size="sm" color="neutral" variant="outline"
                                    :icon="(visibleBacks[key] || showAllBacks) ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                                    @click="toggleBackVisibility(key)" :disabled="showAllBacks">
                                    {{ (visibleBacks[key] || showAllBacks) ? 'Hide' : 'Show' }}
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
                    <p v-if="hoveredQuestion && questionKatexDict"
                        v-html="questionKatexDict[hoveredQuestion.key]?.front || ''"></p>
                    <p v-else class="text-gray-400 italic">Najetím na otázku zobrazíš její front.</p>
                </div>
            </UCard>

            <UCard class="w-1/2 min-h-[100px]">
                <template #header>
                    <div class="font-semibold text-lg">Back</div>
                </template>
                <div>
                    <p v-if="hoveredQuestion && questionKatexDict"
                        v-html="questionKatexDict[hoveredQuestion.key]?.back || ''"></p>
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