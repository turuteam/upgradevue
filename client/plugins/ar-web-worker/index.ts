import InitialEventSalesDataWorker  from  './initial-event-sales-data.worker'
import OverlaySalesQuantityWorker  from  './overlay-sales-quantity.worker'
import OverlayTimescaleDataWorker  from  './overlay-timescale-data.worker.js'
import { Plugin } from '@nuxt/types'

const workerPlugin = {
  createInitialEventSalesDataWorker() {
    // @ts-ignore
    return new InitialEventSalesDataWorker()
  },
  createOverlaySalesQuantityWorker() {
    // @ts-ignore
    return new OverlaySalesQuantityWorker()
  },
  createOverlayTimescaleDataWorker() {
    // @ts-ignore
    return new OverlayTimescaleDataWorker()
  },
}

declare module 'vue/types/vue' {
  interface Vue {
    $arWorker: typeof workerPlugin
  }
}

declare module '@nuxt/types' {
  interface NuxtAppOptions {
    $arWorker: typeof workerPlugin
  }
}

declare module 'vuex/types/index' {
  interface Store<S> {
    $arWorker: typeof workerPlugin
  }
}

const webWorkerPlugin: Plugin = (context, inject) => {
  inject('arWorker', workerPlugin)
}

export default webWorkerPlugin