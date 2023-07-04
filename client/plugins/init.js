import { defineNuxtPlugin } from 'nuxt/app';
import { useRouter } from 'vue-router';
import { sync } from 'vuex-router-sync';
import { useStore } from 'vuex/types/index';

const router = useRouter()
const store = useStore()

// export default async ({ app: { store, router }, isDev }) => {
//   /**
//    * Enable devtools & performance
//    * @see https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
//    * @see https://chrome.google.com/webstore/detail/vue-performance-devtool/koljilikekcjfeecjefimopfffhkjbne
//    */
//   if (isDev) {
//     Vue.config.devtools = true;
//     Vue.config.performance = true;
//   }

//   // Sync vue-router's current $route as part of vuex store's state
//   sync(store, router);

// };

export default defineNuxtPlugin(async () => {
  /**
   * Enable devtools & performance
   * @see https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
   * @see https://chrome.google.com/webstore/detail/vue-performance-devtool/koljilikekcjfeecjefimopfffhkjbne
   */

    sync(store, router)
    
  // Sync vue-router's current $route as part of vuex store's state
})
