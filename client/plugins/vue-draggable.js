import { defineNuxtPlugin } from 'nuxt/app'
import Draggable from 'vuedraggable'
// export default Draggable

export default defineNuxtPlugin(({ vueApp }) => {
    vueApp.use(Draggable)
})