import { getSalesChartContexts } from '@/store/modules/event/utils'

const OverlaySalesQuantityWorker = self.addEventListener('message', async ({ data }) => {
  let promises = []
  let i = data.data.length
  while (i--) {
    promises.push(getSalesChartContexts(data.data[i].data, data.timezone))
  }

  let result = await Promise.resolve(promises)
  
  let j = result.length
  while (j--) {
    data.contexts.sales.accumulative = [...data.contexts.sales.accumulative, { oid: data.data[j].data.oid, name: data.data[j].name, data: result[j].totalSales.sales }]
    data.contexts.sales.incremental = [...data.contexts.sales.incremental, { oid: data.data[j].data.oid, name: data.data[j].name, data: result[j].incrementalSales.sales }]
    data.contexts.quantity.accumulative = [...data.contexts.quantity.accumulative, { oid: data.data[j].data.oid, name: data.data[j].name, data: result[j].totalSales.quantity }]
    data.contexts.quantity.incremental = [...data.contexts.quantity.incremental, { oid: data.data[j].data.oid, name: data.data[j].name, data: result[j].incrementalSales.quantity }]
  }
  
  self.postMessage(data.contexts)
})

 export default OverlaySalesQuantityWorker