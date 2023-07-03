import { Campaign, CampaignRegistrationStats } from '@/types/resources/campaign';
import { PromoterIntegrationTask } from '~/api/promoter-integration-task/types';

export type ScratchCampaign = {};

export type CampaignState = {
  // Campaigns
  campaigns: Campaign[],
  totalCampaignsCount: number,
  hasNoMoreCampaigns: boolean,
  isFetchingCampaigns: boolean,

  // Current Campaign
  currentCampaign: Campaign | null,
  isFetchingCampaign: boolean,
  currentCampaignRegistrationStats: CampaignRegistrationStats | null,
  isFetchingCampaignRegistrationStats: boolean;

  // Scratch Campaign
  scratchCampaign: ScratchCampaign,
  isUpdatingCampaign: boolean,
  isCreatingCampaign: boolean,
};
