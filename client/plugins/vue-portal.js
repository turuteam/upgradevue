import PortalVue from 'portal-vue';
import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(PortalVue)
})