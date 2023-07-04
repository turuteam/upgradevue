import LeaderLine from 'leader-line-new'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      leaderLine: LeaderLine
    }
  } 
})
