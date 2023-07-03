import { parseJwt } from '@/utils/helpers';

export function generateCountdown(targetTime: number, applicationTime: number): number {
  const diffInSeconds = Math.floor((targetTime - applicationTime) / 1000);
  return diffInSeconds > 0 ? diffInSeconds : 0;
};

export function checkFeatureEnabled(featureKeys: string[], promoterAccountFeatures: PromoterAccountFeatures) {
  let feature = promoterAccountFeatures[featureKeys[0]];

  // If feature not found, or its disabled, exit early
  if (!feature || !feature.enabled) {
    return false;
  }

  if (featureKeys.length === 1) {
    return feature.enabled;
  }

  // If length of featureKeys is not 1, keep going
  let i = 1;
  let childFeature;
  while (i < featureKeys.length) {
    childFeature = feature.components[featureKeys[i]];
    // If feature not found or its disabled, exit early
    if (!childFeature || !childFeature.enabled) {
      return false;
    }
    i += 1;
  }

  return true;
}

export function checkIsAdminAccount(xAuthToken: string) {
  const jwt = parseJwt(xAuthToken);
  const clientIdentity = JSON.parse(jwt['client-identity']);
  return clientIdentity.accountType === 'ADMIN';
}
