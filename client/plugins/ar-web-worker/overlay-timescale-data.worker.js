import { getTimescaleData } from '@/store/modules/event/utils'

const OverlayTimescaleDataWorker = self.addEventListener('message', async ({ data }) => {
  let promises = []

  let i = data.data.length
  while (i--) {
    promises.push(getTimescaleData(data.data[i].timescale, data.timezone))
  }

  let result = await Promise.all(promises)
  
  let k = result.length
  while (k--) {
    data.contexts.sales.incremental.daily = [
      ...data.contexts.sales.incremental.daily, 
      { 
        oid: data.data[k].oid,
        name: data.data[k].name,
        cats: result[k].sales.incremental.daily[0].cats,
        data: result[k].sales.incremental.daily[0].data
      }
    ]
    data.contexts.sales.incremental.weekly = [
      ...data.contexts.sales.incremental.weekly,
      { 
        oid: data.data[k].oid,
        name: data.data[k].name,
        cats: result[k].sales.incremental.weekly[0].cats,
        data: result[k].sales.incremental.weekly[0].data
      }
    ]
    data.contexts.sales.incremental.monthly = [
      ...data.contexts.sales.incremental.monthly,
      { 
        oid: data.data[k].oid,
        name: data.data[k].name,
        cats: result[k].sales.incremental.monthly[0].cats,
        data: result[k].sales.incremental.monthly[0].data
      }
    ]
    data.contexts.quantity.incremental.daily = [
      ...data.contexts.quantity.incremental.daily, 
      { 
        oid: data.data[k].oid,
        name: data.data[k].name,
        cats: result[k].quantity.incremental.daily[0].cats,
        data: result[k].quantity.incremental.daily[0].data
      }
    ]
    data.contexts.quantity.incremental.weekly = [
      ...data.contexts.quantity.incremental.weekly,
      { 
        oid: data.data[k].oid,
        name: data.data[k].name,
        cats: result[k].quantity.incremental.weekly[0].cats,
        data: result[k].quantity.incremental.weekly[0].data
      }
    ]
    data.contexts.quantity.incremental.monthly = [
      ...data.contexts.quantity.incremental.monthly,
      { 
        oid: data.data[k].oid,
        name: data.data[k].name,
        cats: result[k].quantity.incremental.monthly[0].cats,
        data: result[k].quantity.incremental.monthly[0].data
      }
    ]
  }
  
  self.postMessage(data.contexts)
})

 export default OverlayTimescaleDataWorker