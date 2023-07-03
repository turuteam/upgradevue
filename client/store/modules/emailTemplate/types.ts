// Should be the same structure for Beefree as well so I'm thinking we just keep it
export type UnlayerTemplate = {
  createdAt: Date;
  design: object;
  displayMode: 'email';
  folder: {
    createdAt: Date;
    id: number;
    name: string;
    updatedAt: Date;
  } | null;
  id: number;
  name: string;
  updatedAt: Date;
}

export type BeefreeTemplate = {
  createdAt: Date;
  design: object;
  displayMode: 'email';
  folder: {
    createdAt: Date;
    id: number;
    name: string;
    updatedAt: Date;
  } | null;
  oid: number;
  name: string;
  updatedAt: Date;
  thumbnailUrl: string;
  url: string; // HTML
}

export type EmailTemplate = {
  taskOid: number | null;
  assetType: 'promoter-saved-email-template';
  sysCtime: Date;
  meta: {
    name: string;
    description: string;
    template: object | string;
    templateType: 'unlayer' | 'rich-text' | 'custom' | 'beefree' | null;
    version: number | null;
    thumbnailFilename: string | null;
    thumbnailUrl: string | null;
    url: string | null;
  };
  sysActivep: boolean;
  privacyPortalOid: number | null;
  campaignOid: number | null;
  eventOid: number | null;
  fanOid: number | null;
  filename: string;
  oid: number;
  url: string;
  contentType: string;
  uploadParams: {
    xAmzAlgorithm: string;
    successActionStatus: string;
    key: string;
    policy: string;
    finalUrl: string;
    filename: string;
    xAmzDate: string;
    xAmzSignature: string;
    contentType: string;
    acl: string;
    action: string;
    uploadUrl: string;
    xAmzCredential: string;
  };
  tourOid: number | null;
  automationOid: number | null;
  promoterOid: number;
};

export type ScratchEmailTemplate = {
  oid: number | null;
  meta: {
    name: string,
    description: string,
    template: object | string | null;
    templateType: 'unlayer' | 'rich-text' | 'custom' | 'beefree' | null;
    version?: number | null;
  };
};

export type ScratchEmailTemplateChanges = {
  meta: {
    name?: string,
    description?: string,
    template?: object | string | null;
    templateType?: 'unlayer' | 'rich-text' | 'custom' | 'beefree' | null;
    version?: number | null;
  };
};

/**
 * Because it's expensive to call Unlayer API to export html from their design json data,
 * so we will create hash from design as a key and html as the value.
 */ 
export type UnlayerHtmlCacheMap = {
  [key: string]: string;
};

export type EmailTemplateState = {
  // Default dynamic tags
  defaultDynamicTags: ['email_address'],
  // Cache Unlayer HTML
  unlayerHtmlCacheMap: UnlayerHtmlCacheMap,
  // Unlayer template library
  unlayerTemplates: UnlayerTemplate[],
  selectedUnlayerTemplate: UnlayerTemplate | null,
  isFetchingUnlayerTemplates: boolean;
  // Cache Beefree HTML
  beefreeHtmlCacheMap: UnlayerHtmlCacheMap,
  // Beefree template library
  beefreeTemplates: BeefreeTemplate[],
  selectedBeefreeTemplate: BeefreeTemplate | null,
  isFetchingBeefreeTemplates: boolean;
  totalBeefreeTemplatesCount: number | null,
  hasNoMoreBeefreeTemplates: boolean,
  // Email Templates
  emailTemplates: EmailTemplate[],
  currentTemplatesCount: number | null,
  totalEmailTemplatesCount: number | null,
  isFetchingEmailTemplates: boolean,
  hasNoMoreEmailTemplates: boolean,
  hasFetchEmailTemplatesFailed: boolean,
  // Create Email Template
  isCreatingEmailTemplate: boolean;
  // Selected Email Template
  isFetchingSelectedEmailTemplate: boolean;
  isUpdatingSelectedEmailTemplate: boolean;
  selectedEmailTemplate: EmailTemplate | null;
  // Scratch Email Template
  scratchEmailTemplate: ScratchEmailTemplate;
  scratchEmailTemplateUnsaved: boolean;
};
