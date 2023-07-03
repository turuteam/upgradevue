import { clone } from '@/utils/helpers/';
import crypto from 'crypto';
import { EmailTemplate, ScratchEmailTemplate, UnlayerHtmlCacheMap } from './types';

export const getUnlayerHtml = (caacheMap: UnlayerHtmlCacheMap, design: object): string | null => {
  const hash = crypto.createHash('md5').update(JSON.stringify(design)).digest('base64');
  return caacheMap[hash] || null;
};

export const initScratchEmailTemplate = (): ScratchEmailTemplate => {
  return {
    oid: null,
    meta: {
      name: '',
      description: '',
      template: null,
      templateType: null,
    },
  };
};

export const generateScratchEmailTemplate = (emailTemplate: EmailTemplate): ScratchEmailTemplate => {
  return {
    oid: emailTemplate.oid,
    meta: {
      name: emailTemplate.meta.name,
      description: emailTemplate.meta.description,
      template: clone(emailTemplate.meta.template),
      templateType: emailTemplate.meta.templateType,
      version: emailTemplate.meta.version,
    },
  };
};
