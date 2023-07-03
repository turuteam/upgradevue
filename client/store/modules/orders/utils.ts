import {
  generateRandomNumber,
  generateRandomCity,
  generateRandomCountry,
  generateRandomString,
} from '@/utils/testing';
import { Customer } from '@/api/customer-profile/types';

import { Orders } from './types';

export const transformOrdersToDummyOrders = (orders: Orders) => {
  return orders.map(fan => ({
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

export function pruneSourceOrders(sourceOrders: SourceOrder[]): Orders {
  return sourceOrders.map((order: SourceOrder) => ({
    ...order,
    name: formatFanName(order),
  }));
}

export function formatFanName(order: SourceOrder | Customer): string {
  if (order.firstName && order.lastName) {
    return `${order.firstName} ${order.lastName}`;
  } else if (order.firstName) {
    return order.firstName;
  } else if (order.lastName) {
    return order.lastName;
  } else {
    return '';
  }
}