import { clone, mergeObjects } from '@/utils/helpers';
import {
  AREvent,
  ScratchEvent,
  EventForServer,
  ScratchAdvancedSettings,
  EventZoomMeeting,
  EventTicketSalesChartRawData,
  EventTimescaleRawData,
  EventSalesRawData,
  EventTimescaleDataContexts,
  EventTicketSalesChartData
} from './types';
import moment from 'moment'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import duration from 'dayjs/plugin/duration'
import isLeapYear from 'dayjs/plugin/isLeapYear'
dayjs.extend(duration)
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(localizedFormat)
dayjs.extend(duration)
dayjs.extend(isLeapYear)

export const initScratchAdvancedSettings = (): ScratchAdvancedSettings => {
  return {}
};

export const generateDefaultEventStartTime = (): string => {
  const startDate = moment().set('hour', 10).set('minute', 0).set('second', 0);
  if (startDate.isBefore(new Date())) {
    startDate.add(1, 'days');
  }
  return startDate.utc().format();
};

export const initScratchEvent = (): ScratchEvent => {
  return {
    oid: null,
    name: null,
    description: null,
    location: null,
    capacity: null,
    startDate: null,
    endDate: null,
    presentation: {
      liveStreamUrl: null,
      website: null,
      settings: initScratchAdvancedSettings(),
    },
    resources: [],
    timeZone: null,
    meta: {
      synch: {},
    },
  };
};

export const getEventbriteUrl = (event: AREvent): string | null => {
  if (!event) {
    return null;
  }
  if (!checkHasIntegration(event, 'eventbrite')) {
    return null;
  }

  const firstEBKey = Object.keys(event.meta.synch).find(key => {
    return key.includes('eventbrite');
  });
  if (!firstEBKey) {
    return null;
  }

  // we are ensured a non-null value since there MUST
  // be an EB integration to not be caught in the first if
  const eventbriteId: string = event.meta.synch[firstEBKey].puid;
  return `https://eventbrite.com/e/${eventbriteId}`;
}

export const pruneScratchEventForServer = (scratchEvent: ScratchEvent): EventForServer => {
  const {
    description, endDate, startDate, name, meta, location, timeZone, presentation, resources, capacity, provider
  } = scratchEvent;
  const eventForServer: EventForServer = {};
  // Mandotory fields
  if (description) { eventForServer.description = description; }
  if (startDate) { eventForServer.startDate = startDate; }
  if (name) { eventForServer.name = name; }
  if (meta) { eventForServer.meta = meta; }
  if (timeZone) { eventForServer.timeZone = timeZone; }
  if (presentation) { eventForServer.presentation = presentation; }
  eventForServer.resourceOids = resources.map(resource => resource.oid);
  // Optional fields
  eventForServer.endDate = endDate || null;
  eventForServer.location = location || null;
  eventForServer.capacity = capacity || null;
  eventForServer.provider = provider || null;
  return clone(eventForServer);
};

export const getSalesChartContexts = (data: EventTicketSalesChartRawData, timezone: string) => {
  let splitData = <EventTicketSalesChartRawData>{}

  Object.entries(data).forEach(([key, val]) => {
    if (!val) {
      splitData[key] = {
        sales: [],
        quantity: []
      }

      return
    }

    let localTime
    let sales = Array()
    let quantity = Array()

    let i = 0
    let length = val.length
    while (i < length) {
      localTime =  dayjs(val[i].ts).tz(timezone).format('LLLL')

      sales.push(Object.freeze([[localTime], val[i].sales]))
      quantity.push(Object.freeze([[localTime], val[i].tickets]))
      i++
    }

    splitData[key] = {
      sales,
      quantity,
    }
  })

  return splitData
}

export const patchTagsInAdvancedSettings = function (
  scratchAdvancedSettings: ScratchAdvancedSettings,
  assignTags: [],
) {
  const newScratchAdvancedSettings: ScratchAdvancedSettings = clone(scratchAdvancedSettings);

  if (newScratchAdvancedSettings) {
    return {
      ...newScratchAdvancedSettings,
      assignTags
    }
  }

  return newScratchAdvancedSettings;
};


export const patchMessageListInAdvancedSettings = function (
  scratchAdvancedSettings: ScratchAdvancedSettings,
  messageList: any,
) {
  const newScratchAdvancedSettings: ScratchAdvancedSettings = clone(scratchAdvancedSettings);

  if (newScratchAdvancedSettings) {
    // Facebook Messenger
    const fbPageId = messageList.facebookMessenger;

    let subscribeToMessageList = {
      messageListOid: messageList.messageListOid,
      email: messageList.email,
      sms: messageList.sms,
      facebookMessenger: messageList.facebookMessenger,
    }

    return {
      ...newScratchAdvancedSettings,
      subscribeToMessageList
    }
  }
  return newScratchAdvancedSettings;
};

export const patchScratchAdvancedSettingsToEvent = function (
  scratchEvent: ScratchEvent,
  scratchAdvancedSettings: ScratchAdvancedSettings,
) {
  return mergeObjects(scratchEvent, {
    presentation: {
      settings: scratchAdvancedSettings,
    },
  });
};

export const getEventNormalCampaignsCount = (event: AREvent): number => {
  const normalCampaigns = event.campaigns.filter(campaign => {
    return campaign.type !== 'opt-in' && campaign.type !== 'rsvp';
  });
  return normalCampaigns.length;
};

// I believe we will need this function later, so I keep it here.
export const getEventRsvpCampaignsCount = (event: AREvent): number => {
  const normalCampaigns = event.campaigns.filter(campaign => {
    return campaign.type === 'rsvp';
  });
  return normalCampaigns.length;
};

const getZoomInfoFromCurrentEvent = (event: AREvent): EventZoomMeeting | null => {
  return event.meta.meeting || null;
};

export const getZoomUrlFromCurrentEvent = (event: AREvent) => {
  const zoomInfo = getZoomInfoFromCurrentEvent(event);
  if (!zoomInfo) {
    return null;
  }
  return zoomInfo.joinUrl;
};

export const checkHasIntegration = (event: AREvent, provider: string) => {
  return event.provider === provider;
};

const getPatchedMonth = (timestamp: number, monthIndex: number, timezone: string) => {
  let monthRaw = dayjs(timestamp).tz(timezone).add(monthIndex, 'month')
  let monthCat = dayjs(monthRaw).format('MMM')
  let monthDateString = dayjs(monthRaw).format('MMM, YYYY')
  return {
    category: monthCat,
    dateString: monthDateString
  }
}

const getPatchedWeek = (timestamp: number, weekIndex: number, timezone: string) => {
  let weekRaw = dayjs(timestamp).tz(timezone).add(weekIndex, 'week')
  let weekCat = dayjs(weekRaw).format('MMM D')
  let weekDateString = dayjs(weekRaw).format('MMM DD, YYYY')
  return {
    category: weekCat,
    dateString: weekDateString
  }
}

const getPatchedDay = (timestamp: number, dayIndex: number, timezone: string) => {
  let dayRaw = dayjs(timestamp).tz(timezone).add(dayIndex, 'day')
  let dayCat = dayjs(dayRaw).format('MMM D')
  let dayDateString = dayjs(dayRaw).format('MMM DD, YYYY')
  return {
    category: dayCat,
    dateString: dayDateString
  }
}

const patchMonthlyTimescaleData = (data: any, timezone: string) => {
  let patchedAndSorted = []
  let cats = []

  let monthyDataArray: any = Object.entries(data)
  let i = 0
  while (i < monthyDataArray.length) {
    if (i > 0) {
      let current = dayjs(monthyDataArray[i][1].timestamp).tz(timezone)
      let prevv = dayjs(monthyDataArray[i-1][1].timestamp).tz(timezone)

      let monthDiff
      if (dayjs(current).month() === 3 && dayjs(current).isLeapYear()) {
        monthDiff = dayjs(current).add(1, 'day').diff(prevv, 'month')
      } else {
        monthDiff = dayjs(monthyDataArray[i][1].timestamp).tz(timezone).diff(dayjs(monthyDataArray[i-1][1].timestamp).tz(timezone), 'month')
      }

      for (let k = 1; k < monthDiff; k++) {
        let cat = getPatchedMonth(monthyDataArray[i-1][1].timestamp, k, timezone)
        cats.push(cat)
        patchedAndSorted.push(0)
      }
      cats.push({category: monthyDataArray[i][0], dateString: monthyDataArray[i][1].dateString})
      patchedAndSorted.push(monthyDataArray[i][1].y)
    } else {
      cats.push({category: monthyDataArray[i][0], dateString: monthyDataArray[i][1].dateString})
      patchedAndSorted.push(monthyDataArray[i][1].y)
    }
    i++
  }

  return {
    cats: cats,
    vals: patchedAndSorted
  }
}

const patchWeeklyTimescaleData = (data: any, timezone: string) => {
  let patchedAndSorted = []
  let cats = []
  let i = 0
  while (i < data.length) {
    if (i > 0) {
      let weekDiff = dayjs(data[i].timestamp).tz(timezone).diff(dayjs(data[i-1].timestamp).tz(timezone), 'week')
      for (let j = 1; j < weekDiff; j++) {
        let cat = getPatchedWeek(data[i-1].timestamp, j, timezone)
        cats.push(cat)
        patchedAndSorted.push(0)
      }
      cats.push({category: data[i].x, dateString: data[i].dateString})
      patchedAndSorted.push(data[i].y)

    } else {
      cats.push({category: data[i].x, dateString: data[i].dateString})
      patchedAndSorted.push(data[i].y)
    }

    i++
  }
  return {
    cats: cats,
    vals: patchedAndSorted
  }
}

const patchDailyTimescaleData = (data: any, timezone: string) => {
  let patchedAndSorted = []
  let cats = []
  let i = 0
  while (i < data.length) {
    if (i > 0) {
      let dayDiff = dayjs(data[i].timestamp).tz(timezone).diff(dayjs(data[i-1].timestamp).tz(timezone), 'day')
      for (let j = 1; j < dayDiff; j++) {
        let cat = getPatchedDay(data[i-1].timestamp, j, timezone)
        cats.push(cat)
        patchedAndSorted.push(0)
      }

      cats.push({category: data[i].x, dateString: data[i].dateString})
      patchedAndSorted.push(data[i].y)

    } else {
      cats.push({category: data[i].x, dateString: data[i].dateString})
      patchedAndSorted.push(data[i].y)
    }

    i++
  }
  return {
    cats: cats,
    vals: patchedAndSorted
  }
}

const groomTimescaleData = async (data: any, timezone: string, timescaleType: string) => {
  let returnedSeriesData

  switch (timescaleType) {
    case 'monthly':
      returnedSeriesData = patchMonthlyTimescaleData(data, timezone)
      break
    case 'weekly':
      returnedSeriesData = patchWeeklyTimescaleData(data, timezone)
      break
    case 'daily':
      returnedSeriesData = patchDailyTimescaleData(data, timezone)
      break
    default:
      console.log('An unrecognised zoom type was recieved: ', timescaleType)
  }

  return returnedSeriesData
}

const getMonthlyTimescaleData = (data: any, timezone: string) => {
  let monthlySalesCalcObj: any = {}
  let monthlyQuantityCalcObj: any = {}
  let i = 0

  if (!!data) {
    while (i < data.length) {
      let category = dayjs(data[i].ts).tz(timezone).format('MMM')
      let categoryFull = dayjs(data[i].ts).tz(timezone).format('MMM, YYYY')

      let salesTotal = monthlySalesCalcObj[category]?.y ? monthlySalesCalcObj[category].y : 0
      let quantityTotal = monthlyQuantityCalcObj[category]?.y ? monthlyQuantityCalcObj[category].y : 0
      monthlySalesCalcObj[category] = {
        y: salesTotal += data[i].sales,
        timestamp: data[i].ts,
        dateString: categoryFull,
      }
      monthlyQuantityCalcObj[category] = {
        y: quantityTotal += data[i].tickets,
        timestamp: data[i].ts,
        dateString: categoryFull,
      }

      i++
    }
  }

  return {
    sales: groomTimescaleData(monthlySalesCalcObj, timezone, 'monthly'),
    quantity: groomTimescaleData(monthlyQuantityCalcObj, timezone, 'monthly'),
  }
}

const getWeeklyTimescaleData = (data: any, timezone: string) => {
  let timescaleWeeklySalesSeriesData = []
  let timescaleWeeklyQuantitySeriesData = []
  let i = 0

  if (data) {
    while (i < data.length) {
      let category = dayjs(data[i].ts).tz(timezone).format('MMM D')
      let categoryFull = dayjs(data[i].ts).tz(timezone).format('ll')

      timescaleWeeklySalesSeriesData.push(
        {
          timestamp: data[i].ts,
          x: category,
          y: data[i].sales,
          dateString: categoryFull,
        }
      )

      timescaleWeeklyQuantitySeriesData.push(
        {
          timestamp: data[i].ts,
          x: category,
          y: data[i].tickets,
          dateString: categoryFull,
        }
      )

      i++
    }
  }

  return {
    sales: groomTimescaleData(timescaleWeeklySalesSeriesData, timezone, 'weekly'),
    quantity: groomTimescaleData(timescaleWeeklyQuantitySeriesData, timezone, 'weekly'),
  }
}

const getDailyTimescaleData = (data: any, timezone: string) => {
  let timescaleDailySalesSeriesData = []
  let timescaleDailyQuantitySeriesData = []
  let i = 0

  if (data) {
    while (i < data.length) {
      let category = dayjs(data[i].ts).tz(timezone).format('MMM D')
      let categoryFull = dayjs(data[i].ts).tz(timezone).format('ll')

      timescaleDailySalesSeriesData.push(
        {
          timestamp: data[i].ts,
          x: category,
          y: data[i].sales,
          dateString: categoryFull,
        }
      )

      timescaleDailyQuantitySeriesData.push(
        {
          timestamp: data[i].ts,
          x: category,
          y: data[i].tickets,
          dateString: categoryFull,
        }
      )

      i++
    }
  }

  return {
    sales: groomTimescaleData(timescaleDailySalesSeriesData, timezone, 'daily'),
    quantity: groomTimescaleData(timescaleDailyQuantitySeriesData, timezone, 'daily'),
  }
}

export const getTimescaleData = async (data: EventTimescaleRawData, timezone: string) => {
  let promiseObject = {
    // monthly needs to be calculated from the daily data as the monthly
    // timestamps are similar to Aug 1st, 0000hrs. This means any timezone shift
    // would sometimes incorrectly return a category of the previous month, even
    // though there was no data for that month.
    salesMonthly: getMonthlyTimescaleData(data.salesPerDay, timezone).sales,
    salesWeekly: getWeeklyTimescaleData(data.salesPerWeek, timezone).sales,
    salesDaily: getDailyTimescaleData(data.salesPerDay, timezone).sales,
    quantityMonthly: getMonthlyTimescaleData(data.salesPerDay, timezone).quantity,
    quantityWeekly: getWeeklyTimescaleData(data.salesPerWeek, timezone).quantity,
    quantityDaily: getDailyTimescaleData(data.salesPerDay, timezone).quantity,
  }

  let result = await runPromises(promiseObject)
  let timescaleContexts = await getTimescaleDataContexts(result)

  return timescaleContexts
}

// *** keeping this here incase we need accumulative timescale view ***

// const makeTimescaleDataAccumulative = (data: any) => {

//   let vals = data.vals
//   let accumVals = <any>[]
//   let i = 0
//   while (i < vals.length) {
//     if (i === 0) {
//       accumVals.push(vals[i])
//     } else {
//       accumVals.push(vals[i] += accumVals[i - 1])
//     }
//     i++
//   }

//   return accumVals
// }

const getTimescaleDataContexts = async (data: any) => {
  let splitContext = {
    sales: {
      // accumulative: {},
      incremental: {
        monthly: [{
          cats: data.salesMonthly.cats,
          data: data.salesMonthly.vals,
          name: 'Sales - monthly',
        }],
        weekly: [{
          cats: data.salesWeekly.cats,
          data: data.salesWeekly.vals,
          name: 'Sales - weekly',
        }],
        daily: [{
          cats: data.salesDaily.cats,
          data: data.salesDaily.vals,
          name: 'Sales - daily',
        }],
      }
    },
    quantity: {
      // accumulative: {},
      incremental: {
        monthly: [{
          cats: data.quantityMonthly.cats,
          data: data.quantityMonthly.vals,
          name: 'Quantity - monthly',
        }],
        weekly: [{
          cats: data.quantityWeekly.cats,
          data: data.quantityWeekly.vals,
          name: 'Quantity - weekly',
        }],
        daily: [{
          cats: data.quantityDaily.cats,
          data: data.quantityDaily.vals,
          name: 'Quantity - daily',
        }],
      }
    }
  }

  // *** keeping this here incase we need accumulative timescale view ***

  // let dataClone = JSON.parse(JSON.stringify(data))

  // let promiseObject = {
  //   salesMonthly: makeTimescaleDataAccumulative(dataClone.salesMonthly),
  //   salesWeekly: makeTimescaleDataAccumulative(dataClone.salesWeekly),
  //   salesDaily: makeTimescaleDataAccumulative(dataClone.salesDaily),
  //   quantityMonthly: makeTimescaleDataAccumulative(dataClone.quantityMonthly),
  //   quantityWeekly: makeTimescaleDataAccumulative(dataClone.quantityWeekly),
  //   quantityDaily: makeTimescaleDataAccumulative(dataClone.quantityDaily),
  // }

  // let accumulativeResult = await runPromises(promiseObject)
  // splitContext.sales.accumulative = {
  //   monthly: [{
  //     cats: data.salesMonthly.cats,
  //     data: accumulativeResult.salesMonthly,
  //     name: 'Sales - monthly',
  //   }],
  //   weekly: [{
  //     cats: data.salesWeekly.cats,
  //     data: accumulativeResult.salesWeekly
  //     name: 'Sales - weekly',
  //   }],
  //   daily: [{
  //     cats: data.salesDaily.cats,
  //     data: accumulativeResult.salesDaily
  //     name: 'Sales - daily',
  //   }],
  // }
  // splitContext.quantity.accumulative = {
  //   monthly: [{
  //     cats: data.quantityMonthly.cats,
  //     data: accumulativeResult.quantityMonthly
  //     name: 'Quantity - monthly',
  //   }],
  //   weekly: [{
  //     cats: data.quantityWeekly.cats,
  //     data: accumulativeResult.quantityWeekly
  //     name: 'Quantity - weekly',
  //   }],
  //   daily: [{
  //     cats: data.quantityDaily.cats,
  //     data: accumulativeResult.quantityDaily
  //     name: 'Quantity - daily',
  //   }],
  // }

  return splitContext
}

export const trimIncrements = (array: any, index1: number, index2: number): any => {
  let result = {
    sales: 0,
    tickets: 0,
    ts: array[index2-1].ts
  }

  // @ts-ignore
  array.slice(index1, (index2 + 1)).forEach(element => {
    result.sales += element.sales
    result.tickets += element.tickets
  })

  return result
}

const trimCumulativeData = (data: any, rate: number): any => {
  let trimmedData = []
  let i = data.length

  while (true) {
    if (i <= 0) {
      break
    }

    if (i < rate) {
      trimmedData.unshift(data[i-1])
      break
    }

    trimmedData.unshift(data[i-1])

    i = i - rate
  }

  if (trimmedData[0].sales !== 0) {
    let startDate = dayjs(trimmedData[0].ts)
    let endDate = dayjs(trimmedData[trimmedData.length - 1].ts)

    let rangeMillis = endDate.diff(startDate)
    let zeroDayMillis = startDate.subtract((rangeMillis * 0.05), 'ms').valueOf()
    trimmedData.unshift({ sales: 0, tickets: 0, ts: zeroDayMillis})
  }

  return trimmedData
}

export const trimIncrementalData = (data: any, rate: number): any => {
  let trimmedData = []
  let i = data.length

  while (true) {
    if (i <= 0) {
      break
    }

    if (i < rate && i > 1) {
      let res = trimIncrements(data, 0, i - 1)
      trimmedData.unshift(res)
      break
    }

    let res = trimIncrements(data, i - rate, i)
    trimmedData.unshift(res)

    i = i - rate
  }

  if (trimmedData[0].sales !== 0) {
    let startDate = dayjs(trimmedData[0].ts)
    let endDate = dayjs(trimmedData[trimmedData.length - 1].ts)

    let rangeMillis = endDate.diff(startDate)
    let zeroDayMillis = startDate.subtract((rangeMillis * 0.05), 'ms').valueOf()
    trimmedData.unshift({ sales: 0, tickets: 0, ts: zeroDayMillis})
  }

  return trimmedData
}

const trimData = (key: string, dataArray: any, limit: number): any => {
  let reductionRate = Math.ceil(dataArray.length / limit)

  if (key === 'totalSales') {
    return trimCumulativeData(dataArray, reductionRate)
  } else if (key === 'incrementalSales') {
    return trimIncrementalData(dataArray, reductionRate)
  }
}

export const optimiseData = async (data: any): Promise<any> => {
  let withinLimitsData: any = {}
  let dataPointLimit = 800
  let promiseObject: any = {}

  Object.entries(data).forEach(([key, val]) => {
    let dataArray: any = val
    if (dataArray.length > dataPointLimit) {
      promiseObject[key] = trimData(key, dataArray, dataPointLimit)
    } else {
      withinLimitsData[key] = val
    }
  })

  let result = await runPromises(promiseObject)

  let optimisedData = {...withinLimitsData, ...result}
  return optimisedData
}

export const runPromises = async(promiseObject: Object) => {
  let keys: any[] = []
  let promises: any[] = []

  Object.entries(promiseObject).forEach(([key, val]) => {
    keys.push(key)
    promises.push(val)
  })

  let data = await Promise.all(promises)
  let merged = data.reduce((obj, value, index) => ({ ...obj, [keys[index]]: value }), {})

  return merged
}

export const getEventImageUrl = (event: ScratchEvent | AREvent): string | null => {
  const resource = event.resources.find(resource => resource.assetType === 'event-image');
  return resource ? resource.url : null;
};

export function getTimescaleRawDataFromSales({ salesPerDay, salesPerWeek, salesPerMonth }: EventSalesRawData): EventTimescaleRawData {
  return {
    salesPerDay,
    salesPerWeek,
    salesPerMonth,
  }
}

export function defaultSalesTimescaleContexts(): EventTimescaleDataContexts {
  return {
    sales: {
      accumulative: {
        monthly: [],
        weekly: [],
        daily: [],
      },
      incremental: {
        monthly: [],
        weekly: [],
        daily: [],
      }
    },
    quantity: {
      accumulative: {
        monthly: [],
        weekly: [],
        daily: [],
      },
      incremental: {
        monthly: [],
        weekly: [],
        daily: [],
      }
    }
  }
}

export function defaultSalesChartContexts(): EventTimescaleDataContexts {
  return {
    sales: {
      accumulative: [],
      incremental: []
    },
    quantity: {
      accumulative: [],
      incremental: []
    }
  }
}

export function getEventTotalTicketSales(event: AREvent): number {
  return event.ticketStats[0]?.totalTicketSales || 0;
};

export function getEventTotalTicketSold(event: AREvent): number {
  return event.ticketStats[0]?.totalTicketsSold || 0;
};

export function getEventAttendees(event: AREvent): number {
  return event.ticketStats[0]?.attendees || 0;
};

export function setInitialSalesChartData(oid: number, data: EventTicketSalesChartRawData): EventTicketSalesChartData {
  return  {
    sales: {
      accumulative: [{
        oid,
        name: 'Sales',
        data: Object.freeze(data.totalSales.sales),
      }],
      incremental: [{
        oid,
        name: 'Sales',
        data: Object.freeze(data.incrementalSales.sales),
      }]
    },
    quantity: {
      accumulative: [{
        oid,
        name: 'Quantity',
        data: Object.freeze(data.totalSales.quantity),
      }],
      incremental: [{
        oid,
        name: 'Quantity',
        data: Object.freeze(data.incrementalSales.quantity),
      }],
    },
  }
}
