import { Customer } from '@/api/customer-profile/types';
import { PrunedCustomer, PrunedActivity, PrunedPurchase } from './types';
import { CommonPuchase, PatreonPuchase } from '@/types/resources/purchase';
import moment from 'moment';
// @ts-ignore
import accounting from 'accounting';
import { countryList } from '~/utils/countries';
import { convertToTitleCase } from '~/utils/helpers';
import { formatFanName } from '~/store/modules/audience/utils';

function formatActivityCampaignRegistration(activity: ActivityCampaignRegistration, fanName: string): PrunedActivity {
  // HACK - The server is sometimes returning an objet here, and sometimes a string (and sometimes null).
  // This inconsistency is very bad, but this hack will prevent the UI from failing when this happens...
  let eventProvider;
  if (activity?.additionalInfo?.settings?.platform && typeof activity?.additionalInfo?.settings?.platform === 'object') {
    eventProvider = activity.additionalInfo.settings.platform.type
  } else if (activity?.additionalInfo?.type === 'rsvp') {
    eventProvider = 'calendar';
  }
  else {
    eventProvider =
      activity?.additionalInfo?.settings?.platform ||
      activity?.additionalInfo?.event?.provider
  }

  let iconColor:any = '#FFF'

  if (eventProvider) {
    if (eventProvider === 'zoom') {
      iconColor = '#2196F3';
    } else if (eventProvider === 'eventbrite') {
      iconColor = '#F7682F'
    } else if (eventProvider === 'universe') {
      iconColor = '#3A66E5'
    } else if (eventProvider === 'youtube') {
      iconColor = '#e10302'
    } else if (eventProvider === 'calendar') {
      iconColor = null;
    }
  }

  return {
    imagePath: eventProvider ? null : getActivityImage(activity) || null,
    title: `<strong>${fanName}</strong> registered for <strong>${activity.additionalInfo.name}</strong>`,
    subtitle: '',
    datetime: activity.activityTime,
    text: '',
    path: `/campaigns/${activity.campaignOid}/view/dashboard`,
    link: null,
    icon: {
      name: eventProvider ? eventProvider : 'campaign-bolt',
      iconColor: iconColor,
      iconBackground: iconColor ? '' : '#FFF',
      width: '24px',
      height: '24px',
    },
    type: ['campaign-registration'],
    additionalInfo: {
      campaignOid: activity.campaignOid,
    },
    oid: `campaign-${activity.oid}-${activity.activityTime}`,
  }
}

function formatActivityEventAttendance(activity: ActivityEventAttendance, fanName: string): PrunedActivity {
  const startDate = activity.activityTime ? moment(activity.activityTime).valueOf() : null;
  const isInFuture = startDate && startDate > moment(new Date).valueOf();

  const eventProvider = activity.additionalInfo.eventProvider
  let iconColor = ''

  if (eventProvider) {
    if (eventProvider == 'zoom') {
      iconColor = '#2196F3';
    } else if (eventProvider == 'eventbrite') {
      iconColor = '#F7682F';
    } else if (eventProvider == 'universe') {
      iconColor = '#3A66E5';
    }
  }

  return {
    imagePath: eventProvider ? null : activity.additionalInfo.eventImageUrl || null,
    title: isInFuture ? `<strong>${fanName}</strong> will be attending <strong>${activity.additionalInfo.eventName}</strong>` : `<strong>${fanName}</strong> attended <strong>${activity.additionalInfo.eventName}</strong>`,
    subtitle: ``,
    datetime: activity.activityTime,
    text: ``,
    path: `/events/${activity.eventOid}/view/sales`,
    link: null,
    icon: {
      name: eventProvider ? eventProvider : 'calendar',
      iconColor: iconColor,
      iconBackground: ``,
      width: '24px',
      height: '24px',
    },
    type: ['event-attendance', 'important'],
    additionalInfo: {
      eventOid: activity.eventOid,
    },
    oid: `event-${activity.oid}-${activity.activityTime}`,
  }
}

function formatActivityFanMessage(activity: ActivityFanMessage, fanName: string): PrunedActivity {
  const isFailed = activity.additionalInfo.status === 'failed' || activity.additionalInfo.status === 'bounced';

  let messageBody = '';
  // Legacy fix - some message are stored as JSON blobs and need to be parsed, so lets wrap it in a try/catch
  try {
    messageBody = JSON.parse(activity.additionalInfo.messageBody).message.text;
  } catch(e) {
    messageBody = activity.additionalInfo.messageBody;
  }

  return <PrunedActivity>{
    imagePath: ``,
    title: isFailed ? `<strong>You</strong> tried to send a message to <strong>${fanName}</strong>` : `<strong>You</strong> sent a message to <strong>${fanName}</strong>`,
    subtitle: isFailed ? `Message failed to send` : ``,
    datetime: activity.activityTime,
    text: messageBody,
    icon: {
      name: getIcon(activity.additionalInfo.provider, 'message').name,
      iconColor: getIcon(activity.additionalInfo.provider, 'message').iconColor,
      iconBackground: getIcon(activity.additionalInfo.provider, 'message').backgroundColor,
      width: getIcon(activity.additionalInfo.provider, 'message').width,
      height: getIcon(activity.additionalInfo.provider, 'message').height,
    },
    type: ['fan-message', activity.additionalInfo.provider],
    oid: `message-${activity.oid}-${activity.activityTime}`,
    additionalInfo: {
      taskOid: activity.taskOid,
    },
    path: `/message-center/messages/${activity.taskOid}/view/overview`,
    link: null,
  }
}

function formatActivityPatreonLoyaltyProgramAction(activity: ActivityPatreonLoyaltyProgramAction, fanName: string, fanOid: number, fanEmailAddress: string): PrunedActivity {
  const iconColorMap: any = {
    patreon: '#FB424D',
  };

  let loyaltyTierTitle = activity.additionalInfo.loyaltyTierTitle;
  const displayValue = activity.additionalInfo.actionCost?.displayValue || null;
  let patreonActionCopy;
  let subtitle = null;
  switch (activity.additionalInfo.actionType) {
    case 'pledge_start':
      patreonActionCopy = 'became a member of your Patreon';
      if (loyaltyTierTitle) {
        subtitle = loyaltyTierTitle;
      } else {
        subtitle = 'Custom pledge';
      }
      break;
    case 'pledge_upgrade':
      patreonActionCopy = `changed their Patreon membership tier`;
      subtitle = `Upgraded to ${loyaltyTierTitle}`;
      break;
    case 'pledge_downgrade':
      patreonActionCopy = `changed their Patreon membership tier`;
      subtitle = `Downgraded to ${loyaltyTierTitle}`;
      break;
    case 'pledge_delete':
      patreonActionCopy = `cancelled their Patreon membership`;
      if (loyaltyTierTitle) {
        subtitle = loyaltyTierTitle;
      } else {
        subtitle = 'Custom pldege';
      }
      break;
    case 'subscription':
      patreonActionCopy = 'made a payment for your Patreon';
      subtitle = displayValue;
      if (activity.additionalInfo.actionPaymentStatus !== 'paid') {
        subtitle += ` (${convertToTitleCase(activity.additionalInfo.actionPaymentStatus)})`;
      }
      break;
    default:
      break;
  }

  let title = `<strong>${fanName}</strong> ${patreonActionCopy}`;
  let icon = formatProviderIcon(activity.additionalInfo.provider);
  let path = null;
  let link = null;
  if (fanOid && displayValue) {
    path = `/audience/${fanOid}/view/purchases`;
  } else {
    link = `https://www.patreon.com/members?membershipType=active_patron&query=${encodeURIComponent(fanEmailAddress)}` || null;
  }

  return {
    imagePath: null,
    title: title,
    subtitle,
    datetime: activity.activityTime,
    text: ``,
    path,
    link,
    icon: {
      name: icon,
      iconColor: iconColorMap[activity.additionalInfo.provider],
      iconBackground: ``,
      width: '24px',
      height: '24px',
    },
    type: ['loyalty-program-action', 'important', activity.additionalInfo.provider],
    additionalInfo: {},
    oid: `purchase-${activity.oid}-${activity.activityTime}`,
  }
}

function formatActivityPurchase(activity: ActivityPurchase, fanName: string, fanOid: number): PrunedActivity {
  let cost = activity.additionalInfo.totalCost.displayValue || accounting.formatMoney(activity.additionalInfo.totalCost.value / 100);

  const eventImageObject = activity.additionalInfo.resources ? activity.additionalInfo.resources.find( resource => resource.assetType === 'event-image') : null;
  let eventImageUrl = '';
  if (eventImageObject) {
    eventImageUrl = eventImageObject.url;
  }

  const providerMap: any = {
    shopify: 'Shopify',
    stripe: 'Stripe',
  };

  const iconColorMap: any = {
    shopify: null,
    stripe: '#635BFF',
  };

  let title;
  let providerString = '';

  if (activity.additionalInfo.provider && providerMap[activity.additionalInfo.provider]) {
    providerString = `from <strong>${providerMap[activity.additionalInfo.provider]}</strong>`
  } else if (activity.additionalInfo.sourceType === 'CSV') {
    providerString = `<strong>(CSV import)</strong>`;
  }

  if (!!activity.additionalInfo.quantity) {
    title = `<strong>${fanName}</strong> purchased <strong>${activity.additionalInfo.quantity} item${activity.additionalInfo.quantity > 1 ? 's' : ''}</strong> ${providerString}`;
  } else {
    title = `<strong>${fanName}</strong> made a purchase ${providerString}`;
  }

  let icon = formatProviderIcon(activity.additionalInfo.provider);

  return {
    imagePath: eventImageUrl,
    title: title,
    subtitle: cost,
    datetime: activity.activityTime,
    text: ``,
    path: `/audience/${fanOid}/view/purchases`,
    link: null,
    icon: {
      name: icon,
      iconColor: iconColorMap[activity.additionalInfo.provider],
      iconBackground: ``,
      width: '24px',
      height: '24px',
    },
    type: ['event-purchase', 'important', activity.additionalInfo.provider],
    additionalInfo: {
      totalAmount: activity.additionalInfo.totalCost.value,
      totalQuantity: activity.additionalInfo.quantity,
      purchaseOid: activity.purchaseOid,
      eventOid: activity.eventOid,
    },
    oid: `purchase-${activity.oid}-${activity.activityTime}`,
  }
}

function formatActivityEventPurchase(activity: ActivityEventPurchase, fanName: string): PrunedActivity {
  let cost = activity.additionalInfo.totalCost / 100;

  let purchaseType = 'ticket';
  if (activity.additionalInfo.campaignType === 'livestream') {
    purchaseType = 'livestream';
  } else if (activity.additionalInfo.campaignType === 'donation') {
    purchaseType = 'donation';
  } else if (activity.additionalInfo.campaignType === 'preorder') {
    purchaseType = 'product';
  }

  const eventImageObject = activity.additionalInfo.resources ? activity.additionalInfo.resources.find( resource => resource.assetType === 'event-image') : null;
  let eventImageUrl = '';
  if (eventImageObject) {
    eventImageUrl = eventImageObject.url;
  }

  let title = '';
  let icon = '';

  switch (purchaseType) {
      case "donation":
        title = `<strong>${fanName}</strong> donated to <strong>${activity.additionalInfo.eventName}</strong>`;
        icon = 'gift';
        break;
      case "product":
        title = `<strong>${fanName}</strong> purchased <strong>${activity.additionalInfo.quantity} product${activity.additionalInfo.quantity > 1 ? 's' : ''}</strong> from <strong>${activity.additionalInfo.eventName}</strong>`
        icon = 'tag';
        break;
      case "livestream":
        title = `<strong>${fanName}</strong> purchased <strong>Live Stream access</strong> to <strong>${activity.additionalInfo.eventName}</strong>`;
        icon = 'ticket';
        break;
      case "ticket":
      default:
        title = `<strong>${fanName}</strong> purchased <strong>${activity.additionalInfo.quantity} ticket${activity.additionalInfo.quantity > 1 ? 's' : ''}</strong> to <strong>${activity.additionalInfo.eventName}</strong>`;
        icon = 'ticket';
        break;
  }

  return {
    imagePath: eventImageUrl,
    title: title,
    subtitle: accounting.formatMoney(cost),
    datetime: activity.activityTime,
    text: ``,
    path: `/events/${activity.eventOid}/view/sales`,
    link: null,
    icon: {
      name: icon,
      iconColor: ``,
      iconBackground: ``,
      width: '24px',
      height: '24px',
    },
    type: ['event-purchase', 'important', activity.additionalInfo.provider],
    additionalInfo: {
      totalAmount: activity.additionalInfo.totalCost,
      totalQuantity: activity.additionalInfo.quantity,
      purchaseOid: activity.purchaseOid,
      eventOid: activity.eventOid,
    },
    oid: `purchase-${activity.oid}-${activity.activityTime}`,
  }
}


function getIcon(provider: string, activityType: string) {
  let name = provider;
  if (!provider && activityType === 'message') name = 'dialogue';
  if (provider === 'facebook' && activityType === 'message') name = 'messenger';

  let width = '24px';
  let height = '24px';
  switch(provider) {
    case 'email':
      height = '18px';
      break;
    case 'sms':
      width = '20px';
      height = '20px';
      break;
  }


  let backgroundColor = null;
  switch(provider) {
    case 'email':
    case 'messenger':
    case 'facebook':
    case 'eventbrite':
    case 'shopify':
      backgroundColor = '#FFF';
      break;
    case 'lightspeed':
      backgroundColor = '#ed5153';
      break;
    case 'csv':
    case 'pos':
      backgroundColor = '#7344c0';
      break;
    case 'spotify':
      backgroundColor = '#20dc6c';
      break;
    default:
      backgroundColor = null;
      break;
  }

  let iconColor = null;
  switch(provider) {
    case 'email':
      iconColor = '#7344c0';
      break;
    case 'messenger':
    case 'facebook':
      iconColor = '#0490ff';
      break;
    case 'sms':
      iconColor = '#2dc26a';
      break;
    case 'lightspeed':
    case 'csv':
    case 'pos':
    case 'spotify':
      iconColor = '#FFF';
      break;
    default:
      iconColor = null;
      break;
  }

  return {
    name,
    backgroundColor,
    iconColor,
    width,
    height,
  };
}

function getActivityImage(activity: ActivityCampaignRegistration) {
  if (!activity.additionalInfo.resources || activity.additionalInfo.resources.length < 1) return null;
  let image = activity.additionalInfo.resources.find( resource => resource.assetType === 'campaign-image' || resource.assetType === 'event-image');
  return image && image.url || null;
}

export function formatActivity(
  activityCollection: (ActivityCampaignRegistration | ActivityEventAttendance | ActivityFanMessage | ActivityEventPurchase | ActivityPurchase | ActivityPatreonLoyaltyProgramAction)[],
  customer?: PrunedCustomer,
): PrunedActivity[] {
  let fanName = '';
  let fanOid = 0;
  let fanEmailAddress = '';

  // Customer may not always be present when formatting activity. In these instances, the activity items themselves
  // will typically contain the fan data.
  if (customer) {
    fanName = customer.name || "Fan";
    fanOid = customer.oid;
    fanEmailAddress = customer.emailAddress;
  }

  return activityCollection.map( (activity) => {
    let currentNameName = (fanName.length === 0 && activity.fanPromoterAccount) ? formatFanName(activity.fanPromoterAccount) : fanName;
    if (fanOid === 0 && activity.fanPromoterAccount) fanOid = activity.fanPromoterAccount.oid;
    if (fanEmailAddress.length === 0 && activity.fanPromoterAccount) fanEmailAddress = activity.fanPromoterAccount.emailAddress;
    switch(activity.activityType) {
      case "event-attendance":
        return formatActivityEventAttendance(activity, currentNameName);
      case "event-purchase":
        return formatActivityEventPurchase(activity, currentNameName);
      case "fan-message":
        return formatActivityFanMessage(activity, currentNameName);
      case "ecommerce-purchase":
        // @ts-ignore
        return formatActivityPurchase(activity, currentNameName, fanOid);
      case "loyalty-program-action":
        // Currently we only have "Patreon", but we will add some if-else conditions here
        // once we get more.
        return formatActivityPatreonLoyaltyProgramAction(activity, currentNameName, fanOid, fanEmailAddress);
      case "campaign-registration":
        return formatActivityCampaignRegistration(activity, currentNameName);
      default:
        return formatActivityCampaignRegistration(activity, currentNameName);
    }
  });
}

// We can also put in special cases to deal with provider names that need to be formatted (eg, replacing hyphens with spaces)
function formatPlatformName(provider: string, sourceType?: string): string {
  if (!provider && !sourceType) return '';
  if (!provider && !!sourceType) {
    if (sourceType === 'CSV' && !provider) return '';
    if (sourceType === 'API') {
      if (provider === 'eventbrite') {
        return 'Eventbrite';
      }
      if (provider === 'universe') {
        return 'Universe';
      }
      if (provider === 'patreon') {
        return 'Patreon';
      }
    }
    return '';
  }
  if (provider && provider.toLowerCase() === 'audience-republic') return 'Audience Republic';
  return convertToTitleCase(provider);
}

// We can map proivider names to icons here, if necessary
function formatProviderIcon(name: string): string {
  switch(name) {
    case 'eventbrite':
      return 'eventbrite';
    case 'audience-republic':
      return 'ar-logo';
    case 'shopify':
      return 'shopify';
    case 'patreon':
      return 'patreon';
    case 'zoom':
      return 'zoom';
    case 'universe':
      return 'universe';
    case 'stripe':
      return 'stripe';
    default:
      return 'ticket';
  }
}

function formatProviderIconColor(name: string): string | null {
  switch(name) {
    case 'eventbrite':
      return '#F7682F';
    case 'audience-republic':
      return null;
    case 'shopify':
      return null;
    case 'patreon':
      return 'patreon';
    case 'zoom':
      return '#2196F3';
    case 'universe':
      return '#3A66E5';
    case 'stripe':
      return '#635BFF';
    default:
      return null;
  }
}

export function formatPurchases(purchasesCollection: (CommonPuchase | PatreonPuchase)[]): PrunedPurchase[] {
  return purchasesCollection.map((purchase) => {
    if (purchase.provider === 'patreon') {
      // @ts-ignore
      return formatPatreonPurchases(purchase);
    } else {
      // @ts-ignore
      return formatCommonPurchases(purchase);
    }
  });
}

export function formatCommonPurchases(purchase: CommonPuchase): PrunedPurchase {
  let description = ``;
  let image = '';
  if (purchase.campaign && purchase.campaign.name) {
    let imageResource = purchase.campaign.resources ? purchase.campaign.resources.find( item => item.assetType === 'campaign-image') : null;
    if (imageResource && imageResource.url) {
      image = imageResource.url;
    }
    description = purchase.campaign.name;
  } else if (purchase.event.eventImageUrl) {
    description = purchase.event.name;
    image = purchase.event.eventImageUrl;
  } else {
    description = purchase.event.name;
  }

  const totalTax = purchase.totalCostBreakdown.tax || 0;
  const totalQuantity = Math.max(purchase.lineItems.reduce( (acc, item) => acc + item.totalTickets, 0), purchase.totalTickets);



  const totalGross = purchase.totalCostBreakdown.gross || 0;
  let calculatedGross = totalGross;
  if (purchase.status === 'refunded') {
    calculatedGross = 0;
  } else {
    purchase.lineItems.forEach( currentItem => {
      const cost = currentItem.cost && currentItem.cost.value ? currentItem.cost.value : 0;
      const fee = currentItem.fee && currentItem.fee.value ? currentItem.fee.value : 0;
      if (currentItem.counted === false) calculatedGross -= (cost + fee);
    }, 0);
  }

  const taxModifier = totalTax ? (totalTax / (totalGross - totalTax)) + 1 : 1;

  let inclusivelineItemFees = 0;
  let inclusiveLineItemFeesGross = 0;
  let lineItemFeesGross = 0;

  const lineItemFees = purchase.lineItems.reduce((acc, currentItem) => {
    const fees = currentItem.fee && currentItem.fee.value ? currentItem.fee.value : 0;
    inclusivelineItemFees += (fees * currentItem.totalTickets);
    inclusiveLineItemFeesGross += (Math.round(fees * taxModifier) * currentItem.totalTickets);
    if (currentItem.counted === false || purchase.status === 'refunded' || purchase.status === 'cancelled') return acc;
    lineItemFeesGross += (Math.round(fees * taxModifier) * currentItem.totalTickets);
    return acc + fees;
  }, 0);

  const lineItems = purchase.lineItems.map( lineItem => {
    if (purchase.provider === 'stripe') {
      // Stripe doesnt give us a per unit breakdown, so we have to put that together ourselves
      return {
        ticketType: lineItem.name,
        singlePrice: (lineItem.cost ? lineItem.cost.value : 0) / (lineItem.totalTickets || 1),
        subtotalPrice: lineItem.cost ? lineItem.cost.value : 0,
        totalPrice: (lineItem.fee ? lineItem.fee.value : 0) + (lineItem.cost ? lineItem.cost.value : 0),
        feesAndTaxes: lineItem.fee ? lineItem.fee.value : 0,
        image,
        quantity: lineItem.totalTickets,
        counted: lineItem.counted,
      }
    }
    return {
      ticketType: lineItem.name,
      singlePrice: lineItem.cost ? lineItem.cost.value : 0,
      subtotalPrice: (lineItem.cost ? lineItem.cost.value : 0) * lineItem.totalTickets,
      totalPrice: (lineItem.fee ? lineItem.fee.value : 0) + ((lineItem.cost ? lineItem.cost.value : 0) * lineItem.totalTickets),
      feesAndTaxes: lineItem.fee ? lineItem.fee.value : 0,
      image,
      quantity: lineItem.totalTickets,
      counted: lineItem.counted,
    }
  });

  let status;
  if (purchase.status === 'cancelled') {
    status = 'cancelled';
  } else if (purchase.lineItems.every(lineItem => lineItem.counted === false) || purchase.status === 'refunded') { // Yes, i want to explicitly check for false, !lineItem.counted won't do
    status = 'refunded';
  } else if (purchase.lineItems.every( lineItem => lineItem.counted === true)) { // Yes, i want to explicitly check for true, lineItem.counted won't do
    status = 'completed';
  } else if (purchase.lineItems.some(lineItem => lineItem.counted === false) && purchase.lineItems.some( lineItem => lineItem.counted === true)) {
    status = 'partial-refund';
  } else {
    status = 'completed';
  }

  return {
    description,
    currencyCode: purchase.currencyCode,
    quantity: totalQuantity,
    source: {
      platform: purchase.sourceType === 'CSV' ? 'CSV Import' : formatPlatformName(purchase.provider, purchase.sourceType),
      description: purchase.sourceType === 'CSV' ? formatPlatformName(purchase.provider, purchase.sourceType) : purchase.type,
      icon: formatProviderIcon(purchase.provider),
      iconColor: formatProviderIconColor(purchase.provider),
    },
    orderId: purchase.orderId,
    fanEventOrderOid: purchase.event.oid,
    fanProductOrderOid: purchase.fanProductOrderOid,
    status,
    purchaseDateTime: purchase.orderDate,
    tax: totalTax,
    fees: lineItemFees,
    feesGross: lineItemFeesGross,
    inclusiveFees: inclusivelineItemFees,
    inclusiveFeesGross: inclusiveLineItemFeesGross,
    oid: purchase.oid,
    eventOid: purchase.eventOid,
    campaignOid: purchase.campaignOid,
    grossTotal: totalGross,
    calculatedGrossTotal: calculatedGross,
    lineItems: lineItems,
  };
}

export function formatPatreonPurchases(purchase: PatreonPuchase): PrunedPurchase {
  const lineItems = purchase.lineItems.map(lineItem => {
    return {
      ticketType: lineItem.loyaltyTierName,
      singlePrice: lineItem.gross,
      subtotalPrice: lineItem.gross,
      totalPrice: lineItem.gross,
      feesAndTaxes: 0,
      image: null,
      quantity: 1,
      counted: true,
    }
  });

  return {
    description: lineItems[0].ticketType,
    currencyCode: purchase.currencyCode,
    quantity: 1,
    source: {
      platform: purchase.sourceType === 'CSV' ? 'CSV Import' : formatPlatformName(purchase.provider, purchase.sourceType),
      description: purchase.sourceType === 'CSV' ? formatPlatformName(purchase.provider, purchase.sourceType) : purchase.type,
      icon: formatProviderIcon(purchase.provider),
      iconColor: formatProviderIconColor(purchase.provider),
    },
    orderId: purchase.orderId,
    fanEventOrderOid: purchase.event.oid,
    fanProductOrderOid: purchase.fanProductOrderOid,
    status: purchase.status,
    purchaseDateTime: purchase.orderDate,
    tax: 0,
    fees: 0,
    feesGross: 0,
    inclusiveFees: 0,
    inclusiveFeesGross: 0,
    oid: purchase.oid,
    eventOid: purchase.eventOid,
    campaignOid: purchase.campaignOid,
    grossTotal: purchase.totalCostBreakdown.gross,
    calculatedGrossTotal: 0,
    lineItems,
  }
};

// Returns a nicely formatted location string
export function formatCustomerLocation(customer: Customer): string {
  let locationString = '';
  const relevantCountry = countryList.find(item => item.iso === customer.country);
  locationString += customer.city ? customer.city : '';
  if(customer.country && ['au', 'us'].indexOf(customer.country) > -1) {
    locationString += customer.state ? locationString.length > 0 ? `, ${customer.state.toUpperCase()}` : customer.state.toUpperCase() : '';
  } else {
    locationString += customer.state ? locationString.length > 0 ? `, ${customer.state.toUpperCase()}` : customer.state.toUpperCase() : '';
  }
  locationString += relevantCountry ? locationString.length > 0 ? `, ${relevantCountry.name}` : relevantCountry.name : '';
  return locationString;
}

// Returns a nicely formatted age string
export function formatCustomerAge(customer: Customer): string {
  if(!customer.age || customer.age < 0) return '';
  return `${customer.age} years old`
}
