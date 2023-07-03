import { defineNuxtPlugin } from 'nuxt/app'

const isDev = process.env.NODE_ENV !== "production"

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.config.performance = isDev
})