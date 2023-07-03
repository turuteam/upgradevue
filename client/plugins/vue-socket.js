import Vue from 'vue';
import VueSocketio from 'vue-socket.io';

export default async ({ app: { store } }) => {
  Vue.use(VueSocketio, 'wss://arep.co', store);
};
