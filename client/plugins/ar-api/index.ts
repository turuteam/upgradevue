import { Plugin } from '@nuxt/types'

// createAPIs
import { createAPIs } from '@/api/'

const plugin: Plugin = (context: any, inject: any): any => {
  // Initialize API factories
  const factories = createAPIs(context.$axios);
 
  if (!context.isMock) {
    // Inject $api
    inject('api', factories);
  }

  return factories;
};

declare module 'vue/types/vue' {
  interface Vue {
    $api: ReturnType<typeof createAPIs>;
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $api: ReturnType<typeof createAPIs>;
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $api: ReturnType<typeof createAPIs>;
  }
}

export default plugin;