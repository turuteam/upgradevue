export function formatSalesData(activities = [], purchases = []) {
  const timePeriods = {};
  if (!activities || activities.length === 0) return timePeriods;
  const campaignAndAttendanceActivity = activities.filter( activity => activity.type.indexOf('event-attendance') > -1 || activity.type.indexOf('campaign-registration') > -1);

  const checkedCampaignOids = [];
  const checkedEventOids = [];
  campaignAndAttendanceActivity.forEach( activity => {
    const activityTime = activity.datetime;

    if (!activityTime) {
      if (!timePeriods.unspecified) timePeriods.unspecified = {
        totalCampaigns: 0,
        totalEvents: 0,
        totalSales: 0,
        totalPurchases: 0,
      };
      if (activity.type.indexOf('event') > -1 && checkedEventOids.indexOf(activity.additionalInfo.eventOid) < 0) {
        timePeriods.unspecified.totalEvents += 1;
        checkedEventOids.push(activity.additionalInfo.eventOid);
      }
      if (activity.type.indexOf('campaign') > -1 && checkedCampaignOids.indexOf(activity.additionalInfo.campaignOid) < 0) {
        timePeriods.unspecified.totalCampaigns += 1;
        checkedCampaignOids.push(activity.additionalInfo.campaignOid);
      }
      return;
    }

    const yearValue = activityTime.length >=4 ? activityTime.substr(0,4) : null;
    const monthValue = activityTime.length >=7 ? activityTime.substr(5,2) : null;
    const dayValue = activityTime.length >=10 ? activityTime.substr(8,2) : null;

    if(!yearValue) return;
    if(!monthValue) return;
    if(!dayValue) return;

    // Adding a reasonable minimum year value, and setting maximum to current year. Should prevent promoters from breaking things by accidentally adding wonky year values in CSV uploads
    if(parseInt(yearValue) < 1980 || parseInt(yearValue) > new Date().getFullYear()) return;

    // Create the sub-objects if they don't exist
    if (!timePeriods[yearValue]) timePeriods[yearValue] = {
      totalCampaigns: 0,
      totalEvents: 0,
      totalSales: 0,
      totalPurchases: 0,
      months: {},
    };
    if (!timePeriods[yearValue].months[monthValue]) timePeriods[yearValue].months[monthValue] = {
      totalCampaigns: 0,
      totalEvents: 0,
      totalSales: 0,
      totalPurchases: 0,
      days: {},
    };
    if (!timePeriods[yearValue].months[monthValue].days[dayValue]) timePeriods[yearValue].months[monthValue].days[dayValue] = {
      totalCampaigns: 0,
      totalEvents: 0,
      totalSales: 0,
      totalPurchases: 0,
    };

    // Increment the values within each sub-object as we iterate through them
    if (activity.type.indexOf('event-attendance') > -1 && checkedEventOids.indexOf(activity.additionalInfo.eventOid) < 0) {
      timePeriods[yearValue].totalEvents += 1;
      timePeriods[yearValue].months[monthValue].totalEvents += 1;
      timePeriods[yearValue].months[monthValue].days[dayValue].totalEvents += 1;
      checkedEventOids.push(activity.additionalInfo.eventOid);
    }
    if (activity.type.indexOf('campaign-registration') > -1 && checkedCampaignOids.indexOf(activity.additionalInfo.campaignOid) < 0) {
      timePeriods[yearValue].totalCampaigns += 1;
      timePeriods[yearValue].months[monthValue].totalCampaigns += 1;
      timePeriods[yearValue].months[monthValue].days[dayValue].totalCampaigns += 1;
      checkedCampaignOids.push(activity.additionalInfo.campaignOid);
    }
  });

  purchases.forEach( purchase => {
    const orderDate = purchase.purchaseDateTime;

    if (!orderDate) {
      if (!timePeriods.unspecified) timePeriods.unspecified = {
        totalCampaigns: 0,
        totalEvents: 0,
        totalSales: 0,
        totalPurchases: 0,
      };
      timePeriods.unspecified.totalPurchases += 1;
      timePeriods.unspecified.totalSales += purchase.calculatedGrossTotal;

      return;
    }
    const yearValue = orderDate.length >=4 ? orderDate.substr(0,4) : null;
    const monthValue = orderDate.length >=7 ? orderDate.substr(5,2) : null;
    const dayValue = orderDate.length >=10 ? orderDate.substr(8,2) : null;
    if(!yearValue) return;
    if(!monthValue) return;
    if(!dayValue) return;

    // Adding a reasonable minimum year value, and setting maximum to current year. Should prevent promoters from breaking things by accidentally adding wonky year values in CSV uploads
    if(parseInt(yearValue) < 1980 || parseInt(yearValue) > new Date().getFullYear()) return;

    // Create the sub-objects if they don't exist
    if (!timePeriods[yearValue]) timePeriods[yearValue] = {
      totalCampaigns: 0,
      totalEvents: 0,
      totalSales: 0,
      totalPurchases: 0,
      months: {},
    };
    if (!timePeriods[yearValue].months[monthValue]) timePeriods[yearValue].months[monthValue] = {
      totalCampaigns: 0,
      totalEvents: 0,
      totalSales: 0,
      totalPurchases: 0,
      days: {},
    };
    if (!timePeriods[yearValue].months[monthValue].days[dayValue]) timePeriods[yearValue].months[monthValue].days[dayValue] = {
      totalCampaigns: 0,
      totalEvents: 0,
      totalSales: 0,
      totalPurchases: 0,
    };

    // Increment the values within each sub-object as we iterate through them
    timePeriods[yearValue].totalPurchases += 1;
    timePeriods[yearValue].months[monthValue].totalPurchases += 1;
    timePeriods[yearValue].months[monthValue].days[dayValue].totalPurchases += 1;

    timePeriods[yearValue].totalSales += purchase.grossTotal || 0;
    timePeriods[yearValue].months[monthValue].totalSales += purchase.grossTotal || 0;
    timePeriods[yearValue].months[monthValue].days[dayValue].totalSales += purchase.grossTotal || 0;
  });

  return timePeriods;
}

// Generates dummy sales data for use as placeholder data
export function dummySalesData() {
  const timePeriods = {};
  const thisYear = new Date().getFullYear();
  const lastYear = new Date().getFullYear() - 1;
  timePeriods[lastYear] = generateMonthsData();
  timePeriods[thisYear] = generateMonthsData();

  function generateMonthsData() {
    const timePeriods = {
      totalCampaigns: 0,
      totalEvents: 0,
      totalSales: 0,
      totalPurchases: 0,
      months: {},
    }
    const days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const months = {};
    days.forEach( (dayCount, index) => {
      const calculatedIndex = index < 10 ? `0${index}` : `${index}`;
      months[calculatedIndex] = generateDaysData(dayCount);
      timePeriods.totalCampaigns += months[calculatedIndex].totalCampaigns;
      timePeriods.totalEvents += months[calculatedIndex].totalEvents;
      timePeriods.totalSales += months[calculatedIndex].totalSales;
      timePeriods.totalPurchases += months[calculatedIndex].totalPurchases;
    });
    timePeriods.months = months;
    return timePeriods;
  }


  function generateDaysData(days) {
    const chanceOfCampaignRegistration = 0.035;
    const chanceOfGoingToEvent = 0.03;
    const chanceOfPurchase = 0.05;
    const data = {
      totalCampaigns: 0,
      totalEvents: 0,
      totalSales: 0,
      totalPurchases: 0,
      days: {}
    }
    for (let i = 1; i <= days; i++) {
      const hasCampaign = Math.random() < chanceOfCampaignRegistration;
      const hasEvent = Math.random() < chanceOfGoingToEvent;
      const hasPurchase = Math.random() < chanceOfPurchase;
      if (!hasEvent && !hasCampaign && !hasPurchase) continue;
      const purchaseAmount = Math.round(Math.random() * 23500);
      const calculatedI = i < 10 ? `0${i}` : `${i}`;
      data.days[calculatedI] = {
        totalCampaigns: hasCampaign ? 1 : 0,
        totalEvents: hasEvent ? 1 : 0,
        totalSales: hasPurchase ? purchaseAmount : 0,
        totalPurchases: hasPurchase ? 1 : 0,
      };
      if (hasCampaign) data.totalCampaigns++;
      if (hasEvent) data.totalEvents++;
      if (hasPurchase) data.totalSales+= purchaseAmount;
      if (hasPurchase) data.totalPurchases++;
    }

    return data;
  }

  return timePeriods;
}

export function dummyPurchaseData() {
  return [
    {
      "description": "Not a Real Event",
      "currencyCode": "USD",
      "quantity": 1,
      "source": {
        "platform": "Audience Republic",
        "icon": "ar-logo"
      },
      "orderId": "po-1337c0d3",
      "status": "completed",
      "purchaseDateTime": "2020-06-09T01:56:15",
      "tax": 0,
      "fees": 0,
      "feesGross": 0,
      "inclusiveFees": 0,
      "inclusiveFeesGross": 0,
      "grossTotal": 1000,
      "calculatedGrossTotal": 1000,
      "lineItems": [
        {
          "ticketType": "Livestream: This is a false livestream name",
          "singlePrice": 1000,
          "subtotalPrice": 1000,
          "totalPrice": null,
          "image": "",
          "quantity": 1,
          "counted": true
        }
      ]
    },
    {
      "description": "Big Festival",
      "currencyCode": "USD",
      "quantity": 2,
      "source": {
        "platform": "CSV Import",
        "icon": "ticket"
      },
      "orderId": "0973795",
      "status": "completed",
      "purchaseDateTime": "2020-03-19T09:17:12",
      "tax": 0,
      "fees": 0,
      "feesGross": 0,
      "inclusiveFees": 0,
      "inclusiveFeesGross": 0,
      "grossTotal": 3500,
      "calculatedGrossTotal": 3500,
      "lineItems": [
        {
          "ticketType": "GA: Big Massive Festival",
          "singlePrice": 3500,
          "subtotalPrice": 3500,
          "totalPrice": null,
          "image": "",
          "quantity": 2,
          "counted": true
        }
      ]
    },
    {
      "description": "Yet Another Event Name Here",
      "currencyCode": "USD",
      "quantity": 1,
      "source": {
        "platform": "Audience Republic",
        "icon": "ar-logo"
      },
      "orderId": "abc123",
      "status": "completed",
      "purchaseDateTime": "2019-11-02T19:15:12",
      "tax": 0,
      "fees": 0,
      "feesGross": 0,
      "inclusiveFees": 0,
      "inclusiveFeesGross": 0,
      "grossTotal": 12850,
      "calculatedGrossTotal": 12850,
      "lineItems": [
        {
          "ticketType": "VIP: Limited Release",
          "singlePrice": 12850,
          "subtotalPrice": 12850,
          "totalPrice": null,
          "image": "",
          "quantity": 1,
          "counted": true
        }
      ]
    },
    {
      "description": "Short-name",
      "currencyCode": "USD",
      "quantity": 1,
      "source": {
        "platform": "Eventbrite",
        "icon": "eventbrite"
      },
      "orderId": "725",
      "status": "completed",
      "purchaseDateTime": "2018-05-22T10:55:12",
      "tax": 0,
      "fees": 0,
      "feesGross": 0,
      "inclusiveFees": 0,
      "inclusiveFeesGross": 0,
      "grossTotal": 9599,
      "calculatedGrossTotal": 9599,
      "lineItems": [
        {
          "ticketType": "GA: Second release",
          "singlePrice": 9599,
          "subtotalPrice": 9599,
          "totalPrice": null,
          "image": "",
          "quantity": 1,
          "counted": true
        }
      ]
    },
    {
      "description": "Expensive Refund",
      "currencyCode": "USD",
      "quantity": 1,
      "source": {
        "platform": "Eventbrite",
        "icon": "eventbrite"
      },
      "orderId": "po-1337c0d3",
      "status": "refunded",
      "purchaseDateTime": "2018-04-22T10:55:12",
      "tax": 0,
      "fees": 0,
      "feesGross": 0,
      "inclusiveFees": 0,
      "inclusiveFeesGross": 0,
      "grossTotal": 12300,
      "calculatedGrossTotal": 12300,
      "lineItems": [
        {
          "ticketType": "GA: First release",
          "singlePrice": 12300,
          "subtotalPrice": 12300,
          "totalPrice": null,
          "image": "",
          "quantity": 1,
          "counted": false
        }
      ]
    },
    {
      "description": "2017 End of Year Festival Name",
      "currencyCode": "USD",
      "quantity": 1,
      "source": {
        "platform": "Eventbrite",
        "icon": "eventbrite"
      },
      "orderId": "991100554ab",
      "fanEventOrderOid": 123,
      "status": "completed",
      "purchaseDateTime": "2017-04-309T16:41:12",
      "tax": 0,
      "fees": 0,
      "feesGross": 0,
      "inclusiveFees": 0,
      "inclusiveFeesGross": 0,
      "oid": 742859,
      "eventOid": 5335,
      "campaignOid": 1887,
      "grossTotal": 15000,
      "calculatedGrossTotal": 15000,
      "lineItems": [
        {
          "ticketType": "GA: Third release",
          "singlePrice": 15000,
          "subtotalPrice": 15000,
          "totalPrice": null,
          "image": "",
          "quantity": 1,
          "counted": true
        }
      ]
    }
  ]
};


export function dummyFanEvents() {
  return [
    {
      "description": null,
      "sysCtime": "2020-06-09T01:54:22Z",
      "meta": {
        "synch": {}
      },
      "ticketStats": [{
        "attendees": 1,
        "oid": 2,
        "totalTicketSales": 10000,
        "totalTicketsSold": 1,
        "totalTicketSalesFormatted": "$100.00",
        "totalTicketsSoldFormatted": "1"
      }],
      "endDate": "2026-01-01T01:00:00Z",
      "name": "Example Event",
      "campaigns": [
        {
          "type": "presale",
          "name": "Example Event",
          "urlSlug": "a",
        },
      ],
      "startDate": "2018-12-30T01:00:00Z",
      "resources": [],
      "location": "Somewhere",
      "timeZone": "Australia/Sydney"
    },
    {
      "description": null,
      "sysCtime": "2020-06-09T01:54:22Z",
      "meta": {
        "synch": {}
      },
      "ticketStats": [{
        "attendees": 1,
        "oid": 2,
        "totalTicketSales": 23000,
        "totalTicketsSold": 3,
        "totalTicketSalesFormatted": "$230.00",
        "totalTicketsSoldFormatted": "3"
      }],
      "endDate": "2026-01-01T01:00:00Z",
      "name": "Example Event Number 2",
      "campaigns": [
        {
          "type": "presale",
          "name": "Example Event",
          "urlSlug": "a",
        },
      ],
      "startDate": "2019-12-30T01:00:00Z",
      "resources": [],
      "location": "Somewhere",
      "timeZone": "Australia/Sydney"
    },
  ]
};



export function dummyFanCampaigns() {
  return [
    {
      "sysCtime": "2020-08-04T06:03:06Z",
      "endDate": "2020-01-01T01:00:00Z",
      "name": "Longer Campaign Name with a Date 2025",
      "type": "presale",
      "eventOid": 5335,
      "urlSlug": "future-event-1",
      "summaryStatsSnapshot": {
        "oid": 6573,
        "allRegistrations": 1,
        "uniqueViews": 1
      },
      "presentation": {
        "timeZone": "Australia/Sydney",
        "metaTitle": "adadadadada",
        "description": "asdfasdf",
        "metaDescription": "sdsdsdsdsdsdsd"
      },
      "startDate": "2019-01-01T01:00:00Z",
      "resources": []
    },

    {
      "sysCtime": "2020-08-04T06:03:06Z",
      "endDate": "2019-01-01T01:00:00Z",
      "name": "Short Campaign Name",
      "type": "presale",
      "eventOid": 5335,
      "urlSlug": "future-event-1",
      "summaryStatsSnapshot": {
        "oid": 6573,
        "allRegistrations": 1,
        "uniqueViews": 1
      },
      "presentation": {
        "timeZone": "Australia/Sydney",
        "metaTitle": "adadadadada",
        "description": "asdfasdf",
        "metaDescription": "sdsdsdsdsdsdsd"
      },
      "startDate": "2018-01-01T01:00:00Z",
      "resources": []
    }
  ]
}


export function dummyFanActivity(type = 'all') {
  const activities = [];
  if (type === 'all' || type === 'campaign-registration') {
    activities.push({
      "imagePath": null,
      "title": "<strong>Person's Name</strong> registered for <strong>A campaign with a relatively long name</strong>",
      "subtitle": "",
      "datetime": "2020-08-04T06:03:32.932975",
      "text": "",
      "link": "",
      "icon": {
        "name": "campaign-bolt",
        "iconColor": "#FFF",
        "iconBackground": "#FFF",
        "width": "24px",
        "height": "24px"
      },
      "type": [
        "campaign-registration"
      ],
      "additionalInfo": {
        "campaignOid": null
      },
      "oid": "campaign-a"
    })
  }
  if (type === 'all' || type === 'fan-message') {
    activities.push({
      "imagePath": "",
      "title": "<strong>You</strong> sent a message to <strong>Person's Name</strong>",
      "subtitle": "",
      "datetime": "2020-06-29T04:19:30.979112",
      "text": "This is the message which you sent them. It's a bit long so that we can see what it looks like over two lines. It should also probably include a link at the end...",
      "icon": {
        "name": "messenger",
        "iconColor": "#0490ff",
        "iconBackground": "#FFF",
        "width": "24px",
        "height": "24px"
      },
      "type": [
        "fan-message",
        "facebook"
      ],
      "oid": "message-a",
      "additionalInfo": {
        "taskOid": null
      },
      "link": null,
    });
    activities.push({
      "imagePath": "",
      "title": "<strong>You</strong> sent a message to <strong>Person's Name</strong>",
      "subtitle": "",
      "datetime": "2020-05-18T01:00:07.564704",
      "text": "This is a short SMS message",
      "icon": {
        "name": "sms",
        "iconColor": "#2dc26a",
        "iconBackground": null,
        "width": "20px",
        "height": "20px"
      },
      "type": [
        "fan-message",
        "sms"
      ],
      "oid": "message-b",
      "additionalInfo": {
        "taskOid": null
      },
      "link": null
    });
  }
  if (type === 'all' || type === 'event-purchase') {
    activities.push({
      "imagePath": null,
      "title": "<strong>Person's Name</strong> purchased <strong>GA Tickets</strong> to <strong>Your Next Big Event</strong>",
      "subtitle": "$100.00",
      "datetime": "2020-06-09T01:56:15",
      "text": "",
      "link": null,
      "icon": {
        "name": "ticket",
        "iconColor": "",
        "iconBackground": "",
        "width": "24px",
        "height": "24px"
      },
      "type": [
        "event-purchase",
        "important",
        "audience-republic"
      ],
      "additionalInfo": {
        "totalAmount": 9600,
        "totalQuantity": 1,
        "eventOid": null
      },
      "oid": "purchase-a"
    });
  }

  return activities;
};




// ----------------------------------
// AGGREGATE SALES DATA
// Aggregates all of the sales data provided by `formatSalesDataFromCustomer`, filtered by time period
// ----------------------------------

export function aggregateSalesData(formattedSalesData, timePeriod) {
  const exportedSalesData = {
    totalTicketSales: 0,
    totalPurchases: 0,
    totalEvents: 0,
    totalCampaigns: 0,
  };

  timePeriod = {
    customStart: null,
    customEnd: null,
    period: null,
    ...timePeriod,
  }

  if(!formattedSalesData || Object.keys(formattedSalesData).length === 0) return exportedSalesData;

  let earliestYear = false;
  let earliestMonth = false;
  let earliestDay = false;
  const currentDate = new Date();
  let currYear = currentDate.getFullYear();
  let currMonth = currentDate.getMonth() + 1;
  let currDay = currentDate.getDate();
  let daysRange = 0;

  if(timePeriod.period === 1) {
    const thirtyDaysAgo = new Date().setDate(currentDate.getDate() - 30);
    earliestYear = new Date(thirtyDaysAgo).getFullYear();
    earliestMonth = new Date(thirtyDaysAgo).getMonth() + 1;
    earliestDay = new Date(thirtyDaysAgo).getDate();
    daysRange = 30;

  } else if (timePeriod.period === 'custom' && timePeriod.customStart && timePeriod.customEnd) {
    earliestYear = timePeriod.customStart.getFullYear();
    earliestMonth = timePeriod.customStart.getMonth() + 1;
    earliestDay = timePeriod.customStart.getDate();
    currYear = timePeriod.customEnd.getFullYear();
    currMonth = timePeriod.customEnd.getMonth() + 1;
    currDay = timePeriod.customEnd.getDate();
    daysRange = timePeriod.customEnd.getTime() - timePeriod.customStart.getTime();
    daysRange = Math.floor(daysRange / (1000 * 60 * 60 * 24));

  } else if(timePeriod.period !== 'all') {
    const years = Math.floor((timePeriod.period - 1) / 12);
    const months = ((timePeriod.period - 1) % 12);
    const earliestDate = new Date(currYear - years, currMonth - months, 1);
    earliestYear = earliestDate.getFullYear();
    earliestMonth = earliestDate.getMonth();
    daysRange = Math.floor((new Date(currYear, currMonth, currDay).getTime() - new Date(earliestYear, earliestMonth, 1).getTime()) / (1000 * 60 * 60 * 24));
  }

  // Ranges needing date specificity will count and display days
  // Not the most efficient, so we only do it this way when we have to.
  // TODO - Refactor so that we don't iterate over the whole daysRange. We should instead set a minimum and maximum date, and then iterate over the dataset, stopping once we've hit the upper/lower bounds
  if (timePeriod.period === 1 || timePeriod.period === 'custom') {

    for(let x = 0; x <= daysRange; x++) {
      const testDate = new Date(currYear, currMonth - 1, currDay - x);
      const testYear = testDate.getFullYear();
      const testMonth = testDate.getMonth() + 1;
      const prettyMonth = testMonth >= 10 ? testMonth.toString() : `0${testMonth}`;
      const testDay = testDate.getDate();
      const prettyDay = testDay >= 10 ? testDay.toString() : `0${testDay}`;

      const currYearsMonths = formattedSalesData[testYear] ? Object.keys(formattedSalesData[testYear].months) : [];
      const currMonthDays = formattedSalesData[testYear] && formattedSalesData[testYear].months[prettyMonth] ?  Object.keys(formattedSalesData[testYear].months[prettyMonth].days) : [];

      const totalTicketSales = currYearsMonths.indexOf(prettyMonth) > -1 && currMonthDays.indexOf(prettyDay) > -1 ? formattedSalesData[testYear].months[prettyMonth].days[prettyDay].totalSales : 0;
      const totalPurchases = currYearsMonths.indexOf(prettyMonth) > -1 && currMonthDays.indexOf(prettyDay) > -1 ? formattedSalesData[testYear].months[prettyMonth].days[prettyDay].totalPurchases : 0;
      const totalEvents = currYearsMonths.indexOf(prettyMonth) > -1 && currMonthDays.indexOf(prettyDay) > -1 ? formattedSalesData[testYear].months[prettyMonth].days[prettyDay].totalEvents : 0;
      const totalCampaigns = currYearsMonths.indexOf(prettyMonth) > -1 && currMonthDays.indexOf(prettyDay) > -1 ? formattedSalesData[testYear].months[prettyMonth].days[prettyDay].totalCampaigns : 0;

      exportedSalesData.totalTicketSales += totalTicketSales;
      exportedSalesData.totalPurchases += totalPurchases;
      exportedSalesData.totalEvents += totalEvents;
      exportedSalesData.totalCampaigns += totalCampaigns;
    }

    // All other ranges will count and use months only
    // We use full month values here - thus when someone picks "Last 6 months" on the 15th of Feb, they'll get Feb 15th through to September 1st the previous year.
    // This is done to ensure consistency with the sales chart data, which has to work this way for display purposes (can't have a month displaying less sales than it really has on the chart!)
    // TODO - Refactor so that we don't iterate over the whole months range. We should instead set a minimum and maximum month, and then iterate over the dataset, stopping once we've hit the upper/lower bounds
  } else {
    const totalMonths = ((currYear - earliestYear) * 12) - earliestMonth + currMonth;
    for(let x = 1; x <= totalMonths + 1; x++) {
      const testDate = new Date(currYear, currMonth - x );
      const testYear = testDate.getFullYear();
      const testMonth = testDate.getMonth() + 1;
      const prettyMonth = testMonth >= 10 ? testMonth.toString() : `0${testMonth}`;

      const currYearsMonths = formattedSalesData[testYear] ? Object.keys(formattedSalesData[testYear].months) : [];

      const totalTicketSales = currYearsMonths.indexOf(prettyMonth) > -1 ? formattedSalesData[testYear].months[prettyMonth].totalSales : 0;
      const totalPurchases = currYearsMonths.indexOf(prettyMonth) > -1 ? formattedSalesData[testYear].months[prettyMonth].totalPurchases : 0;
      const totalEvents = currYearsMonths.indexOf(prettyMonth) > -1 ? formattedSalesData[testYear].months[prettyMonth].totalEvents : 0;
      const totalCampaigns = currYearsMonths.indexOf(prettyMonth) > -1 ? formattedSalesData[testYear].months[prettyMonth].totalCampaigns : 0;

      exportedSalesData.totalTicketSales += totalTicketSales;
      exportedSalesData.totalPurchases += totalPurchases;
      exportedSalesData.totalEvents += totalEvents;
      exportedSalesData.totalCampaigns += totalCampaigns;
    }

    if(timePeriod.period === 'all' && !!formattedSalesData.unspecified) {
      exportedSalesData.totalTicketSales += formattedSalesData.unspecified.totalSales || 0;
      exportedSalesData.totalPurchases += formattedSalesData.unspecified.totalPurchases || 0;
      exportedSalesData.totalEvents += formattedSalesData.unspecified.totalEvents || 0;
      exportedSalesData.totalCampaigns += formattedSalesData.unspecified.totalCampaigns || 0;
    }

  }
  return exportedSalesData;
}






 // ----------------------------------
 // FILLED SALES DATA
 // Returns sales data by time period, filling in missing zeroes where no data exists. Suitable for use in a chart
 // Group by day, month or year
 // ----------------------------------

export function filledSalesData(formattedSalesData, timePeriod, grouping = 'month') {

  timePeriod = {
    customStart: null,
    customEnd: null,
    period: null,
    ...timePeriod,
  }

  const filledData = [];

  if(formattedSalesData && Object.keys(formattedSalesData).length > 0) {
    let earliestYear = false;
    let earliestMonth = false;
    let earliestDay = false;
    let currYear = new Date().getFullYear();
    let currMonth = new Date().getMonth() + 1;
    let currDay = new Date().getDate();
    let daysRange = 0;


    // First, get the range of days we want to measure...
    if(timePeriod.period === 1) {
      const currentDate = new Date();
      const thirtyDaysAgo = new Date().setDate(currentDate.getDate() - 30);
      earliestYear = new Date(thirtyDaysAgo).getFullYear();
      earliestMonth = new Date(thirtyDaysAgo).getMonth() + 1;
      earliestDay = new Date(thirtyDaysAgo).getDate();
      daysRange = 30;
    } else if (timePeriod.period === 'custom' && timePeriod.customStart && timePeriod.customEnd) {
      earliestYear = timePeriod.customStart.getFullYear();
      earliestMonth = timePeriod.customStart.getMonth() + 1;
      earliestDay = timePeriod.customStart.getDate();
      currYear = timePeriod.customEnd.getFullYear();
      currMonth = timePeriod.customEnd.getMonth() + 1;
      currDay = timePeriod.customEnd.getDate();
      daysRange = timePeriod.customEnd.getTime() - timePeriod.customStart.getTime();
      daysRange = Math.floor(daysRange / (1000 * 60 * 60 * 24));
    } else if(timePeriod.period !== 'all') {
      const years = Math.floor((timePeriod.period - 1) / 12);
      const months = ((timePeriod.period - 1) % 12);
      earliestYear = currYear - years;
      earliestMonth = currMonth - months;
      daysRange = Math.floor((new Date(currYear, currMonth, currDay).getTime() - new Date(earliestYear, earliestMonth, 1).getTime()) / (1000 * 60 * 60 * 24));
    } else {
      let originalYearKeys = Object.keys(formattedSalesData);
      let purchaseDataExists = false;
      if(originalYearKeys.length > 0) {
        purchaseDataExists = formattedSalesData[originalYearKeys[0]].totalCampaigns || formattedSalesData[originalYearKeys[0]].totalEvents || formattedSalesData[originalYearKeys[0]].totalPurchases || formattedSalesData[originalYearKeys[0]].totalSales;
      }
      if(purchaseDataExists) {
        const sortedYears = Object.keys(formattedSalesData).sort( (a, b) => {
          if(a < b) return -1;
          if(b < a) return 1;
          return 0;
        });
        earliestYear = sortedYears[0];

        const sortedMonths = (Object.keys(formattedSalesData[earliestYear].months) ? Object.keys(formattedSalesData[earliestYear].months) : [1]).sort( (a, b) => {
          if(a < b) return -1;
          if(b < a) return 1;
          return 0;
        });
        earliestMonth = sortedMonths[0];

        const sortedDays = (Object.keys(formattedSalesData[earliestYear].months[earliestMonth]) ? Object.keys(formattedSalesData[earliestYear].months[earliestMonth].days) : 1).sort( (a, b) => {
          if(a < b) return -1;
          if(b < a) return 1;
          return 0;
        });
        earliestDay = sortedDays[0];

        daysRange = Math.floor((new Date(currYear, currMonth, currDay).getTime() - new Date(earliestYear, earliestMonth, earliestDay).getTime()) / (1000 * 60 * 60 * 24));
      }
    }


    // Then, collate the data based on groupings and date ranges.
      // 'Custom ranges', 'all time' and 'single month' will always need to count days, regardless of grouping type
      // Other range types can count by grouping
    if (grouping === 'day' || timePeriod.period === 1 || timePeriod.period === 'custom') {
      // In these instances, always count data by Days, but save it potentially in other formats
      for(let x = 0; x <= daysRange; x++) {
        const testDate = new Date(currYear, currMonth - 1, currDay - x);
        const testYear = testDate.getFullYear();
        const testMonth = testDate.getMonth() + 1;
        const prettyMonth = testMonth >= 10 ? testMonth.toString() : `0${testMonth}`;
        const testMonthName = testDate.toLocaleString('default', { month: 'short'});
        const longMonthName = testDate.toLocaleString('default', { month: 'long'});
        const testDay = testDate.getDate();
        const prettyDay = testDay >= 10 ? testDay.toString() : `0${testDay}`;
        const currYearsMonths = formattedSalesData[testYear] ? Object.keys(formattedSalesData[testYear].months) : [];
        const currMonthDays = formattedSalesData[testYear] && formattedSalesData[testYear].months[prettyMonth] ?  Object.keys(formattedSalesData[testYear].months[prettyMonth].days) : [];
        // Check formatted data to see if the data for this day exists
        // If not, put in an empty value
        const moneyValue = currYearsMonths.indexOf(prettyMonth) > -1 && currMonthDays.indexOf(prettyDay) > -1 ? formattedSalesData[testYear].months[prettyMonth].days[prettyDay].totalSales / 100 : 0;
        if (grouping === 'day') {
          const shortYear =  testYear.toString().substr(2,2);
          if(!filledData.some( item => item.timePeriod === `${prettyMonth}${prettyDay}${shortYear}`)) filledData.push({
            timePeriod: `${testYear}${prettyMonth}${prettyDay}`,
            prettyName: `${prettyDay} ${testMonthName} ${shortYear}`,
            longName: `${prettyDay} ${longMonthName} ${testYear}`,
            moneyValue: moneyValue,
          });
        } else if (grouping === 'month') {
          const itemExists = filledData.findIndex( item => item.timePeriod === `${testYear}${prettyMonth}`);
          if(itemExists === -1) {
            filledData.push({
              timePeriod: `${testYear}${prettyMonth}`,
              prettyName: `${testMonthName} ${testYear.toString().substr(2,2)}`,
              longName: `${longMonthName} ${testYear}`,
              moneyValue: moneyValue,
            });
          } else {
            filledData[itemExists].moneyValue += moneyValue;
          }
        } else {
          const itemExists = filledData.findIndex( item => item.timePeriod === `${testYear}`);
          if(itemExists === -1) {
            filledData.push({
              timePeriod: `${testYear}`,
              prettyName: `${testYear}`,
              longName: `${testYear}`,
              moneyValue: moneyValue,
            });
          } else {
            filledData[itemExists].moneyValue += moneyValue;
          }
        }
      }


    } else if (grouping === 'month') {
      const totalMonths = ((currYear - earliestYear) * 12) - earliestMonth + currMonth;
      for(let x = 1; x <= totalMonths + 1; x++) {
        const testDate = new Date(currYear, currMonth - x );
        const testYear = testDate.getFullYear();
        const testMonth = testDate.getMonth() + 1;
        const prettyMonth = testMonth >= 10 ? testMonth.toString() : `0${testMonth}`;
        const longMonthName = testDate.toLocaleString('default', { month: 'long'});
        const testMonthName = testDate.toLocaleString('default', { month: 'short'});
        const currYearsMonths = formattedSalesData[testYear] ? Object.keys(formattedSalesData[testYear].months) : [];
        const moneyValue = currYearsMonths.indexOf(prettyMonth) > -1 ? formattedSalesData[testYear].months[prettyMonth].totalSales / 100 : 0;
        if(!filledData.some( item => item.timePeriod === `${testYear}${prettyMonth}`)) filledData.push({
          timePeriod: `${testYear}${prettyMonth}`,
          prettyName: `${testMonthName} ${testYear.toString().substr(2,2)}`,
          longName: `${longMonthName} ${testYear}`,
          moneyValue,
        });
      }


    } else {
      const totalYears = currYear - earliestYear;
      for(let x = 0; x < totalYears + 1; x++) {
        const testDate = new Date(currYear - x, 0, 1);
        const testYear = testDate.getFullYear();
        const moneyValue = !!formattedSalesData[testYear] ? formattedSalesData[testYear].totalSales / 100 : 0;
        if(!filledData.some( item => item.timePeriod === `${testYear}`)) filledData.push({
          timePeriod: `${testYear}`,
          prettyName: `${testYear.toString()}`,
          longName: `${testYear}`,
          moneyValue,
        });
      }
    }
  }

  // Finally, sort the data by timePeriod, so that its all in the correct order
  filledData.sort( (a, b) => {
    if(a.timePeriod < b.timePeriod) return -1;
    if(b.timePeriod < a.timePeriod) return 1;
    return 0;
  });

  return filledData;
}
