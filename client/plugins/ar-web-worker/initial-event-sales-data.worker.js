import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import weekOfYear from 'dayjs/plugin/weekOfYear'
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.extend(weekOfYear)

const initialEventSalesDataWorker = self.addEventListener('message', ({ data }) => {
  let splitData = {}
  Object.entries(data.chartData).forEach(([key, val]) => {
    if (!val) {
      splitData[key] = {
        sales: [],
        quantity: []
      }
    } else {

      let localTime
      let sales = Array()
      let quantity = Array()

      let i = 0
      let length = val.length
      while (i < length) {
        localTime = data.currentEventTimeZone
          ? dayjs(val[i].ts).tz(data.currentEventTimeZone).format('LLLL')
          : dayjs.utc(val[i].ts).local().format('LLLL')
        sales.push(Object.freeze([[localTime], val[i].sales]))
        quantity.push(Object.freeze([[localTime], val[i].tickets]))
        i++
      }

      splitData[key] = {
        sales,
        quantity,
      }
    }
  })
  splitData.name = data.name || ''
  splitData.oid = data.oid || ''
  self.postMessage(splitData)
 })

 export default initialEventSalesDataWorker
