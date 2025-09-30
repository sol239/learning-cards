<template>
  <div class="bg-white text-black min-h-screen p-6 markdown-body">
    <div v-if="error" class="text-red-500 font-semibold">{{ error }}</div>

    <div v-else-if="deck">
      <h1 class="text-3xl font-bold mb-4">{{ deck.name }}</h1>

      <div class="flex items-center gap-4 mb-4">
        <UButton icon="i-lucide-arrow-left" size="sm" color="primary" variant="soft"
                 class="border border-black bg-white text-black hover:bg-gray-100"
                 @click="goBackToDecks">
          Decks
        </UButton>

        <USelect v-model="value" :items="items"
                 class="w-48 border border-black bg-white text-black" />

        <UButton icon="i-lucide-rotate-ccw" size="sm" color="neutral" variant="outline"
                 class="border border-black bg-white text-black hover:bg-gray-100"
                 @click="resetDeckLevels">
          Reset
        </UButton>

        <UButton icon="i-lucide-pencil" size="sm" color="neutral" variant="outline"
                 class="border border-black bg-white text-black hover:bg-gray-100"
                 @click="editDeck">
          Edit
        </UButton>

        <UButton v-if="value !== 'Grid'" icon="i-lucide-eye" size="sm" color="neutral"
                 :variant="showAllBacks ? 'solid' : 'outline'"
                 class="border border-black bg-white text-black hover:bg-gray-100"
                 @click="toggleShowAllBacks">
          {{ showAllBacks ? 'Hide All' : 'Show All' }}
        </UButton>
        <UButton size="sm" color="neutral" variant="outline"
                 class="border border-black bg-white text-black hover:bg-gray-100"
                 @click="increaseLevelWithButton"
                 :disabled="hoveredQuestion === null">
          Increase Level
        </UButton>
      </div>

      <div v-if="deck.cards && Object.keys(deck.cards).length > 0">
        <!-- Grid view -->
        <UCard class="mb-4 border border-black bg-white" v-if="value === 'Grid'">
          <div class="heatmap-container">
            <div v-for="(question, key) in deck.cards" :key="key"
                 class="heatmap-cell"
                 :class="[`heat-${question.level || 0}`, { 'show-back': showAllBacks }, { 'selected': hoveredQuestion?.key === key }]"
                 :title="question.front"
                 @click="selectCard(question, key)"
                 >
              <div v-if="showAllBacks" class="card-back" v-html="renderContent(deck.cards[key]?.back)"></div>
            </div>
          </div>
        </UCard>

        <!-- List view -->
        <div v-else class="question-list">
          <UCard v-for="(question, key) in deck.cards"
                 :key="key"
                 class="mb-3 ml-[5px] mt-[5px] border border-black bg-white"
                 :class="{ 'selected': hoveredQuestion?.key === key }">
            <div class="flex items-start">
              <div class="flex-1">
                <div class="font-semibold mb-2 front-content" v-html="renderContent(question.front)"></div>
                <div v-if="visibleBacks[key] || showAllBacks" class="mt-2 pt-2 border-t border-black">
                  <p class="math-content back-content" v-html="renderContent(question.back)"></p>
                </div>
              </div>
              <div class="flex flex-row items-center space-x-2 ml-4">
                <div class="heatmap-cell" :class="`heat-${question.level || 0}`" @click="increaseLevel(key)" />
                <UButton size="sm" color="neutral" variant="outline"
                         :icon="(visibleBacks[key] || showAllBacks) ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                         class="border border-black bg-white text-black hover:bg-gray-100"
                         @click="toggleBackVisibility(key)"
                         :disabled="showAllBacks">
                  {{ (visibleBacks[key] || showAllBacks) ? 'Hide' : 'Show' }}
                </UButton>
              </div>
            </div>
          </UCard>
        </div>
      </div>
      <div v-else class="text-gray-500 italic">No questions in this deck.</div>
    </div>

    <!-- Front/Back preview on click -->
    <div class="flex gap-4 mt-6" v-if="value === 'Grid'">
      <div class="w-1/2" :style="{ width: frontWidth + '%' }">
        <UCard class="min-h-[100px] border border-black bg-white" :style="{ height: '500px' }">
          <div class="front-preview">
            <p v-if="hoveredQuestion" v-html="renderContent(hoveredQuestion.front)" />
            <p v-else class="text-gray-400 italic">Click a card to preview front.</p>
          </div>
        </UCard>
      </div>

      <div class="resize-handle" @mousedown="startResize" />

      <div class="w-1/2" :style="{ width: (100 - frontWidth) + '%' }">
        <UCard class="min-h-[100px] border border-black bg-white" :style="{ height: '500px' }">
          <div class="back-preview">
            <p v-if="hoveredQuestion" v-html="renderContent(hoveredQuestion.back)" />
            <p v-else class="text-gray-400 italic">Click a card to preview back.</p>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { navigateTo } from '#app'
import { DropboxHandler } from '~/model/Dropbox'
import { useDecks } from '~/composables/useDecks'

import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import katex from 'katex'
import 'katex/dist/katex.min.css'

marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: true,
  mangle: false,
  highlight: (code, lang) => {
    try {
      return hljs.highlight(code, { language: lang }).value
    } catch {
      return hljs.highlightAuto(code).value
    }
  }
})

function renderContent(content) {
  if (!content) return '';

  // 1. Render KaTeX display math
  content = content.replace(/(?<!\\)\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: true });
    } catch (e) {
      console.error(e);
      return `<span class="text-red-500">KaTeX Error: ${e.message}</span>`;
    }
  });

  // 2. Render KaTeX inline math
  content = content.replace(/(?<!\\)\$([^\$]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), { displayMode: false });
    } catch (e) {
      console.error(e);
      return `<span class="text-red-500">KaTeX Error: ${e.message}</span>`;
    }
  });

  // 3. Then run Markdown
  return marked.parse(content);
}




const { decks } = useDecks()
const route = useRoute()
const deckId = route.params.id

const error = ref(null)
const showAllBacks = ref(false)
const visibleBacks = ref({})
const hoveredQuestion = ref(null)
const items = ref(['Grid', 'List'])
const value = ref('Grid')

const deck = computed(() => decks.value.find(d => d.id === deckId))

// Resizable panes
const frontWidth = ref(50);
const isResizing = ref(false);

const startResize = (e) => {
  isResizing.value = true;
  document.addEventListener('mousemove', resize);
  document.addEventListener('mouseup', stopResize);
};

const resize = (e) => {
  if (!isResizing.value) return;
  const containerWidth = document.querySelector('.flex.gap-4.mt-6').offsetWidth;
  let newWidth = Math.round((e.clientX - document.querySelector('.flex.gap-4.mt-6').offsetLeft) / containerWidth * 100);
  frontWidth.value = Math.min(Math.max(newWidth, 20), 80); // Keep between 20% and 80%
};

const stopResize = () => {
  isResizing.value = false;
  document.removeEventListener('mousemove', resize);
  document.removeEventListener('mouseup', stopResize);
};

function increaseLevel(questionKey) {
  if (!deck.value?.cards) return
  const question = deck.value.cards[questionKey]
  if (!question) return
  question.level = (question.level ?? 0) + 1
  question.level %= 6

  const dh = new DropboxHandler()
  dh.saveDeckToDropbox(deck.value).catch(console.error)
}

function increaseLevelWithButton() {
  if (hoveredQuestion.value) {
    increaseLevel(hoveredQuestion.value.key);
  }
}

function resetDeckLevels() {
  if (!deck.value?.cards) return
  Object.values(deck.value.cards).forEach(q => q.level = 0)
  const dh = new DropboxHandler()
  dh.saveDeckToDropbox(deck.value).catch(console.error)
}

function editDeck() {
  if (deck.value) navigateTo(`/decks/${deck.value.id}/edit`)
}

function goBackToDecks() {
  navigateTo('/decks')
}


function toggleShowAllBacks() {
  showAllBacks.value = !showAllBacks.value
  visibleBacks.value = showAllBacks.value
    ? Object.fromEntries(Object.keys(deck.value?.cards || {}).map(k => [k, true]))
    : {}
}

function toggleBackVisibility(key) {
  visibleBacks.value[key] = !visibleBacks.value[key]
}

function selectCard(question, key) {
  hoveredQuestion.value = { ...question, key };
}

onMounted(() => {
  window.addEventListener('keydown', (event) => {
    if (event.key === 'm' && hoveredQuestion.value !== null) {
      increaseLevel(hoveredQuestion.value.key);
    }
  });
});

</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.5.0/github-markdown-light.min.css');

.markdown-body {
  font-size: 16px;
  line-height: 1.6;
}

/* Force visibility of bullets in deeply rendered HTML (via v-html) */
::v-deep(.markdown-body ul) {
  list-style: disc;
  padding-left: 1.5em;
  margin-left: 1.5em;
  color: black;
}

::v-deep(.markdown-body ol) {
  list-style: decimal;
  padding-left: 1.5em;
  margin-left: 1.5em;
  color: black;
}

::v-deep(.markdown-body li) {
  display: list-item;
}
.heatmap-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20px, 1fr));
  gap: 4px;
  width: 100%;
  background-color: #212121;
}

.heatmap-cell {
  border: 2px solid black;
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

.heatmap-cell.selected {
  border: 4px solid blue;
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
  max-height: none;
  overflow: visible;
  padding-right: 0;
}

.question-list .selected {
  border: 4px solid blue;
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

/* Removed scroll styles from content */
.front-content,
.back-content {
  max-height: none;
  overflow: visible;
  padding-right: 0;
}

.question-list {
  max-height: none;
  overflow: visible;
  padding-right: 0;
}

/* Keep preview (Grid view) scrollable */
.front-preview,
.back-preview {
  height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 10px;
}
/* Resizable styles */
.flex.gap-4.mt-6 {
  display: flex;
}

.resize-handle {
  width: 6px;
  background: #ccc;
  cursor: ew-resize;
  margin: 0 -3px;
  /* position: relative; */
  z-index: 1;
}

.resize-handle:hover {
  background: #999;
}
</style>