import { defineNuxtPlugin } from 'nuxt/app';
import VueCroppie from 'vue-croppie';

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(VueCroppie)
})
