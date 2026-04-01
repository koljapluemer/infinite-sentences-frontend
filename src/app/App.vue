<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from '@/dumb/AppHeader.vue'
import AppFooter from '@/dumb/AppFooter.vue'
import FeedbackModal from '@/features/submit-feedback/FeedbackModal.vue'

const feedbackOpen = ref(false)
</script>

<template>
  <AppHeader />
  <main class="flex-1 items-center justify-between gap-4 flex flex-col w-full max-w-2xl">
    <RouterView />
  </main>
  <AppFooter @feedback="feedbackOpen = true" />
  <FeedbackModal
    :open="feedbackOpen"
    @close="feedbackOpen = false"
  />
</template>


<style>
@import "tailwindcss";
@plugin "daisyui";
</style>
