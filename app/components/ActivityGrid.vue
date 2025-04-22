<script lang="ts">
import { Deck } from '~/model/Deck';


const deck = new Deck;


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

</script>




<template>
    <div class="heatmap-container">
        <div v-for="(question, questionValueIndex) in Object.values(deck.questions)" :key="questionValueIndex"
            class="heatmap-cell" :class="`heat-${question.level === undefined ? 0 : question.level}`"
            :title="question.front || 'No question text available'"
            @click="increaseLevel(deckIndex, questionValueIndex)" />
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