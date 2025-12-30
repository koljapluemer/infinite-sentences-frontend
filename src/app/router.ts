import { createRouter, createWebHistory } from 'vue-router'
import SituationPracticePage from '@/pages/situation-practice/SituationPracticePage.vue'
import SelectNativeLanguagePage from '@/pages/select-native-language/SelectNativeLanguagePage.vue'
import SelectTargetLanguagePage from '@/pages/select-target-language/SelectTargetLanguagePage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/learn'
    },
    {
      path: '/stats',
      name: 'stats',
      component: () => import('@/pages/stats/StatsPage.vue')
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

export default router
