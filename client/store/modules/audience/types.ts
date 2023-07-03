import { PromoterIntegrationTask } from '@/api/promoter-integration-task/types';

/**
 * Pruned verion of Fan
 * @field name The combination of firstName and lastName
 */
export interface PrunedFan extends SourceFan {
  name: string;
};

export type Audience = PrunedFan[];

export type SelectedAudienceMap = {
  [key: number]: boolean | undefined;
};

/**
 * For Mass Fan Selection
 * @field useScratchSegment Use filter to select a massive amount of fans?
 * @field partlySelectedAudienceMap Fnas you're selecting
 */
export type AudienceSelection = {
  useScratchSegment: boolean;
  partlySelectedAudienceMap: SelectedAudienceMap;
};

/**
 * Optin Stats of audience
 * Stats of all opted or not opted channels of an audience
 */
export type AudienceOptInStats = {
  email: { optIns: number, totalAvailable: number },
  sms: { optIns: number, totalAvailable: number },
}

/**
 * State of Fan Module
 * @field audience audience
 * @field totalAudienceCount Total number of fans
 * @field isNoMoreAudience Used for pagination, it tells you if there is no more fans or not
 * @field isFetchingAudience Let you know if Vuex is still fetching fans from server
 * @field isFetchingAudienceCount We fetch the audience data & count separately due to performance issue, so we need this state
 * @field audienceSelection Used for Mass Fan operation
 * @field promoterAudienceCount Total audience count of the promoter without filter
 * @field isFetchingPromoterAudienceCount Is fetching promoter audience count
 * @field fanKeyword Keyword that will be combined into 'scratchAudienceFilter'
 */
export type AudienceState = {
  audience: Audience,
  totalAudienceCount: number;
  isNoMoreAudience: boolean;
  isFetchingAudience: boolean;
  isFetchingAudienceCount: boolean;
  hasFetchAudienceFailed: boolean;
  // For Fan Selection
  audienceSelection: AudienceSelection;
  // For Total Promoter's Audience Count
  promoterAudienceCount: number | null; // If it's null, that means we haven't had fetched it.
  isFetchingPromoterAudienceCount: boolean;
  // Optin Stats
  audienceOptInsStats: AudienceOptInStats;
  isFetchingAudienceOptInsStats: boolean;
  // Audience CSV
  isExportingAudienceCsv: boolean;
  isImportingAudienceCsv: boolean;
};
