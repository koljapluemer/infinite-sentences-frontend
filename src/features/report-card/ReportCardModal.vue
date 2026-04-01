<script setup lang="ts">
import { ref } from 'vue'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/app/firebase'

export type CardReportContext = {
  taskKind: string
  nativeIso: string
  targetIso: string
  gloss: string
  translations: string[]
  cardKey: string
}

const props = defineProps<{
  open: boolean
  context: CardReportContext | null
}>()

const emit = defineEmits<{ close: [] }>()

const REASONS = ['Inappropriate', 'Bad translation', 'Confusing', 'Something else'] as const
type Reason = (typeof REASONS)[number]

const reason = ref<Reason | ''>('')
const message = ref('')
const email = ref('')
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

async function submit() {
  if (!reason.value) return
  submitting.value = true
  error.value = ''
  try {
    await addDoc(collection(db, 'feedback-infi-cards'), {
      reason: reason.value,
      message: message.value.trim() || null,
      email: email.value.trim() || null,
      context: props.context,
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
    reason.value = ''
    message.value = ''
    email.value = ''
    submitted.value = false
    error.value = ''
  }, 300)
}
</script>

<template>
  <dialog
    class="modal"
    :class="{ 'modal-open': props.open }"
  >
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">
        Report card
      </h3>

      <div
        v-if="submitted"
        class="flex flex-col gap-4"
      >
        <p>Thanks, reported!</p>
        <div class="modal-action">
          <button
            class="btn"
            @click="close"
          >
            Close
          </button>
        </div>
      </div>

      <form
        v-else
        class="flex flex-col gap-4"
        @submit.prevent="submit"
      >
        <fieldset class="fieldset">
          <label
            for="report-reason"
            class="label"
          >Reason</label>
          <select
            id="report-reason"
            v-model="reason"
            class="select"
            required
          >
            <option
              value=""
              disabled
            >
              Select a reason
            </option>
            <option
              v-for="r in REASONS"
              :key="r"
              :value="r"
            >
              {{ r }}
            </option>
          </select>
        </fieldset>

        <fieldset class="fieldset">
          <label
            for="report-message"
            class="label"
          >Message <span class="text-light">(optional)</span></label>
          <textarea
            id="report-message"
            v-model="message"
            class="textarea w-full"
            placeholder="Tell me more…"
            rows="3"
          />
        </fieldset>

        <fieldset class="fieldset">
          <label
            for="report-email"
            class="label"
          >Email <span class="text-light">(optional; if you want me to reply or notify you)</span></label>
          <input
            id="report-email"
            v-model="email"
            type="email"
            class="input"
            placeholder="you@example.com"
          >
        </fieldset>

        <p
          v-if="error"
          class="text-error text-sm"
        >
          {{ error }}
        </p>

        <div class="modal-action">
          <button
            type="button"
            class="btn btn-ghost"
            @click="close"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="submitting || !reason"
          >
            {{ submitting ? 'Sending…' : 'Send' }}
          </button>
        </div>
      </form>
    </div>
    <div
      class="modal-backdrop"
      @click="close"
    />
  </dialog>
</template>
