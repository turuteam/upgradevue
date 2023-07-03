import { sanitizeHtmlChild } from '@/utils/html-element/';

export const generateFeatureLockerTitle = (featureName) => {
  return `Contact sales for access to ${featureName}`;
};

export const generateFeatureLockerMessage = (featureName) => {
  return `You don't have access to ${sanitizeHtmlChild(featureName)} yet.<br>For access please <a target='__blank' href='https://audiencerepublic.com/contact-us?type=organizer'>contact sales</a>`;
};
