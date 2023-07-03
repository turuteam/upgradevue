import { capitalizeFirstLetter, formatInteger } from '@/utils/helpers';
import { defineNuxtPlugin } from 'nuxt/app';

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.filter('capitalize', val => capitalizeFirstLetter(val))

    vueApp.filter('comma-separated', val => formatInteger(val));
})
