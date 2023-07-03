import Vue from 'vue';
import axios from 'axios';
import VeeValidate, { Validator } from 'vee-validate';
import moment from 'moment';
import { parsePhoneNumber, ParseError } from 'libphonenumber-js'

import {
  emailRegex,
  urlRegex,
  googleTagManagerIdRegex,
  googleAnalyticsIdRegex,
  facebookPixelIdRegex,
  cssLengthRegex,
  facebookUrlRegex,
  facebookEventUrlRegex,
  instagramUsernameRegex,
  twitterUsernameRegex,
  snapchatAccountRegex,
  youtubeChannelUrlRegex,
  youtubeUrlRegex,
  zoomUrlRegex,
  spotifyTrackUrlRegex,
  spotifyArtistUrlRegex,
  spotifyPlaylistUrlRegex,
  spotifyAlbumUrlRegex,
  vimeoUrlRegex,
  linkedinRegex,
  tiktokRegex,
  twitchRegex,
  spotifyPodcastUrlRegex,
  spotifyPodcasterUrlRegex,
} from '@/utils/regex/';

Validator.extend('googleTagManagerId', {
  getMessage: () => 'Google Tag Manager id is invalid',
  validate: (value) => {
    return googleTagManagerIdRegex.test(value);
  },
});

Validator.extend('googleAnalyticsId', {
  getMessage: () => 'Google Analytics id is invalid',
  validate: (value) => {
    return googleAnalyticsIdRegex.test(value);
  },
});

Validator.extend('facebookPixelId', {
  getMessage: () => 'Facebook Pixel id is invalid',
  validate: (value) => {
    return facebookPixelIdRegex.test(value);
  },
});

Validator.extend('mobileNumber', {
  getMessage: () => `Please enter a valid mobile number`,
  validate: (value) => {
    try {
      const phoneNumber = parsePhoneNumber(value);
      // We don't want the library change the number and say it's valid
      // e.g: Change "+6101234567" to "+611234567" and say it's valid lol.
      return phoneNumber.isValid() && phoneNumber.number === value;
    } catch (error) {
      // If you need more sophiscated error handling, follow this pattern
      // if (error instanceof ParseError) {
      //   return false;
      // }
      return false;
    }
  },
});

Validator.extend('date-of-birth', {
  getMessage: () => `Please complete date of birth`,
  validate: (value) => {
    const [year, month, day] = value.split('-');
    if (!year || !month || !day) {
      return false;
    } else {
      return true;
    }
  }
});

Validator.extend('futureTime', {
  getMessage: (field) => `The ${field} must be in the future`,
  validate: (value) => {
    return moment(value).isAfter(new Date());
  },
});

Validator.extend('notBeforeTime', {
  getMessage: (field, [_, compareTimeName]) => `The ${field} cannot be before the ${compareTimeName}`,
  validate: (value, { compareTime }) => {
    return moment(value).isAfter(new moment(compareTime));
  },
}, { paramNames: ['compareTime', 'compareTimeName'] });


Validator.extend('tzFormat', {
  getMessage: (field) => `Please complete ${field}`,
  validate: (value) => {
    return moment.utc(value)._isValid;
  },
});

Validator.extend('emailAddresses', {
  getMessage: () => 'Please make sure every email address is valid',
  validate: (value) => {
    const emails = value.replace(/\s/g, '').split(',');
    for (let email of emails) {
      if (!emailRegex.test(email)) {
        return false;
      }
    }
    return true;
  }
});

Validator.extend('url', {
  getMessage: () => 'URL is not valid',
  validate: (value) => {
    return urlRegex.test(value);
  }
});

Validator.extend('maxTestEmailRecipients', {
  getMessage: (fieldName, [max]) => {
    return `You cannot send test emails to more than ${max} recipients`;
  },
  validate: (value, { max }) => {
    return value.split(',').length > max ? false : true;
  }
}, { paramNames: ['max'] });

Validator.extend('arPrivacyPortalSubdomain', {
  getMessage: () => `This subdomain is already in use, please edit to specify a different subdomain`,
  validate: async (value, { currentSubdomain }) => {
    if (value === currentSubdomain) {
      return true;
    }
    try {
      const { status } = await axios.get(`https://${value}.${process.env.arPrivacyPortalDomain}`);
      if (status === 200) {
        return false;
      }
      return true;
    } catch (error) {
      return true;
    }
  },
}, { paramNames: ['currentSubdomain'] });

Validator.extend('arCampaignSlug', {
  getMessage: () => `This URL is already in use, please edit to specify a different URL`,
  validate: async (value, { currentSlug, prefix }) => {
    try {
      if (value === currentSlug) {
        return true;
      }
      const { status } = await axios.get(`${process.env.arCampaignApiDomain}${process.env.arCampaignApiBaseUriPrefix}/campaign-uri?$filter=uri=${prefix}${value}`);
      if (status === 200) {
        return false;
      }
      return true;
    } catch (e) {
      console.error(e);
      return true;
    }
  },
}, { paramNames: ['currentSlug', 'prefix'] });

Validator.extend('arPasswordLength', {
  getMessage: () => `Password must be at least 8 characters`,
  validate: (value) => {
    if (!value) {
      return false;
    }
    return value.length >= 8;
  },
});

Validator.extend('uploadingAssets', {
  getMessage: () => 'Image is still being uploaded',
  validate: (value) => {
    return !value;
  },
});

Validator.extend('matchPassword', {
  getMessage: () => `Your passwords do not match, please try again`,
  validate: (value, args) => {
    return value === args[0];
  },
});

Validator.extend('cssWidth', {
  getMessage: () => `This is not valid css length`,
  validate: (value) => {
    return cssLengthRegex.test(value);
  },
});


Validator.extend('facebookUrl', {
  getMessage: () => "Facebook url is not valid",
  validate: (value) => {
    return facebookUrlRegex.test(value);
  },
});

Validator.extend('facebookEventUrl', {
  getMessage: () => "Facebook Event url is not valid",
  validate: (value) => {
    return facebookEventUrlRegex.test(value);
  },
});

Validator.extend('instagramUsername', {
  getMessage: () => "Instagram username is not valid",
  validate: (value) => {
    return instagramUsernameRegex.test(value);
  },
});

Validator.extend('twitterUsername', {
  getMessage: () => "Twitter username is not valid",
  validate: (value) => {
    return twitterUsernameRegex.test(value);
  },
});

Validator.extend('snapchatAccount', {
  getMessage: () => "Snapchat account is not valid",
  validate: (value) => {
    return snapchatAccountRegex.test(value);
  },
});

Validator.extend('youtubeChannelUrl', {
  getMessage: () => "Youtube url is not valid",
  validate: (value) => {
    return youtubeChannelUrlRegex.test(value);
  },
});

Validator.extend('youtubeUrl', {
  getMessage: () => "Youtube url is not valid",
  validate: (value) => {
    return youtubeUrlRegex.test(value);
  },
});

Validator.extend('zoomUrl', {
  getMessage: () => "Zoom url is not valid",
  validate: (value) => {
    return zoomUrlRegex.test(value);
  },
});

Validator.extend('spotifyTrackUrl', {
  getMessage: () => "Spotify Track url is not valid",
  validate: (value) => {
    return spotifyTrackUrlRegex.test(value);
  },
});

Validator.extend('spotifyArtistUrl', {
  getMessage: () => "Spotify Artist url is not valid",
  validate: (value) => {
    return spotifyArtistUrlRegex.test(value);
  },
});

Validator.extend('spotifyPlaylistUrl', {
  getMessage: () => "Spotify Playlist url is not valid",
  validate: (value) => {
    return spotifyPlaylistUrlRegex.test(value);
  },
});

Validator.extend('spotifyAlbumUrl', {
  getMessage: () => "Spotify Album url is not valid",
  validate: (value) => {
    return spotifyAlbumUrlRegex.test(value);
  },
});

Validator.extend('spotifyPodcastUrl', {
  getMessage: () => "Spotify Podcast url (Episode) is not valid",
  validate: (value) => {
    return spotifyPodcastUrlRegex.test(value);
  },
});

Validator.extend('spotifyPodcasterUrl', {
  getMessage: () => "Spotify Podcaster url (Show) is not valid",
  validate: (value) => {
    return spotifyPodcasterUrlRegex.test(value);
  },
});

Validator.extend('vimeoUrl', {
  getMessage: () => "Vimeo url is not valid",
  validate: (value) => {
    return vimeoUrlRegex.test(value);
  },
});

Validator.extend('linkedinURL', {
  getMessage: () => "Linkedin URL is not valid",
  validate: (value) => {
    return linkedinRegex.test(value);
  },
});

Validator.extend('tiktokUsername', {
  getMessage: () => "TikTok Username is not valid",
  validate: (value) => {
    return tiktokRegex.test(value);
  },
});

Validator.extend('twitchUrl', {
  getMessage: () => "Twitch URL is not valid",
  validate: (value) => {
    return twitchRegex.test(value);
  },
});

Vue.use(VeeValidate, {
  events: 'change',
  errorBagName: 'veeErrors',
});
