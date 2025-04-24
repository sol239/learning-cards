<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { NavigationMenuItem } from '@nuxt/ui';
import { DropboxHandler } from '~/model/Dropbox'; // Adjust path if needed
import { useDecks } from '~/composables/useDecks'; // Import the composable

// --- Navigation Items ---
const navItems: NavigationMenuItem[] = [
  {
    label: 'Home',
    icon: 'i-heroicons-home',
    to: '/',
    data_target: 'home',
  },
  {
    label: 'Stats',
    icon: 'i-heroicons-chart-bar',
    to: '/stats',
    data_target: 'stats',
  },
  {
    label: 'Settings',
    icon: 'i-heroicons-cog',
    to: '/settings',
    data_target: 'settings',
  },
  {
    label: 'Decks',
    icon: 'i-heroicons-book-open',
    to: '/decks',
    data_target: 'decks',
  },
];

// --- Use Shared Decks State ---
const { decks, setDecks } = useDecks(); // Get shared state and setter

// --- Dropbox Logic ---
const dropboxAppKey = useRuntimeConfig().public.dropboxAppKey || 'key-not-found';
const dropboxClientId = dropboxAppKey;

const dropboxHandler = ref<DropboxHandler | null>(null);
const isLoggedIn = ref(false);
const dropboxRedirectUri = ref(''); // Will be set in onMounted

const handleLogin = () => {
  if (dropboxHandler.value) {
    // Redirect URI should be set by onMounted
    dropboxHandler.value.login();
  } else {
    console.error('Dropbox handler not initialized.');
  }
};

const handleLogout = () => {
  if (dropboxHandler.value) {
    dropboxHandler.value.logout();
    isLoggedIn.value = dropboxHandler.value.isLoggedIn();
    setDecks([]); // Clear decks on logout
  }
};

// Function to fetch and set decks (used in onMounted and potentially elsewhere)
const fetchAndSetDecks = async () => {
  if (!dropboxHandler.value) {
    console.error('Dropbox handler not available for fetching decks.');
    setDecks([]); // Ensure decks are cleared if handler is missing
    return;
  }
  try {
    // Assuming printJsonFileContents fetches and returns the deck data array
    const data = await dropboxHandler.value.printJsonFileContents();
    if (Array.isArray(data)) {
      setDecks(data); // Update shared state
      console.log('Fetched and updated decks:', decks.value);
    } else {
      console.error('Fetched data is not an array:', data);
      setDecks([]); // Clear decks if data is invalid
    }
  } catch (error) {
    console.error('Error fetching data from Dropbox:', error);
    setDecks([]); // Clear decks on error
  }
};


// Example function (if needed) to manually trigger fetching/printing files
const printFiles = () => {
  if (dropboxHandler.value) {
    // List files (optional, for debugging)
    dropboxHandler.value.listFiles()
      .then((files) => {
        console.log('Files:', files);
      })
      .catch((error) => {
        console.error('Error listing files:', error);
      });

    // Fetch and update the decks state
    fetchAndSetDecks();

  } else {
    console.error('Dropbox handler not initialized.');
  }
};

onMounted(() => {
  // --- Client-side only initialization ---
  // IMPORTANT: Use a fixed redirect URI registered in Dropbox
  // Example: dropboxRedirectUri.value = window.location.origin + '/dropbox/callback';
  // Using window.location.pathname can cause issues if login starts from different pages.
  // Ensure '/dropbox/callback' (or your chosen path) is added to your allowed redirect URIs in Dropbox App Console.
  // For now, using the current path as per original code, but strongly recommend changing it.
  dropboxRedirectUri.value = window.location.origin + window.location.pathname;

  try {
    dropboxHandler.value = new DropboxHandler(dropboxClientId);
    dropboxHandler.value.setRedirectUri(dropboxRedirectUri.value);

    // Check login state after potential redirect
    isLoggedIn.value = dropboxHandler.value.isLoggedIn();

    // When logged in, fetch the decks from Dropbox
    if (isLoggedIn.value) {
      fetchAndSetDecks(); // Fetch decks using the shared function
    } else {
      // Ensure decks are cleared if not logged in on mount
      setDecks([]);
    }
  } catch (error) {
      console.error("Error initializing Dropbox Handler:", error);
      isLoggedIn.value = false;
      setDecks([]); // Ensure decks are cleared on initialization error
  }
});

</script>


<template>
  <div class="flex items-center w-full justify-between text-lg py-4 px-4">
    <!-- Navigation Menu on the left/center -->
    <UNavigationMenu :items="navItems" class="flex-grow justify-start" />

    <!-- Dropbox Button on the right -->
    <div class="ml-auto"> <!-- Push to the right -->
      <UButton v-if="!isLoggedIn" icon="i-heroicons-cloud-arrow-down" label="Login Dropbox" @click="handleLogin"
        variant="ghost" />
      <div v-else class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">Dropbox Connected</span>
        <UButton icon="i-heroicons-arrow-left-on-rectangle" @click="handleLogout" variant="ghost" color="red"
          aria-label="Logout Dropbox" />
        <UButton icon="i-heroicons-arrow-left-on-rectangle" label="Print files" @click="printFiles"
          variant="ghost" class="ml-2" />
      </div>


    </div>
  </div>
</template>

<style scoped>
/* Add specific styles if needed, e.g., button padding */
</style>