<script setup lang="ts">
import { ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/app/firebase'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const message = ref('')
const email = ref('')
const newsletter = ref(false)
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

async function submit() {
  if (!message.value.trim()) return
  submitting.value = true
  error.value = ''
  try {
    await addDoc(collection(db, 'feedback'), {
      message: message.value.trim(),
      email: email.value.trim() || null,
      newsletter: newsletter.value,
      createdAt: serverTimestamp(),
    })
    submitted.value = true
  } catch {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

function close() {
  emit('close')
  setTimeout(() => {
    message.value = ''
    email.value = ''
    newsletter.value = false
    submitted.value = false
    error.value = ''
  }, 300)
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': props.open }">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        Give feedback
      </h3>

      <div v-if="submitted" class="flex flex-col gap-4">
        <p>Thanks, received!</p>
        <div class="modal-action">
          <button class="btn" @click="close">
            Close
          </button>
        </div>
      </div>

      <form v-else class="flex flex-col gap-4" @submit.prevent="submit">
        <fieldset class="fieldset">
          <label for="feedback-message" class="label">Message</label>
          <textarea id="feedback-message" v-model="message" class="textarea w-full"
            placeholder="Love the app? Confused by something? Want to see another language?" rows="4" required />
        </fieldset>

        <fieldset class="fieldset">
          <label for="feedback-email" class="label">Email <span class="text-light">(optional, only if you want to me to
              reply)</span></label>
          <input id="feedback-email" v-model="email" type="email" class="input" placeholder="you@example.com">
        </fieldset>

        <label class="flex items-center gap-2 cursor-pointer" v-if="email">
          <input v-model="newsletter" type="checkbox" class="checkbox">
          <span>Subscribe to my newsletter (max 2/month)</span>
        </label>

        <p v-if="error" class="text-error text-sm">
          {{ error }}
        </p>

        <div class="modal-action">
          <button type="button" class="btn btn-ghost" @click="close">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="submitting || !message.trim()">
            {{ submitting ? 'Sending…' : 'Send' }}
          </button>
        </div>
      </form>
    </div>
    <div class="modal-backdrop" @click="close" />
  </dialog>
</template>
