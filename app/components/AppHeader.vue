<template>
    <nav>
        <!-- Top Navigation -->
        <div class="header">
            <ul>
                <li>
                    <NuxtLink to="/">
                        <LayoutDashboardIcon color="#ffffff" :size="24" stroke-width="0.8" />
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/decks">
                        <GraduationCap color="#ffffff" :size="24" stroke-width="0.8" />
                    </NuxtLink>
                </li>
            </ul>
        </div>

        <!-- Space betweem navigations -->
        <div class="spacer"></div>

        <!-- Footer Navigation -->
        <div class="footer">
            <ul>
                <li>
                    <a href="https://github.com/sol239/learning-cards" target="_blank">
                        <GithubIcon color="#ffffff" :size="24" stroke-width="0.8" />
                    </a>
                </li>
                <li>
                    <NuxtLink to="/settings">
                        <Settings color="#ffffff" :size="24" stroke-width="0.8" />
                    </NuxtLink>
                </li>
            </ul>

            <div style="margin-top: 1rem;"> <!-- Push to the right -->
                <UButton v-if="!isLoggedIn" icon="i-lucide-user" @click="handleLogin"
                    variant="ghost" />
                <div v-else class="flex items-center space-x-2">
                    <UButton icon="i-heroicons-arrow-left-on-rectangle" @click="handleLogout" variant="ghost"
                        color="error" aria-label="Logout Dropbox" />
                </div>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Settings, GithubIcon, GraduationCap, LayoutDashboardIcon } from 'lucide-vue-next';
import { DropboxHandler } from '~/model/Dropbox'; // Adjust path if needed
import { useDecks } from '~/composables/useDecks'; // Import the composable

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
const _printFiles = () => {
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

<style scoped>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

.layout {
    display: flex;
}

nav {
    display: flex;

    /* Navigation items will be in a column */
    flex-direction: column;
    justify-content: space-between;
    height: 100vh;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-bottom: 1rem;
    padding-top: 1rem;

    /* Intrinsic sizing */
    width: min-content;

    /* Positioning */
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
}

.spacer {
    flex-grow: 1;
}

nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    justify-items: center;
}

nav ul li a {
    color: #fff;
    text-decoration: none;
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: color 0.3s ease;
}

nav ul li a:hover {
    color: #8f0e0e;
}
</style>
