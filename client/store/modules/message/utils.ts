import { AvailableMessageOptionsMap, CsvPreviewContact, RecipientFilter } from './types';
import moment from 'moment';
// @ts-ignore
import * as Papa from 'papaparse';
import { CURRENCY_CODES } from '~/utils/constants';
import { arDynamicTagsRegexGlobal } from '@/utils/regex/';
import { AdvancedMessageListTargeting } from '@/store/modules/messageList/types';
import { clone, convertToCamelCase } from '@/utils/helpers';

export const calculateScheduleMessageCountdown = (
  message: SimpleMessage | EmailMessage,
  applicationTime: number
): number => {
  // Has been sent, no need countdown
  if (message.started) {
    return 0;
  }
  const scheduledAtTime = moment
    .utc(message.scheduledAt)
    .toDate()
    .getTime();
  const countdownMilliSeconds = scheduledAtTime - applicationTime;
  const countdownSeconds = Math.floor(countdownMilliSeconds / 1000);

  return countdownSeconds > 0 ? countdownSeconds : 0;
};

export const generateScheduledMessageCountdownCopy = (countdown: number): string => {
  if (countdown === 0) {
    return 'This message has been sent';
  }

  let template;
  let remainingTime;
  if (countdown < 300) {
    template = 'This message will be sent in {{time}}';
    remainingTime = countdown;
  } else {
    template = '{{time}} until the message is not editable';
    remainingTime = countdown - 300;
  }

  const days = Math.floor(remainingTime / 86400);
  remainingTime = remainingTime % 86400;
  const hours = Math.floor(remainingTime / 3600);
  remainingTime = remainingTime % 3600;
  const minutes = Math.floor(remainingTime / 60);
  remainingTime = remainingTime % 60;
  const seconds = remainingTime;

  let timecopy = '';
  if (days > 0) {
    timecopy += ` ${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    timecopy += ` ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    timecopy += ` ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  if (seconds > 0) {
    timecopy += ` ${seconds} second${seconds > 1 ? 's' : ''}`;
  }

  return template.replace('{{time}}', timecopy);
};
export const generateScheduledMessageCountdownTime = (countdown: number): string => {
  if (countdown === 0) {
    return 'This message has been sent';
  }

  let remainingTime = countdown;

  const days = Math.floor(remainingTime / 86400);
  remainingTime = remainingTime % 86400;
  const hours = Math.floor(remainingTime / 3600);
  remainingTime = remainingTime % 3600;
  const minutes = Math.floor(remainingTime / 60);
  remainingTime = remainingTime % 60;
  const seconds = remainingTime;

  let timecopy = '';
  if (days > 0) {
    timecopy += ` ${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    timecopy += ` ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  if (minutes > 0) {
    timecopy += ` ${minutes} minute${minutes > 1 ? 's' : ''}`;
  }
  if (seconds > 0) {
    timecopy += ` ${seconds} second${seconds > 1 ? 's' : ''}`;
  }

  return timecopy;
};

export const getMessageUiStatus = function(message: SimpleMessage | EmailMessage): MessageStatus {
  return message.meta && message.meta.uiStatus ? message.meta.uiStatus : message.status;
};

export const getAvailableMessageOptionsMap = function(message: SimpleMessage | EmailMessage) {
  const availableMessageOptionsMap: AvailableMessageOptionsMap = {
    duplicate: false,
    view: false,
    edit: false,
    archive: false,
    cancel: false
  };

  const uiStatus = getMessageUiStatus(message);

  if (uiStatus === 'failed') {
    availableMessageOptionsMap.view = true;
    availableMessageOptionsMap.duplicate = true;
    availableMessageOptionsMap.archive = true;
  }

  if (uiStatus === 'draft') {
    availableMessageOptionsMap.duplicate = true;
    availableMessageOptionsMap.edit = true;
    availableMessageOptionsMap.archive = true;
  }

  if (uiStatus === 'archived') {
    availableMessageOptionsMap.view = true;
    availableMessageOptionsMap.duplicate = true;
  }

  if (uiStatus === 'in-progress') {
    availableMessageOptionsMap.view = true;
    availableMessageOptionsMap.duplicate = true;
  }

  if (uiStatus === 'completed') {
    availableMessageOptionsMap.view = true;
    availableMessageOptionsMap.duplicate = true;
    availableMessageOptionsMap.archive = true;
  }

  if (uiStatus === 'scheduled') {
    availableMessageOptionsMap.duplicate = true;
    availableMessageOptionsMap.archive = true;
    availableMessageOptionsMap.cancel = true;

    const countdown = calculateScheduleMessageCountdown(message, new Date().getTime());
    if (countdown > 300) {
      availableMessageOptionsMap.edit = true;
    }
  }

  if (uiStatus === 'cancelled') {
    availableMessageOptionsMap.view = true;
    availableMessageOptionsMap.duplicate = true;
    availableMessageOptionsMap.archive = true;
  }

  return availableMessageOptionsMap;
};

export const getInitialSmsPreview = function() {
  return {
    sender: '',
    body: '',
    totalRecipients: 0,
    cost: {
      currency: 'US',
      total: 0,
      recipients: 0,
      regionNotFound: 0
    },
    charactersLeft: 1550,
    optOutMessage: ''
  };
};

export const getInitialScratchSimpleMessage = function(): ScratchSimpleMessage {
  return {
    oid: null,
    customerName: null,
    provider: null,
    meta: {
      messageListOid: null,
      initiator: {
        campaignOid: null,
        eventOid: null
      },
      messageBody: '',
      dynamicTagHeaders: [],
      tagsResourceOid: null,
      tagMaxWidthMap: {},
      presentation: {
        timeZone: null
      },
      facebookMessenger: {
        pageId: null,
        pageName: null
      },
      recipientFilter: null
    },
    scheduledAt: null
  };
};

export const getInitialScratchEmailMessage = function(): ScratchEmailMessage {
  return {
    oid: null,
    abEmail: false,
    abEmailType: null,
    customerName: null,
    meta: {
      disableLinkTracking: false,
      email: {
        promoterPropertyOid: null
      },
      initiator: {
        campaignOid: null,
        eventOid: null
      },
      messageListOid: null,
      messageBody: {
        previewText: null,
        subject: null
      },
      dynamicTagHeaders: [],
      tagsResourceOid: null,
      presentation: {
        template: null,
        templateType: null,
        timeZone: null
      },
      abTest: null,
      recipientFilter: null,
      templateResourceOid: null
    },
    scheduledAt: null,
    provider: 'email',
    name: null
  };
};

export const getMessageCurrency = function(message: Message) {
  if (
    !message ||
    !message.statusDetails ||
    !message.statusDetails.costs ||
    (!message.statusDetails.costs.currencyCode && !message.statusDetails.costs.currency)
  )
    return null;

  let code = message.statusDetails.costs.currencyCode || message.statusDetails.costs.currency;
  if (code === 'US') code = 'USD';

  let currency = CURRENCY_CODES.find(currency => currency.code === code);
  if (!currency) return null;

  return currency;
};

const gsm7BitBasicCharacterSet = new Set<string>([
  '@',
  'Δ',
  ' ',
  '0',
  '¡',
  'P',
  '¿',
  'p',
  '£',
  '_',
  '!',
  '1',
  'A',
  'Q',
  'a',
  'q',
  '$',
  'Φ',
  '"',
  '2',
  'B',
  'R',
  'b',
  'r',
  '¥',
  'Γ',
  '#',
  '3',
  'C',
  'S',
  'c',
  's',
  'è',
  'Λ',
  '¤',
  '4',
  'D',
  'T',
  'd',
  't',
  'é',
  'Ω',
  '%',
  '5',
  'E',
  'U',
  'e',
  'u',
  'ù',
  'Π',
  '&',
  '6',
  'F',
  'V',
  'f',
  'v',
  'ì',
  'Ψ',
  "'",
  '7',
  'G',
  'W',
  'g',
  'w',
  'ò',
  'Σ',
  '(',
  '8',
  'H',
  'X',
  'h',
  'x',
  'Ç',
  'Θ',
  ')',
  '9',
  'I',
  'Y',
  'i',
  'y',
  '\n',
  'Ξ',
  '*',
  ':',
  'J',
  'Z',
  'j',
  'z',
  'Ø',
  '\u001b',
  ';',
  'K',
  'Ä',
  'k',
  'ä',
  'ø',
  'Æ',
  ',',
  '<',
  'L',
  'Ö',
  'l',
  'ö',
  '\r',
  '',
  'æ',
  '-',
  '=',
  'M',
  'Ñ',
  'm',
  'ñ',
  'Å',
  'ß',
  '.',
  '>',
  'N',
  'Ü',
  'n',
  'ü',
  'å',
  'É',
  '/',
  '?',
  'O',
  '§',
  'o',
  'à'
]);

const gsm7BitBasicCharacterSetExtension = new Set<string>(['\f', '^', '{', '}', '\\', '[', '~', ']', '|', '€']);

const gsm7BitAllowedCharacters = new Set<string>([...gsm7BitBasicCharacterSet, ...gsm7BitBasicCharacterSetExtension]);

const getCharset = function(messageBody: string) {
  for (var i = 0; i < messageBody.length; i++) {
    if (!gsm7BitAllowedCharacters.has(messageBody.charAt(i))) {
      return 'GSM_CHARSET_UNICODE';
    }
  }
  return 'GSM_CHARSET_7BIT';
};

const count7BitSegments = function(messageBody: string) {
  var message7BitLength = 0;
  for (var i = 0; i < messageBody.length; i++) {
    if (gsm7BitBasicCharacterSetExtension.has(messageBody.charAt(i))) {
      message7BitLength += 2;
    } else {
      message7BitLength += 1;
    }
  }

  return message7BitLength <= 160 ? 1 : Math.ceil(message7BitLength / 153);
};

export const countSmsPreviewSegments = function(tagMaxWidthMap: MessageTagMaxWidthMap, messageBody: string) {
  let dynamicTagsActionedMessage = messageBody;

  // Locally replace dynamic tags with a string with a length matching the longest item in the given column
  // Eg, if the longest first_name is 15 characters, replace {{first_name}} with 'xxxxxxxxxxxxxxx'
  if (tagMaxWidthMap) {
    Object.keys(tagMaxWidthMap).forEach(item => {
      const maxLength = tagMaxWidthMap[item] || 0;
      const dummyString = [...Array(maxLength)].map(_ => 'x').join('');
      const regexString = new RegExp('\\{\\{' + item + '\\}\\}', 'g');
      dynamicTagsActionedMessage = dynamicTagsActionedMessage.replace(regexString, dummyString);
    });
  }

  // Set number of segments to 0 if messagebody is empty
  if (dynamicTagsActionedMessage.length === 0) {
    return 0;
  }

  const charset: string = getCharset(dynamicTagsActionedMessage);
  if (charset === 'GSM_CHARSET_UNICODE') {
    return dynamicTagsActionedMessage.length <= 70 ? 1 : Math.ceil(dynamicTagsActionedMessage.length / 67);
  }

  return count7BitSegments(dynamicTagsActionedMessage);
};

// Calculate SMS message length, taking into account the max size of dynamic tags and the length of short URLs
export const countSmsBodyLength = function(tagMaxWidthMap: MessageTagMaxWidthMap, messageBody: string) {
  let dynamicTagsActionedMessage = messageBody;
  if (tagMaxWidthMap) {
    Object.keys(tagMaxWidthMap).forEach(item => {
      const maxLength = tagMaxWidthMap[item] || 0;
      const dummyString = [...Array(maxLength)].map(_ => 'x').join('');
      const regexString = new RegExp('\\{\\{' + item + '\\}\\}', 'g');
      dynamicTagsActionedMessage = dynamicTagsActionedMessage.replace(regexString, dummyString);
    });
  }
  return dynamicTagsActionedMessage.length;
};

const definedKeys = ['ar_unsubscribe_link'];

export const getDyanmicTagsFromContent = (content: string): string[] => {
  let dynamicTags = content.match(arDynamicTagsRegexGlobal) || [];
  dynamicTags = dynamicTags.map(tag => tag.replace('{{', '').replace('}}', ''));
  dynamicTags = dynamicTags.filter((tag, tagIdx) => {
    return dynamicTags.indexOf(tag) === tagIdx && !definedKeys.includes(tag);
  });
  return dynamicTags;
};

export const getNoneExistingDyanmicTags = (content: string, dynamicTags: string[]) => {
  const matchTags = content.match(arDynamicTagsRegexGlobal) || [];
  const prunedMatchTags = matchTags.map(tag => tag.replace('{{', '').replace('}}', ''));
  return prunedMatchTags.filter((tag, tagIdx) => {
    return (
      dynamicTags.indexOf(tag) === -1 &&
      prunedMatchTags.indexOf(tag) === tagIdx && // This will prevent duplicated tags
      tag !== 'ar_unsubscribe_link'
    ); // This will prevent ar_unsubscribe_link for being miscategorised as a dynamic tag
  });
};

export const generateNonExistingDynamicTagsErrorMessage = (nonExistingDynamiTags: string[], contentAlias: string) => {
  if (nonExistingDynamiTags.length === 0) {
    return null;
  }
  const nonExistingDynamiTagsFiltered = nonExistingDynamiTags.filter(tag => {
    return !definedKeys.includes(tag);
  });

  if (nonExistingDynamiTagsFiltered.length === 0) {
    return null;
  }

  let tagListCopy = nonExistingDynamiTagsFiltered.map(tag => `<strong>"${tag}"</strong>`).join(', ');
  let copy;
  if (nonExistingDynamiTags.length === 1) {
    copy = `This dynamic tag in the ${contentAlias} does not exist in the dynamic tags file: `;
  } else {
    copy = `These dynamic tags in the ${contentAlias} do not exist in the dynamic tags file: `;
  }
  return copy + tagListCopy;
};

export const generatePreviewCountacts = (headers: string[], rows: string[]): CsvPreviewContact[] => {
  const contacts: CsvPreviewContact[] = [];
  for (let i = 0; i < 25; i += 1) {
    const contactRow = rows[i];
    if (!contactRow) continue;
    if (contactRow.length === 1 && !contactRow[0]) continue;
    const contact: CsvPreviewContact = {};
    for (let j = 0; j < headers.length; j += 1) {
      contact[headers[j]] = contactRow[j];
    }
    contacts.push(contact);
  }
  return contacts;
};

// Converts a recipient filter stored within a message task into a set of targeting rules to be used in the UI
// Expects that the filter will only have one condition. This function will need to be edited if we decide to support
// multiple conditions down the line.
export const recipientFilterToTargetingRules = (
  recipientFilter: RecipientFilter | null
): AdvancedMessageListTargeting => {
  let targeting: AdvancedMessageListTargeting = {
    type: 'all',
    condition: 'include',
    subCondition: null,
    values: []
  };
  if (!recipientFilter) return targeting;

  const conditions = recipientFilter.conditions.filter(condition => {
    return !condition.provider || (!!condition.provider && condition.provider === 'advanced-targeting');
  });

  if (conditions.length === 0) return targeting;

  if (conditions[0].name === 'tags') {
    targeting.type = 'tag';
  } else if (conditions[0].name === 'events') {
    targeting.type = 'events';
  } else if (conditions[0].name === 'campaigns') {
    targeting.type = 'campaigns';
  } else {
    // @ts-ignore
    if (conditions[0].name === 'messages_opened') {
      targeting.type = 'messages_opened';
    } else {
      // @ts-ignore
      if (conditions[0].name === 'messages_clicked') {
        targeting.type = 'messages_clicked';
      }
    }
  }

  if (conditions[0].data.condition === 'false_to_all' || conditions[0].data.condition === 'false_to_any') {
    targeting.condition = 'exclude';
  }

  if (targeting.type === 'tag') {
    targeting.subCondition = conditions[0].data.condition;
  }

  targeting.values = clone(conditions[0].data.values);
  return targeting;
};

// Converts a recipient filter stored within a message task into a set of targeting rules to be used in the UI
// Expects that the filter will only have one condition. This function will need to be edited if we decide to support
// multiple conditions down the line.
export const recipientFilterToSidebar = (recipientFilter: any | null): any => {
  let targeting: any = {
    conditions: [],
    logic: []
  };

  let defaultValue: any = [];
  let recipientClone: any = clone(recipientFilter);

  if (!!recipientClone && !!recipientClone.conditions) {
    let recipientConditions = recipientClone.conditions.filter((condition: any) => {
      if (!!condition.provider && condition.provider === 'advanced-filtering') {
        return true;
      }
    });

    targeting.conditions = recipientConditions;
    targeting.logic = recipientConditions.reduce((logic: any, filterItem: any, index: number) => {
      if (index < recipientConditions.length - 1) {
        const strippedLogic = recipientFilter.logic.filter((item: string) => item !== '(' && item !== ')');
        const firstLogic = strippedLogic.length > 0 ? strippedLogic[0] : null;
        if (firstLogic) logic.push(firstLogic);
      }
      return logic;
    }, defaultValue);
  }

  return targeting;
};

export const recursivelyPurifyUnlayerDesign = function(parentKey: string | number | null, obj: any): void {
  if (parentKey === 'values') {
    if (obj.hasOwnProperty('meta')) {
      console.log('Found incorrect "meta" field in Unlayer design, update it to "_meta"');
      obj._meta = obj.meta;
      delete obj.meta;
    }
    if (obj.hasOwnProperty('override')) {
      console.log('Found incorrect "override" field in Unlayer design, update it to "_override"');
      obj._override = obj.override;
      delete obj.override;
    }
  }
  if (typeof obj === 'object') {
    for (let prop in obj) {
      recursivelyPurifyUnlayerDesign(prop, obj[prop]);
    }
  }
};

export const keepKeysInObject = function(object: any, keys: string[]) {
  const newObj: any = {};
  keys.forEach(key => {
    newObj[key] = object[key] || '';
  });
  return newObj;
};

export const hasEmptyKeysInObject = function(object: any) {
  let hasEmptyKeys = false;
  Object.keys(object).map(function(key) {
    if (!object[key]) {
      hasEmptyKeys = true;
    }
  });
  return hasEmptyKeys;
};
