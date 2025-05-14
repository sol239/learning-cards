<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from '#app'
import { DropboxHandler } from '~/model/Dropbox'
import { useDecks } from '~/composables/useDecks'
import { marked } from 'marked';

const { decks } = useDecks()
const route = useRoute()
const deckId = route.params.id

const error = ref(null)
const showAllBacks = ref(false)
const visibleBacks = ref({})
const hoveredQuestion = ref(null)
const items = ref(['Grid', 'List'])
const value = ref('Grid')

// Find the deck in the shared state
const deck = computed(() => decks.value.find(d => d.id === deckId))

function increaseLevel(questionKey) {
    if (!deck.value || !deck.value.cards) return
    const question = deck.value.cards[questionKey]
    if (!question) return
    if (question.level === undefined) question.level = 0
    question.level = (question.level + 1) % 6

    // Save to Dropbox
    const dh = new DropboxHandler()
    dh.saveDeckToDropbox(deck.value).then(() => {
        console.log(`Deck ${deck.value.name} saved after level increase.`)
    }).catch((error) => {
        console.error(`Error saving deck ${deck.value.name}:`, error)
    })
}

function resetDeckLevels() {
    if (!deck.value || !deck.value.cards) return
    Object.values(deck.value.cards).forEach(q => { q.level = 0 })
    const dh = new DropboxHandler()
    dh.saveDeckToDropbox(deck.value).then(() => {
        console.log(`Deck ${deck.value.name} saved after reset.`)
    }).catch((error) => {
        console.error(`Error saving deck ${deck.value.name}:`, error)
    })
}

function editDeck() {
    if (!deck.value) return
    navigateTo(`/decks/${deck.value.id}/edit`)
}

function goBackToDecks() {
    navigateTo('/decks')
}

function handleHover(question, key) {
    hoveredQuestion.value = { ...question, key }
}

function clearHover() {
    hoveredQuestion.value = null
}

function toggleShowAllBacks() {
    showAllBacks.value = !showAllBacks.value
    if (showAllBacks.value && deck.value && deck.value.cards) {
        Object.keys(deck.value.cards).forEach(key => {
            visibleBacks.value[key] = true
        })
    } else {
        visibleBacks.value = {}
    }
}

function toggleBackVisibility(key) {
    visibleBacks.value[key] = !visibleBacks.value[key]
}
const renderContent = (content) => {
    if (!content) return '';
    return marked.parse(content);
};

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

                <UButton icon="i-lucide-pencil" size="sm" color="neutral" variant="outline" @click="editDeck">
                    Edit
                </UButton>

                <UButton v-if="value !== 'Grid'" icon="i-lucide-eye" size="sm" color="neutral"
                    :variant="showAllBacks ? 'solid' : 'outline'" @click="toggleShowAllBacks">
                    {{ showAllBacks ? 'Hide All' : 'Show All' }}
                </UButton>
            </div>

            <div v-if="deck.cards && Object.keys(deck.cards).length > 0">
                <!-- Grid view -->
                <UCard class="mb-4" v-if="value === 'Grid'">
                    <div class="heatmap-container">
                        <div v-for="(question, key) in deck.cards" :key="key" class="heatmap-cell"
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
                    <UCard v-for="(question, key) in deck.cards" :key="key" class="mb-3 ml-[5px] mt-[5px] ">
                        <div class="flex items-start">
                            <div class="flex-1">
                                <div class="font-semibold mb-2" v-html="renderContent(question.front)"></div>

                                <div v-if="visibleBacks[key] || showAllBacks"
                                    class="mt-2 pt-2 border-t border-gray-200">
                                    <p class="math-content" v-html="renderContent(question.back)"></p>
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
                    <p v-if="hoveredQuestion" v-html="renderContent(hoveredQuestion.front)">
                    </p>
                    <p v-else class="text-gray-400 italic">Najetím na otázku zobrazíš její front.</p>
                </div>
            </UCard>

            <UCard class="w-1/2 min-h-[100px]">
                <template #header>
                    <div class="font-semibold text-lg">Back</div>
                </template>
                <div>
                    <p v-if="hoveredQuestion" v-html="renderContent(hoveredQuestion.back)">
                    </p>
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