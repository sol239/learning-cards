<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
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
    
  }
]
</script>
    <template>
    <UNavigationMenu
        :items="items"
        class="w-full justify-center text-lg py-4"
    />
    </template>
