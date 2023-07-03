import { PromoterIntegrationTask } from '@/api/promoter-integration-task/types';
import { FormattedPromoterTask } from './types';
import dayjs from 'dayjs';


function generateClickthrough(task: PromoterIntegrationTask): string {
  if (!!task.messageListOid) {
    return `/message-center/lists/${task.messageListOid}/contacts`;
  } else if (!!task.messageTaskOid) {
    return `/message-center/messages/${task.messageTaskOid}/view`;
  } else if (!!task.campaignOid) {
    return `/campaigns/${task.campaignOid}/view/dashboard`;
  } else if (!!task.eventOid) {
    return `/events/${task.eventOid}/view/sales`;
  } else if (task.name === 'fan-message') {
    if (task.provider === 'sms') {
      return `/message-center/messages/${task.oid}/view/recipients`;
    }
    return `/message-center/messages/${task.oid}/view/overview`;
  }
  return '/audience';
}


function taskStartDateFormatter(taskStartedDate: string): string {
  const taskStartedObj = dayjs(taskStartedDate)

  if (taskStartedObj.month() > 1 && taskStartedObj.month() < 8) {
    return taskStartedObj.format('hh:mm a, MMMM D, YYYY')
  }
  return taskStartedObj.format('hh:mm a, MMM. D, YYYY')
}

export function formatTask(task: PromoterIntegrationTask): FormattedPromoterTask | null {
  let name = '';
  let subtitle = '';
  let type = task.name;
  let icon = '';
  let clickthrough = generateClickthrough(task);
  let status = task.status;

  const importTypeMap = new Map();
  importTypeMap.set('audience-contact', ["List import", "List importing", "List imported"])
  importTypeMap.set('audience-sales', ["Audience import", "Audience importing", "Audience imported"])
  importTypeMap.set('audience', ["Ticket sales import", "Ticket sales importing", "Ticket sales imported"])
  importTypeMap.set('event', ["Events import", "Events importing", "Events imported"])
  importTypeMap.set('event-and-audience', ["Events & tickets import", "Events & tickets importing", "Events & tickets imported"])
  importTypeMap.set('product-order', ["POS import", "POS orders importing", "POS orders imported"])
  importTypeMap.set('event-and-product-order', ["Events & POS import", "Events & POS importing", "Events & POS imported"])

  const taskStatusBinary = task.status === 'completed' ? 'completed' : 'running';
  const commonSubtitle = `Started ${taskStartDateFormatter(task?.started)}`;

  const taskStatusSuffix = taskStatusBinary === 'completed' ? 'ed' : 'ing'
  const fanCount = task.statusDetails?.fanOids?.length;
  const displayFanCount = fanCount ? fanCount : ''
  const fanCountSuffix = fanCount && fanCount > 1 ? 's' : ''
  // use pattern below
  // name = `Edit${taskStatusSuffix} ${displayFanCount} contact${fanCountSuffix}`;

  if (type?.includes('background') && type?.includes('import')) {
    const fileName = task.meta?.bucketMeta?.filename || ""
    const assetType = task.meta?.bucketMeta?.assetType
    const importTypeOptions = importTypeMap.get(assetType) || ["Import", "Importing", "Imported"];
    const importText = taskStatusBinary === 'completed' ? importTypeOptions[2] : importTypeOptions[1];

    name = `${fileName.length >= 20 ? fileName.substring(0, 20) + '...' : fileName} - ${importText}`;
    subtitle = commonSubtitle;
    icon = 'upload';

  } else if (type === 'mass-edit-tags') {
    name = `Edit${taskStatusSuffix} contact tags`;
    subtitle = commonSubtitle;
  } else if (type === 'background-event-import-csv') {
    name = "Mass events import";
    subtitle = `started ${dayjs(task.started).format('hh:mm a')}`;
    icon = 'upload';

  }else if (type === 'mass-edit-tags') {
    name = "Mass edit contact tags";
    subtitle = `started ${dayjs(task.started).format('hh:mm a')}`;
    icon = 'edit';

  } else if (type === 'mass-edit-fan-attributes') {
    // the statusDetails contains the fanOids. But it is null now.
    name = `Edit${taskStatusSuffix} ${displayFanCount} contact${fanCountSuffix}`;
    subtitle = commonSubtitle;
    icon = 'edit';

  } else if (type === 'mass-edit-message-list') {
    name = `Edit${taskStatusSuffix} list subscriptions`;
    subtitle = commonSubtitle;
    icon = 'edit';

  } else if (type === 'mass-delete-fans') {
    name = `Delet${taskStatusSuffix} ${displayFanCount} contact${fanCountSuffix}`;
    subtitle = commonSubtitle;
    icon = 'discard';

  } else if (type === "fan-message") {
    const messageSubject = task.meta?.messageBody?.subject ?? '';
    name = `${messageSubject} - email sent`;
    icon = 'email';

  } else if (type === 'fan-export-csv') {
    const totalFanSynched = task.statusDetails?.totalFanSynched;
    name = `Export${taskStatusSuffix} ${totalFanSynched ? totalFanSynched : ''} contact${totalFanSynched > 1 ? 's' : ''}`;
    icon = 'export';

  } else if (type === 'message-list-oid-fan-export-csv') {
    name = `Export${taskStatusSuffix} contacts from list`;
    icon = 'export';

  } else if (type === 'audience-filter-fan-export-csv') {
    name = `Export${taskStatusSuffix} contacts`;
    icon = 'export';

  } else if (type === 'message-task-oid-fan-export-csv') {
    name = `Export${taskStatusSuffix} message recipients`;
    icon = 'export';

  } else if (type === 'loyalty-programs-data-synch') {
    const provider = task.provider && task.provider?.length > 0 ? task.provider.charAt(0).toUpperCase() + task.provider.slice(1) : 'loyalty program';
    name = `Data sync${taskStatusSuffix} from ${provider}`;
    icon = 'audience-alt';

  } else if (type === 'event-data-synch') {
    const provider = task.provider && task.provider?.length > 0 ? task.provider.charAt(0).toUpperCase() + task.provider.slice(1) : 'integration';
    name = `Data sync${taskStatusSuffix} from ${provider}`;
    icon = 'audience-alt';

  } else if (type === 'fans-to-custom-audience-synch') {
    name = `Facebook Custom Audience sync${taskStatusSuffix}`;
    icon = 'audience-alt';

  } else if (type === 'delete-event-pos-orders') {
    name = `Clear${taskStatusSuffix} event POS orders`;
    icon = 'discard';

  } else if (type === 'delete-event-ticket-sales') {
    name = `Clear${taskStatusSuffix} event ticket sales`;
    icon = 'discard';

  } else {
    return null;
  }

  return {
    name,
    subtitle,
    type,
    icon,
    clickthrough,
    startTime: task.started,
    status,
  }
}


export function pendingTasksOfResourceAndOid(pendingTasks: PromoterIntegrationTask[], resource: string, oid: number) {
  // @ts-ignore
  return pendingTasks.filter(item => item[resource] === parseInt(oid));
}


export function pendingTaskOfTypeAndResourceAndOid(pendingTasks: PromoterIntegrationTask[], type: string, resource: string, oid: number) {
  // @ts-ignore
  return pendingTasks.filter(item => item.name === type && item[resource] === parseInt(oid));
}
