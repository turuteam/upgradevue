import { Integration } from '@/api/integrations/types';
import { PromoterIntegration } from '@/api/promoter-integrations/types';

// returns all promoter integrations that match the provider and app
export function findPromoterIntegrations(promoterIntegrations: PromoterIntegration[], provider: string, app: string) {
  return promoterIntegrations.filter((integration: PromoterIntegration) => {
    return integration.provider === provider && integration.app === app;
  });
}

// ported existing check for whitelisted promoter for integrations
export function isPromoterWhitelisted(promoter: PromoterAccount): boolean {
    if (promoter.oid === 104) return true; // Audience Republic promoter in production
    if (promoter.emailAddress.endsWith('@arep.co')) return true;
    if (promoter.emailAddress.endsWith('@audiencerepublic.com')) return true;
    if (promoter.emailAddress === 'zoom.test@mailinator.com') return true;
    return false;
}

// common check for integration enabled that takes into account promoter whitelist
export function isIntegrationEnabled(integration: Integration, promoter: PromoterAccount): boolean {
  return integration.enabled || isPromoterWhitelisted(promoter);
}

// calculate an integration key
export function integrationKey(integration: Integration): string {
  return (integration.provider === integration.app) ? integration.provider : `${integration.provider}-${integration.app}`;
}
