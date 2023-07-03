import Vue from 'vue';
import { sync } from 'vuex-router-sync';

export default async ({ app: { store, router }, isDev }) => {
  /**
   * Enable devtools & performance
   * @see https://chrome.google.com/webstore/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd
   * @see https://chrome.google.com/webstore/detail/vue-performance-devtool/koljilikekcjfeecjefimopfffhkjbne
   */
  if (isDev) {
    Vue.config.devtools = true;
    Vue.config.performance = true;
  }

  // Sync vue-router's current $route as part of vuex store's state
  sync(store, router);

};
