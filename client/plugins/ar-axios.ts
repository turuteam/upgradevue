import axios, { AxiosInstance } from 'axios';
import { Plugin } from '@nuxt/types'

// Override NuxtAxiosInstance
declare module '@nuxtjs/axios' {
  interface NuxtAxiosInstance {
    sg: AxiosInstance;
    cn: AxiosInstance;
    mono: AxiosInstance;
  }
}

const plugin: Plugin = function({ $axios, store }) {
  $axios.onRequest((config) => {
    config.headers.common['x-auth-token'] = window.sessionStorage.getItem('x-auth-token');
  });
  $axios.onResponseError((err) => {
    if (err.response?.status === 401) {
      store.dispatch('auth/LOGOUT');
      return;
    }
    return Promise.reject(err);
  });

  const baseURL: string = $axios.defaults.baseURL || '';
  const arCampaignApiBaseUriPrefix: string = process.env.arCampaignApiBaseUriPrefix || '';

  $axios.sg = axios.create({
    baseURL: baseURL.replace(arCampaignApiBaseUriPrefix, '/api/v1/sg'),
  });

  $axios.sg.interceptors.request.use(config => {
    config.headers.common['x-auth-token'] = window.sessionStorage.getItem('x-auth-token');
    return config;
  });

  // The first undefined means we don't do anything if it succeed, so we pass undefiend as our funtion.
  $axios.sg.interceptors.response.use(undefined, err => {
    if (err.response.status === 401) {
      store.dispatch('auth/LOGOUT');
      return;
    }
    return Promise.reject(err);
  });

  $axios.cn = axios.create({
    baseURL: baseURL.replace(arCampaignApiBaseUriPrefix, '/api/v1/cn'),
  });

  $axios.cn.interceptors.request.use(config => {
    config.headers.common['x-auth-token'] = window.sessionStorage.getItem('x-auth-token');
    return config;
  });

  // The first undefined means we don't do anything if it succeed, so we pass undefiend as our funtion.
  $axios.cn.interceptors.response.use(undefined, err => {
    if (err.response.status === 401) {
      store.dispatch('auth/LOGOUT');
      return;
    }
    return Promise.reject(err);
  });

  // Used when you trying to fetch API request from 3rd-party
  $axios.mono = axios.create({});
}

export default plugin;
