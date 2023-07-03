import { Campaign } from '@/types/resources/campaign';

/**
 * Tour Module State
 * @field promoterToursCount The count of promoter's all tours
 */
export type TourState = {
  promoterToursCount: number;
  isFetchingPromoterToursCount: boolean;

  // Tour Campaigns
  isFetchingTourCampaigns: boolean;
  tourCampaigns: Campaign[];
};
