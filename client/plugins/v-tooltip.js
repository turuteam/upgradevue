import VTooltip from 'v-tooltip';
import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(VTooltip, {
    defaultBoundariesElement: 'window'
  })
})
