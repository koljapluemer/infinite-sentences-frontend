<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserSettingsStore } from '@/entities/user-settings/userSettingsStore'

const userSettingsStore = useUserSettingsStore()

const dailyGoal = ref(userSettingsStore.dailySentenceGoal)

watch(dailyGoal, (value) => {
  userSettingsStore.setDailySentenceGoal(value)
})
</script>

<template>
  <div class="w-full max-w-md">
    <h1 class="text-3xl font-bold mb-6">
      Settings
    </h1>

    <fieldset class="fieldset">
      <label
        for="daily-goal"
        class="label"
      >
        Daily sentence goal
      </label>
      <input
        id="daily-goal"
        v-model.number="dailyGoal"
        type="number"
        name="daily-goal"
        class="input"
        min="1"
        placeholder="10"
      >
    </fieldset>
  </div>
</template>
