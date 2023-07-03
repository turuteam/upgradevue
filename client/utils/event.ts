import moment from 'moment';
import { AREvent } from "@/store/modules/event/types";

export const eventLastImport = ({ meta, lastImport }: any) => {

  // Events store the last import time in the Event meta data, in each synch.
  const { synch } = meta

  // For each synch value accumulate the sys-mtime (or modified-time) and track the most
  // recent import.
  let mostRecentModifiedTime: any = null
  if (lastImport) {
    return moment(lastImport)
  } else if (synch) {
    Object.keys(synch).forEach(key => {
      // TODO: some latest synch objects  has no modified and lastSyncTimeEnd fields, need to fix this after check backend.
      const sysMTime = synch[key].sysMtime ||
                      synch[key].modified ||
                      synch[key].lastSynchTimeEnd;
      if (!mostRecentModifiedTime || moment(sysMTime).isAfter(mostRecentModifiedTime))
        mostRecentModifiedTime = moment.utc(sysMTime)
    })
  }

  return mostRecentModifiedTime;
};

export const isSyncing = (event: any) => {
  if (event.meta && event.meta.synch) {
    const synchKeys = Object.keys(event.meta.synch);

    return synchKeys.some(key => {
      // NOTE/RK
      // event.meta.synch values without state or integrationOid will
      // have undefined, not null (like events with CSV imports)
      // Need to account for this when checcking sync status
      const localState = event.meta.synch[key].state || null;
      const integrationOid =  event.meta.synch[key].integrationOid || null;
      return (localState === "pending" || localState === "in-progress") && integrationOid !== null
    });
  } else {
    return false;
  }
};

export const isMerging = (event: any) => {
  if (event.meta && event.meta.merge) {
    return event.meta.merge.state === "in-progress";
  } else {
    return false;
  }
};

export function generateDateForEmail(event: AREvent): string {
  let format;
  const timeZoneAbbr = moment().tz(event.timeZone).zoneAbbr();
  if (/^[+-]?\d+$/.test(timeZoneAbbr)) {
    // If timezone abbreviation is -12 ~ +12, let's add prefix "GMT" to it, otherwise it's meaningless.
    format = 'dddd MMMM Do YYYY, hh:mma [GMT]z';
  } else {
    format = 'dddd MMMM Do YYYY, hh:mma z';
  }
  return moment(event.startDate).tz(event.timeZone).format(format);
};

export const getEventPurchaseTicketUrl = (event: AREvent): string | null => {
  return event.additionalInfo?.purchaseTicketUrl || null;
};

export function generateDateRangeForEventsModal(event: AREvent): string | null {
  const {
    startDate,
    endDate,
    timeZone,
  } = event;

  if (!timeZone) {
    return null;
  }

  if (!startDate && !endDate) {
    return null;
  } else if (startDate && !endDate) {
    return moment.utc(startDate).tz(timeZone).format('MMM D, YYYY');
  } else {
    const startMoment = moment.utc(startDate).tz(timeZone);
    const endMoment = moment.utc(endDate).tz(timeZone);
    if (startMoment.diff(endMoment, 'days') === 0) {
      return startMoment.format('MMM D, YYYY');
    } else if (startMoment.diff(endMoment, 'years') === 0) {
      return `${startMoment.format('MMM D')} - ${endMoment.format('MMM D, YYYY')}`;
    } else {
      return `${startMoment.format('MMM D, YYYY')} - ${endMoment.format('MMM D, YYYY')}`;
    }
  }
};
