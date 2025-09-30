<template>
    <UContainer>
        <h1 class="text-2xl font-bold mb-4">Settings</h1>
        <USwitch v-model="isDarkMode" unchecked-icon="i-lucide-sun" checked-icon="i-lucide-moon" label="Dark mode" />
    </UContainer>
</template>

<script setup lang="ts">


const isDarkMode = ref(document.documentElement.classList.contains('dark'));

watch(isDarkMode, (newValue) => {
    console.log('Switch value changed to:', newValue);
    document.documentElement.classList.toggle('dark', newValue);
});

</script>