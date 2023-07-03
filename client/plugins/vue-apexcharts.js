import { defineNuxtPlugin } from 'nuxt/app'
import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'

Vue.component('apexcharts', VueApexCharts)

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.component('apexcharts', VueApexCharts)
})
