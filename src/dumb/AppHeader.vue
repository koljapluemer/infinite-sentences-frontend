<script setup lang="ts">
import { Home, BarChart3, Settings } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
const currentPage = computed(() => route.name)
</script>

<template>
  <header class="navbar bg-base-100 shadow-sm flex justify-center gap-2">
    <RouterLink
      to="/"
      class="btn btn-ghost"
      :class="{ 'btn-active': currentPage !== 'stats' && currentPage !== 'settings' }"
    >
      <Home :size="20" />
      <span class="hidden sm:inline ml-2">Home</span>
    </RouterLink>
    <RouterLink
      to="/stats"
      class="btn btn-ghost"
      :class="{ 'btn-active': currentPage === 'stats' }"
    >
      <BarChart3 :size="20" />
      <span class="hidden sm:inline ml-2">Stats</span>
    </RouterLink>
    <RouterLink
      to="/settings"
      class="btn btn-ghost"
      :class="{ 'btn-active': currentPage === 'settings' }"
    >
      <Settings :size="20" />
      <span class="hidden sm:inline ml-2">Settings</span>
    </RouterLink>
  </header>
</template>
