import { MessageList } from '@/api/message-lists/types';
import { Customer } from '@/api/customer-profile/types';
import {
  generateRandomNumber,
  generateRandomCity,
  generateRandomCountry,
  generateRandomString,
} from '@/utils/testing';

import { SelectedAudienceMap, Audience } from './types';

export const transformAudienceToDummyAudience = (audience: Audience) => {
  return audience.map(fan => ({
    ...fan,
    totalEventCount: generateRandomNumber({minMajor: 1, maxMajor: 2 }),
    age: generateRandomNumber({minMajor: 2, maxMajor: 2 }),
    totalTicketSales: generateRandomNumber({minMajor: 1, maxMajor: 2 }),
    city: generateRandomCity(),
    postcode: generateRandomNumber({minMajor: 4, maxMajor: 5 }),
    state: generateRandomString(3).toUpperCase(),
    dob: `${generateRandomNumber({min: 1, max: 12 })}/${generateRandomNumber({min: 1, max: 12 })}/19${generateRandomNumber({minMajor: 2, maxMajor: 2 })}`,
    totalCampaignCount: generateRandomNumber({minMajor: 1, maxMajor: 2 }),
    country: generateRandomCountry(),
    totalTickets: generateRandomNumber({minMajor: 1, maxMajor: 2 }),
    totalReferrals: generateRandomNumber({minMajor: 1, maxMajor: 4 }),
  }));
};

export function pruneSourceAudience(sourceAudience: SourceFan[]): Audience {
  return sourceAudience.map((fan: SourceFan) => ({
    ...fan,
    name: formatFanName(fan),
  }));
}

export function formatFanName(fan: SourceFan | Customer | SimpleFan): string {
  if (fan.firstName && fan.lastName) {
    return `${fan.firstName} ${fan.lastName}`;
  } else if (fan.firstName) {
    return fan.firstName;
  } else if (fan.lastName) {
    return fan.lastName;
  } else if (fan.emailAddress) {
    return fan.emailAddress;
  } else {
    return '';
  }
}

export function getSelectedFans(audience: Audience, audienceMap: SelectedAudienceMap): Audience {
  return audience.filter(fan => audienceMap[fan.oid]);
}

export function generateAudienceOptInsStats(audience: Audience, messageList: MessageList) {
  return audience.reduce((accum, fan) => {
      accum.email.totalAvailable += 1;
      accum.sms.totalAvailable += fan.mobileNumber !== null ? 1 : 0;

      if (fan.additionalInfo) {
        if (fan.additionalInfo.subscriptions) {
          accum.email.optIns += fan.additionalInfo.subscriptions.email ? 1 : 0;
          accum.sms.optIns += fan.additionalInfo.subscriptions.sms ? 1 : 0;
        }
      }

      return accum;
    },
    {
      email: { optIns: 0, totalAvailable: 0 },
      sms: { optIns: 0, totalAvailable: 0 }
    }
  );
}
