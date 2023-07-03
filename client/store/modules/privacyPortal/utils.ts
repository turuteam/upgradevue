import { clone } from '@/utils/helpers';
import { ScratchPrivacyPortal } from './types';

export const generateScratchPrivacyPortal = (
  { emailAddress }: { emailAddress: string | null }
): ScratchPrivacyPortal => {
  return {
    companyName: null,
    subdomain: null,
    published: true,
    resources: [],
    meta: {
      requestsCompletedBy: {
        promoter: false,
        fan: true,
      },
      presentation: {
        color: '#7344c0',
      },
      privacyPolicy: null,
      notifications: {
        emailAddress,
        requestsCompletedBy: {
          promoter: true,
          fan: false,
        },
      },
      promoterCompletedRequestOptions: [
        { title: 'Get access to my personal data', enabled: true, type: 'export-data' },
        { title: 'Correct my personal data', enabled: true, type: 'update-data' },
        { title: 'Delete my personal data', enabled: true, type: 'delete-data' },
        { title: 'Opt out of marketing', enabled: true, type: 'update-subscription' },
      ],
    }
  };
};

export const prunePrivacyPortalValuesForServer = (scratchPrivacyPortal: ScratchPrivacyPortal) => {
  const prunedPrivacyPortal = clone(scratchPrivacyPortal);
  if (prunedPrivacyPortal.resources) {
    prunedPrivacyPortal.resourceOids = prunedPrivacyPortal.resources.map((resource: any) => resource.oid);
    delete prunedPrivacyPortal.resources;
  }
  return prunedPrivacyPortal;
};