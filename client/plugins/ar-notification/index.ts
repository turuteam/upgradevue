import Vue from 'vue';
import { Plugin } from '@nuxt/types'
import { generateHash } from '@/utils/helpers/';

// @ts-ignore
import NotificationCaster from './NotificationCaster';

export const createNotificationCaster = () => {
  const instance = new Vue(NotificationCaster);
  instance.$mount();

  return instance;
};

type PushArgs = {
  type: string;
  message: string;
  link?: string;
  width?: number;
  timeout?: number;
};

const push = ({ type, message, link, width, timeout }: PushArgs) => {
  const hash = generateHash();
  const pushEvent = new CustomEvent('arNotificationPush', {
    detail: {
      payload: {
        type,
        message,
        link,
        width,
        timeout,
      },
      hash,
    },
  });
  window.dispatchEvent(pushEvent);

  return new Promise((resolve) => {
    window.addEventListener('arNotificationReceive', (e: any) => {
      // If this event is not triggered by this push
      if (e.detail.hash !== hash) {
        return;
      }
      resolve(e.detail.answer)
    });
  });
};

declare module 'vue/types/vue' {
  interface Vue {
    $arNotification: {
      push: (args: PushArgs) => {};
    };
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $arNotification: {
      push: (args: PushArgs) => {};
    };
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $arNotification: {
      push: (args: PushArgs) => {};
    };
  }
}

const arNotificationPlugin: Plugin = (context, inject) => {
  // Mount our notification caster to html body
  const notificationCasterInstance = createNotificationCaster();
  document.body.appendChild(notificationCasterInstance.$el);

  // @ts-ignore
  inject('arNotification', {
    push,
  });
}

export default arNotificationPlugin;
