import { createRouter, createWebHistory } from 'vue-router'
import SituationPracticePage from '@/pages/situation-practice/SituationPracticePage.vue'
import SelectNativeLanguagePage from '@/pages/select-native-language/SelectNativeLanguagePage.vue'
import SelectTargetLanguagePage from '@/pages/select-target-language/SelectTargetLanguagePage.vue'
import LandingPage from '@/pages/landing/LandingPage.vue'
import { useLanguagePreferencesStore } from '@/entities/language-preferences/languagePreferencesStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingPage
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/pages/stats/StatsPage.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/settings/SettingsPage.vue')
    },
    {
      path: '/learn',
      name: 'select-native-language',
      component: SelectNativeLanguagePage
    },
    {
      path: '/learn/:nativeIso',
      name: 'select-target-language',
      component: SelectTargetLanguagePage
    },
    {
      path: '/learn/:nativeIso/:targetIso',
      name: 'practice',
      component: SituationPracticePage
    }
  ]
})

router.beforeEach((to) => {
  const store = useLanguagePreferencesStore()

  // If going to /learn and languages are set, skip to practice
  if (to.name === 'select-native-language' && store.hasLanguagesSet) {
    return `/learn/${store.nativeIso}/${store.targetIso}`
  }

  // If going to practice without settings, go to selection
  if (to.name === 'practice' && !store.hasLanguagesSet) {
    return '/learn'
  }
})

export default router
