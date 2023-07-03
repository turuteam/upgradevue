import { clone, mergeObjects, objectToArrayOfObjectsj } from '@/utils/helpers';
import {
  PromoterSalesStatsSnapshot,
  dashboardBuckets,
  salesHourlyTimeseries,
  dashboardArrayBucket
} from '../event/types';
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


// Takes UTC data from snapshots, and organises it into buckets which have been parsed into the local timezone.
export const sortDataIntoBuckets = (allData: PromoterSalesStatsSnapshot[], timezone: string, startDateLocalString:string, endDateLocalString:string) => {
  // For now, the timezone param won't do much. Change it later once we add timezone shifting on the chart.
  const buckets: dashboardBuckets = {
    all: {
      day: {},
      month: {},
      year: {},
    },
    ticket: {
      day: {},
      month: {},
      year: {},
    },
    ecommerce: {
      day: {},
      month: {},
      year: {},
    },
    loyalty: {
      day: {},
      month: {},
      year: {},
    },
  }

  const startDateNormalized = dayjs(dayjs(startDateLocalString).utc().format("YYYY-MM-DD"));
  const endDateNormalized = dayjs(dayjs(endDateLocalString).utc().format("YYYY-MM-DD"));

  allData.forEach( snapshot => {
    const localDate = dayjs(snapshot.date).tz(timezone);

    const localDay = dayjs(localDate).format('YYYY-MM-DD');
    const localDayJs = dayjs(localDay);

    const offset = dayjs(localDate).utcOffset() / 60;
    let cutoffHour = 0;
    if (offset > 0) {
      cutoffHour = 24 - offset;
    } else if (offset < 0) {
      cutoffHour = offset;
    }

    let isStartDay = false;
    let isEndDay = false;
    if (localDayJs.isSame(startDateNormalized)) {
      isStartDay = true;
    } else if (endDateNormalized.isSame(localDayJs)) {
      isEndDay = true;
    }

    const nextDay = dayjs(localDay).add(1, 'day').format('YYYY-MM-DD');

    const localMonth = dayjs(localDate).format('YYYY-MM');
    const nextDayMonth = dayjs(nextDay).format('YYYY-MM');

    const localYear = dayjs(localDate).format('YYYY');
    const nextDayYear = dayjs(nextDay).format('YYYY');
    const crossoverHour = 24 - dayjs(localDate).hour();

    function sortIntoBucket(snapshot: salesHourlyTimeseries, bucketName: 'ticket' | 'ecommerce' | 'loyalty', isStartDay:boolean, isEndDay:boolean) {
      const hour = snapshot.hour;
      const value = snapshot.value;

      if (isStartDay && hour < cutoffHour) return;
      if (isEndDay && hour >= cutoffHour) return;

      if (hour < crossoverHour) {
        buckets[bucketName].day[localDay] = (buckets[bucketName].day[localDay] || 0) + value;
        buckets.all.day[localDay] = (buckets.all.day[localDay] || 0) + value;
        // If TZ conversion changes the month or year, then we need to calculate per-hour values in order to assign data
        // to the correct month/year buckets.
        if (localMonth !== nextDayMonth) {
          buckets[bucketName].month[localMonth] = (buckets[bucketName].month[localMonth] || 0) + value;
          buckets[bucketName].year[localYear] = (buckets[bucketName].year[localYear] || 0) + value;
          buckets.all.month[localMonth] = (buckets.all.month[localMonth] || 0) + value;
          buckets.all.year[localYear] = (buckets.all.year[localYear] || 0) + value;
        }
      } else {
        buckets[bucketName].day[nextDay] = (buckets[bucketName].day[nextDay] || 0) + value;
        buckets.all.day[nextDay] = (buckets.all.day[nextDay] || 0) + value;
        if (localMonth !== nextDayMonth) {
          buckets[bucketName].month[nextDayMonth] = (buckets[bucketName].month[nextDayMonth] || 0) + value;
          buckets[bucketName].year[nextDayYear] = (buckets[bucketName].year[nextDayYear] || 0) + value;
          buckets.all.month[nextDayMonth] = (buckets.all.month[nextDayMonth] || 0) + value;
          buckets.all.year[nextDayYear] = (buckets.all.year[nextDayYear] || 0) + value;
        }
      }
    }

    // When timezone conversion does not change the month/year value, then we can aggregate month and year data more quickly by
    // simply adding the whole day's value to the month/year, rather than parsing out individual hours.
    if (localMonth === nextDayMonth) {
      buckets.ticket.month[localMonth] = (buckets.ticket.month[localMonth] || 0) + snapshot.ticketSales;
      buckets.ecommerce.month[localMonth] = (buckets.ecommerce.month[localMonth] || 0) + snapshot.ecommerceSales;
      buckets.loyalty.month[localMonth] = (buckets.loyalty.month[localMonth] || 0) + snapshot.loyaltySales;

      buckets.ticket.year[localYear] = (buckets.ticket.year[localYear] || 0) + snapshot.ticketSales;
      buckets.ecommerce.year[localYear] = (buckets.ecommerce.year[localYear] || 0) + snapshot.ecommerceSales;
      buckets.loyalty.year[localYear] = (buckets.loyalty.year[localYear] || 0) + snapshot.loyaltySales;

      buckets.all.month[localMonth] = (buckets.all.month[localMonth] || 0) + snapshot.ticketSales + snapshot.ecommerceSales + snapshot.loyaltySales;
      buckets.all.year[localYear] = (buckets.all.year[localYear] || 0) + snapshot.ticketSales + snapshot.ecommerceSales + snapshot.loyaltySales;
    }

    snapshot.ticketSalesTimeSeries.forEach( ticketSnapshot => sortIntoBucket(ticketSnapshot, 'ticket', isStartDay, isEndDay));
    snapshot.ecommerceSalesTimeSeries.forEach( ecommerceSnapshot => sortIntoBucket(ecommerceSnapshot, 'ecommerce', isStartDay, isEndDay));
    snapshot.loyaltySalesTimeSeries.forEach( loyaltySnapshot => sortIntoBucket(loyaltySnapshot, 'loyalty', isStartDay, isEndDay));
  });

  const arrayBuckets = {
    all: {
      day: objectToArrayOfObjectsj(buckets.all.day, 'ts', 'value'),
      month: objectToArrayOfObjectsj(buckets.all.month, 'ts', 'value'),
      year: objectToArrayOfObjectsj(buckets.all.year, 'ts', 'value'),
    },
    ticket: {
      day: objectToArrayOfObjectsj(buckets.ticket.day, 'ts', 'value'),
      month: objectToArrayOfObjectsj(buckets.ticket.month, 'ts', 'value'),
      year: objectToArrayOfObjectsj(buckets.ticket.year, 'ts', 'value'),
    },
    ecommerce: {
      day: objectToArrayOfObjectsj(buckets.ecommerce.day, 'ts', 'value'),
      month: objectToArrayOfObjectsj(buckets.ecommerce.month, 'ts', 'value'),
      year: objectToArrayOfObjectsj(buckets.ecommerce.year, 'ts', 'value'),
    },
    loyalty: {
      day: objectToArrayOfObjectsj(buckets.loyalty.day, 'ts', 'value'),
      month: objectToArrayOfObjectsj(buckets.loyalty.month, 'ts', 'value'),
      year: objectToArrayOfObjectsj(buckets.loyalty.year, 'ts', 'value'),
    },
  };

  return arrayBuckets;
}


// Converts bucket data into a format which can be read by our charts
export async function formatTimeseriesDataIntoChartData(bucket: dashboardArrayBucket): Promise<{ts: number, data: string;}[]> {
  const promiseObject = {
    daily: formatDailyTimescaleData(sortTsData(bucket.day)),
    monthly: formatMonthlyTimescaleData(sortTsData(bucket.month)),
    yearly: formatYearlyTimescaleData(sortTsData(bucket.year))
  }
  return await runPromises(promiseObject);
}

// Converts data into a format which can be read by our charts, then grooms it so that our blanks are filled in
export const formatDailyTimescaleData = (data: any) => {
  let timescaleData = []
  let i = 0

  if (!!data) {
    let length = data.length;
    while (i < length) {
      let category = dayjs(data[i].ts).format('MMM D')
      let categoryFull = dayjs(data[i].ts).format('ll')

      timescaleData.push(
        {
          timestamp: data[i].ts,
          x: category,
          y: data[i].value,
          dateString: categoryFull,
        }
      )
      i++
    }
  }
  return groomDailyData(timescaleData);
}

// Converts data into a format which can be read by our charts, then grooms it so that our blanks are filled in
export const formatMonthlyTimescaleData = (data: any) => {
  let timescaleData = []
  let i = 0

  if (!!data) {
    let length = data.length;
    while (i < length) {
      let category = dayjs(data[i].ts).format('MMM, YYYY')
      let categoryFull = dayjs(data[i].ts).format('MMM, YYYY')

      timescaleData.push(
        {
          timestamp: data[i].ts,
          x: category,
          y: data[i].value,
          dateString: categoryFull,
        }
      )
      i++
    }
  }
  return groomMonthlyData(timescaleData);
}

// Converts data into a format which can be read by our charts, then grooms it so that our blanks are filled in
export const formatYearlyTimescaleData = (data: any) => {
  let timescaleData = []
  let i = 0
  if (data) {
    let length = data.length;
    while (i < length) {
      let category = dayjs(data[i].ts).format('YYYY')
      let categoryFull = dayjs(data[i].ts).format('YYYY')

      timescaleData.push(
        {
          timestamp: data[i].ts,
          x: category,
          y: data[i].value,
          dateString: categoryFull,
        }
      )
      i++
    }
  }
  return groomYearlyData(timescaleData);
}



// Grooms the data, filling in blanks so that our our chart is fully populated from the earliest date to the latest date
const groomYearlyData = (data: any) => {
  let patchedAndSorted = []
  let cats = []
  let i = 0
  let length = data.length;
  while (i < length) {
    if (i > 0) {
      let yearDiff = dayjs(data[i].timestamp).diff(dayjs(data[i-1].timestamp), 'year')
      for (let j = 1; j < yearDiff; j++) {
        cats.push({
          category: dayjs(data[i-1].timestamp).add(j, 'year').format('YYYY'),
          dateString: dayjs(data[i-1].timestamp).add(j, 'year').format('YYYY')
        })
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

// Grooms the data, filling in blanks so that our our chart is fully populated from the earliest date to the latest date
const groomMonthlyData = (data:any) => {
  let patchedAndSorted = []
  let cats = []
  let i = 0
  let length = data.length;
  while (i < length) {
    if (i > 0) {
      let dayDiff = dayjs(data[i].timestamp).diff(dayjs(data[i-1].timestamp), 'month')
      for (let j = 1; j < dayDiff; j++) {
        cats.push({
          category: dayjs(data[i-1].timestamp).add(j, 'month').format('MMM YYYY'),
          dateString: dayjs(data[i-1].timestamp).add(j, 'month').format('MMM YYYY')
        })
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

// Grooms the data, filling in blanks so that our our chart is fully populated from the earliest date to the latest date
const groomDailyData = (data: any) => {
  let patchedAndSorted = []
  let cats = []
  let i = 0
  let length = data.length;
  while (i < length) {
    if (i > 0) {
      let dayDiff = dayjs(data[i].timestamp).diff(dayjs(data[i-1].timestamp), 'day')
      for (let j = 1; j < dayDiff; j++) {
        cats.push({
          category: dayjs(data[i-1].timestamp).add(j, 'day').format('MMM D'),
          dateString: dayjs(data[i-1].timestamp).add(j, 'day').format('MMM DD, YYYY')
        })
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

export function sortTsData(data: {ts: string; value: string;}[]): {ts: number, value: string;}[] {
  return data.map((item:any) => {
    return {
      ts: dayjs(item.ts).valueOf(),
      value: item.value,
    }
  }).sort((a:any, b:any) => {
    if (a.ts > b.ts) return 1;
    if (a.ts < b.ts) return -1;
    return 0;
  });
}
