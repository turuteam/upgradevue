import { defineNuxtPlugin } from 'nuxt/app';
import VueScrollTo from 'vue-scrollto';

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(VueScrollTo)
})
