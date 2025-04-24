<template>
  <div>
    <button v-if="!isLoggedIn" @click="handleLogin">Login with Dropbox</button>
    <div v-else>
      <p>Logged in!</p>
      <button @click="handleLogout">Logout</button>
      <!-- You can now use the access token for API calls -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DropboxHandler } from '~/model/Dropbox'; // Assuming it's in model directory


const dropboxAppKey = useRuntimeConfig().public.dropboxAppKey || 'key-not-found';




const dropboxClientId = dropboxAppKey;

// --- State ---
const dropboxHandler = ref<DropboxHandler | null>(null);
const isLoggedIn = ref(false);
const dropboxRedirectUri = ref('');

// --- Methods ---
const handleLogin = () => {
  if (dropboxHandler.value) {
    // Ensure redirect URI is set before login (it should be by now if mounted)
    if (!dropboxHandler.value.REDIRECT_URI) { // Accessing internal might be fragile, consider a getter or check before login
        console.warn('Redirect URI not set yet, setting it now.');
        dropboxHandler.value.setRedirectUri(dropboxRedirectUri.value);
    }
    dropboxHandler.value.login(); // Redirects the user to Dropbox
  } else {
    console.error('Dropbox handler not initialized.');
  }
};

const handleLogout = () => {
  if (dropboxHandler.value) {
    dropboxHandler.value.logout();
    isLoggedIn.value = dropboxHandler.value.isLoggedIn(); // Update state
  }
};

// --- Lifecycle Hook ---
onMounted(() => {
  // --- Client-side only initialization ---
  // Calculate redirect URI only on the client
  dropboxRedirectUri.value = window.location.origin + window.location.pathname;

  // Initialize the handler when the component mounts
  dropboxHandler.value = new DropboxHandler(dropboxClientId);

  // Set the redirect URI *before* potential login attempt
  // The handleRedirect() in the constructor will try to parse the token
  // if this page load is the result of the redirect from Dropbox.
  dropboxHandler.value.setRedirectUri(dropboxRedirectUri.value);

  // Check initial login state (handleRedirect might have set the token)
  isLoggedIn.value = dropboxHandler.value.isLoggedIn();

  // Optional: Log token for debugging
  // console.log('Access Token on mount:', dropboxHandler.value.getAccessToken());
});

</script>

<style scoped>
/* Add any styles if needed */
button {
  padding: 10px 15px;
  cursor: pointer;
}
</style>