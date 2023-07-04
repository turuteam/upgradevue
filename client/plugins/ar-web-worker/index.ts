import { defineNuxtPlugin } from 'nuxt/app'
import InitialEventSalesDataWorker  from  './initial-event-sales-data.worker'
import OverlaySalesQuantityWorker  from  './overlay-sales-quantity.worker'
import OverlayTimescaleDataWorker  from  './overlay-timescale-data.worker.js'

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

declare module 'nuxt/app' {
  interface NuxtApp {
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

export default defineNuxtPlugin(() => {
  return {
    provide: {
      workerPlugin
    }
  }
})