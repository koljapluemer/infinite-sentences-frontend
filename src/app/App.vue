<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/dumb/AppHeader.vue'
import AppFooter from '@/dumb/AppFooter.vue'
</script>

<template>
  <AppHeader />
  <main class="flex-1 items-center justify-between gap-4 flex flex-col w-full max-w-2xl">
    <RouterView />
  </main>
  <AppFooter />
</template>


<style>
@import "tailwindcss";
@plugin "daisyui";
</style>
