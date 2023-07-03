import { Plugin } from '@nuxt/types'
import * as csv from '@/utils/csv';
import * as date from '@/utils/date/';
import * as event from '@/utils/event';
import * as general from '@/utils/general';
import * as email from '@/utils/email';
import * as segment from '@/utils/segment';
import * as tag from '@/utils/tag';

const arUtils = {
  csv,
  date,
  event,
  general,
  email,
  segment,
  tag,
}

declare module 'vue/types/vue' {
  interface Vue {
    $arUtils: typeof arUtils;
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $arUtils: typeof arUtils;
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $arUtils: typeof arUtils;
  }
}

const arUtilsPlugin: Plugin = (context, inject) => {
  inject('arUtils', arUtils)
};

export default arUtilsPlugin;
