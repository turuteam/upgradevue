import { defineNuxtPlugin } from 'nuxt/app';
import infiniteScroll from 'vue-infinite-scroll';

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(infiniteScroll)
})
