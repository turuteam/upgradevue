import {
  GenericCampaign,
} from './genericCampaign';

export interface Campaign extends GenericCampaign {

}

export interface CampaignRegistrationStats {
  "sysMtime": string,
  "uniqueViews": number,
  "percentageNewCustomers": number,
  "viralUplift": number,
  "registrationFunnel": number,
  "promoterOid": number,
  "directRegistrations": number,
  "sysCtime": string,
  "oid": number,
  "connect": {
    "targets": any[],
    "total": number,
    "type": string
  },
  "campaignOid": number,
  "newCustomers": number,
  "allRegistrations": number,
  "viralRegistrations": number,
  "share": {
    "targets": any[],
    "total": number,
    "type": string
  }
}
