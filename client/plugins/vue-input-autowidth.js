import { defineNuxtPlugin } from 'nuxt/app';
import VueInputAutowidth from 'vue-input-autowidth'

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(VueInputAutowidth)
})
