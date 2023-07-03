

export function tourUri(tourSlug) {
  return `${process.env.arCampaignClientDomain + '/t/' + tourSlug}`;
};