
import moment from 'moment';
import { capitalizeFirstLetter } from '@/utils/helpers';

export function campaignTypeToUriPrefix(campaignType) {
  switch (campaignType) {
    case 'competition':
      return '/c';
    case 'giveaway':
      return '/g';
    case 'presale':
      return '/p';
    case 'ballot':
      return '/b';
    case 'waitlist':
      return '/w';
    case 'livestream':
      return '/l';
    case 'free':
      return '/f';
    case 'wait':
      return '/w';
    case 'preorder':
      return '/o';
    case 'donate':
      return '/d';
    case 'earlybird':
      return '/e';
    case 'invite':
      return '/i';
    case 'opt-in':
      return '/m';
    case 'rsvp':
      return '/r';
    default:
      return '';
    // throw new Error(`No matching campaignType for ${campaignType}`);
  }
}

// Returns payment settings for campaigns
// Optional allows promoters to pick whether or not to accept payment
// Required forces promoters to pick a payment amount
// False disables payment
export function campaignTypePaymentRequired(campaignType) {
  switch(campaignType) {
    case "livestream":
      return "optional";
    case "preorder":
    case "donate":
      return "required";
    default:
      return false;
  }
}

export function campaignTypeSupportsGating(campaignType) {
  if (campaignType === 'livestream') {
    return true;
  }
  return false;
}

// Returns what sort of payment types a campaign is allowed to have
// Static - Promoter sets the price of a single item
// Variable - Fan sets the price of a single item
// Cart - Promoter sets the price and max quantity of a set of potential items
export function campaignTypePaymentType(campaignType) {
  switch(campaignType) {
    case "donate":
      return ['variable'];
      break;
    case "livestream":
      return ['fixed'];
      break;
    case "preorder":
      return ['cart'];
      break;
    default:
      return [];
  }
}

export const formatProviderName = (name) => {
  switch (name) {
    case 'facebook event':
      return 'Facebook Event';
    case 'messenger':
      return 'Messenger';
    case 'email':
      return 'E-mail';
    case 'sms':
      return 'SMS';
    case 'copy':
      return 'Copy & Paste URL';
    case 'whatsapp':
      return 'WhatsApp';
    case 'youtube':
      return 'YouTube';
    default:
      return capitalizeFirstLetter(name || '');
  }
}

export const targetToComponentMap = (targets) => {

  // This is more complicated than it needs to be due to a design limitation made back in the
  // distant past when the software was first being created.
  //
  const [channel, type, app, object] = targets.split(":");
  switch (channel) {
    case "facebook": {
      if (app === 'messenger') {
        return {
          channel: channel,
          type: type,
          app: app,
          object: object
        }
      }
    }
  }

  return { channel, type, app:channel, object }
}

export const followsToAppMap = (follows) => {

  // Follows in campaign stats are returned from the server as a list of entries, making it
  // somewhat painful to access via app type.
  //
  // This function converts the follows section to a map we can access via app type with the
  // corresponding value being the number of followers.
  if (!follows)
    return null

  return follows.reduce((accum, follow) => {
    const m = targetToComponentMap(follow.target)
    accum[m.app] = follow.total
    return accum
  }, {})
}

export const copyGenerator = (page, campaignType) => {
  let defaultCallToActionCopy;
  let partOfDetailsDescription;
  let partOfDetailsImage;
  let onSaleLabel;
  let onSaleDescription;
  let partOfRegistrations;
  let partOfRewardsDescription;
  let partOfShare;
  switch (campaignType) {
    case 'competition':
      defaultCallToActionCopy = 'Enter the Competition';
      partOfDetailsDescription = 'enter the competition';
      partOfDetailsImage = 'competition entry';
      onSaleLabel = `${capitalizeFirstLetter(campaignType)} Winners notified`
      partOfRegistrations = 'competition entry';
      partOfRewardsDescription = 'presale tickets';
      partOfShare = 'competition entry';
      break;
    case 'waitlist':
      defaultCallToActionCopy = 'Register for the Waitlist';
      partOfDetailsDescription = 'register for the waitlist';
      partOfDetailsImage = 'waitlist registration';
      onSaleLabel = `${capitalizeFirstLetter(campaignType)} tickets on-sale`
      onSaleDescription = 'Let people know when tickets will be on-sale.';
      partOfRegistrations = 'the waitlist';
      partOfRewardsDescription = 'tickets';
      partOfShare = 'waitlist registration';
      break;
    case 'presale':
      defaultCallToActionCopy = 'Register For Presale Access';
      partOfDetailsDescription = 'register for presale access';
      partOfDetailsImage = 'presale registration';
      onSaleLabel = `${capitalizeFirstLetter(campaignType)} tickets on-sale`
      onSaleDescription = 'Let people know when presale tickets will be on-sale.';
      partOfRegistrations = 'presale registration';
      partOfRewardsDescription = 'presale tickets';
      partOfShare = 'presale registration';
      break;
    case 'ballot':
      defaultCallToActionCopy = 'Enter the Ballot';
      partOfDetailsDescription = 'register for presale access';
      partOfDetailsImage = 'presale registration';
      onSaleLabel = `${capitalizeFirstLetter(campaignType)} tickets on-sale`
      partOfRegistrations = 'presale registration';
      partOfRewardsDescription = 'presale tickets';
      partOfShare = 'presale registration';
      break;
    case 'livestream':
      defaultCallToActionCopy = 'Register for the Live Stream';
      partOfDetailsDescription = 'register for live stream access';
      partOfDetailsImage = 'live stream registration';
      onSaleLabel = `${capitalizeFirstLetter(campaignType)} tickets on-sale`
      partOfRegistrations = 'live stream registration';
      partOfRewardsDescription = 'live stream tickets';
      partOfShare = 'live stream registration';
      break;
    case 'preorder':
      defaultCallToActionCopy = 'Register to Pre-Order';
      partOfDetailsDescription = 'register to pre-order';
      partOfDetailsImage = 'pre-order registration';
      onSaleLabel = `${capitalizeFirstLetter(campaignType)} on-sale`
      onSaleDescription = 'Let people know when pre-order items will be on-sale.';
      partOfRegistrations = 'pre-order registration';
      partOfRewardsDescription = 'pre-order items';
      partOfShare = 'pre-order registration';
      break;
    case 'donate':
      defaultCallToActionCopy = 'Register to Donate';
      partOfDetailsDescription = 'register to donate';
      partOfDetailsImage = 'donation registration';
      onSaleLabel = `Donations open`
      onSaleDescription = 'Let people know when donations will open';
      partOfRegistrations = 'donate';
      partOfRewardsDescription = 'donations';
      partOfShare = 'donation registration';
      break;
    case 'opt-in':
      defaultCallToActionCopy = 'Subscribe';
    default:
  }
  const copy = {
    general: {
      defaultCallToActionCopy,
    },
    details: {
      description: `Tell people why they should ${partOfDetailsDescription}.`,
      image: `Choose an image to be featured on the ${partOfDetailsImage} page and in the news feed when shared on social media. Recommended dimensions are 1200x628.`,
      onSaleLabel,
      onSaleDescription,
    },
    registrations: `Fans register for ${partOfRegistrations} by entering their details. Confirm the registration information required below (or click next for default options).`,
    rewards: {
      description: `Incentivize your audience with points to share, invite their friends, connect and follow. Choose the rewards for earning points which can include cheaper ${partOfRewardsDescription}, free tickets and/or a prize.`,
    },
    share: `Fans earn points for sharing the ${partOfShare} link on social media. You can preview and customize how the campaign appears in the news feed below.`,
    invite: `Fans earn points for each friend that accepts their invite to ${campaignType === 'competition' ? 'enter the competition' : 'register'}. Choose how your audience can invite their friends (or click next for default options).`,
  };

  return copy[page];
};

export const findFirstError = () => {
  // Find the first error that is visible and scroll to that.
  // Use .offsetHeight to determine if the element is visible
  const errorsCollection = document.getElementsByClassName('error');

  const firstError = errorsCollection.item(1); // first

  return firstError;
};

export function campaignImage(campaign) {

  // XXX/JNM: Old stlye campaigns had the image in the 'campaignImage' field in presentation.
  // If we can't find an image in the resource buckets, check the 'campaignImage' field.
  let image =
        campaign.resources &&
        campaign.resources.find(resource => resource.assetType === 'campaign-image');
  let imageUrl = (image && image.url);

  if (!imageUrl) {
    imageUrl = campaign.presentation && campaign.presentation.campaignImage;
  }

  return imageUrl || '/images/placeholders/image-default.png';
};

export function isCampaignActive(campaign) {

  // Works because campaign endDate is in UTC
  const currentTime = moment.utc();

  // Dates are UTC but not returned with the timeZone qualifier from the DB.
  return moment.utc(campaign.endDate).isAfter(currentTime);
};

export function campaignImageNoDefault(campaign) {
  // XXX/JNM: Old stlye campaigns had the image in the 'campaignImage' field in presentation.
  // If we can't find an image in the resource buckets, check the 'campaignImage' field.
  let image =
        campaign.resources &&
        campaign.resources.find(resource => resource.assetType === 'campaign-image');
  let imageUrl = (image && image.url);

  if (!imageUrl) {
    imageUrl = campaign.presentation && campaign.presentation.campaignImage;
  }

  return imageUrl;
};

export function campaignBaseUri(campaignType) {
  return `${process.env.arCampaignClientDomain + campaignTypeToUriPrefix(campaignType)}/`;
};

export const validatorDictionary = () => {
  const dictionary = {
    en: {
      custom: {
        headline: {
          required: 'Please enter a headline',
          min: 'The headline is too short',
        },
        location: {
          required: 'Please enter a location',
        },
        description: {
          required: 'Please enter a description',
        },
        incentive: {
          required: 'Please enter an incentive for the winner(s)',
        },
        email: {
          required: 'Please enter a valid email address',
          email: 'Please make sure your email is valid',
        },
        password: {
          required: 'Please enter your password',
        },
        capacity: {
          required: 'Please enter a capacity for the venue',
          regex: 'The capacity needs to be in numbers only',
        },
        groupName: {
          max: 'The filter name may be no longer than 30 characters',
          min: 'The filter name may be at least 2 characters',
        },
        accountFacebook: {
          url: 'Please enter a valid Facebook URL',
        },
        accountTwitter: {
          handle: 'Please provide a valid twitter handle e.g @myName',
        },
        accountYoutube: {
          url: 'Please enter a valid YouTube URL',
        },
        numberWinners: {
          required: 'Please enter a number of winners',
          minValue: 'Must be more than 0',
        },
        shareDescription: {
          required: 'Please enter a description for when the campaign is shared',
          maxValue:
            'Due to facebook restrictions, please limit the share description to 250 characters',
        },
        shareTitle: {
          required: 'Please enter a title for when the campaign is shared',
          maxValue: 'Due to facebook restrictions, please limit the title to 90 characters',
        },
        startDate: {
          truthy: 'Please enter a start date',
          required: 'Please enter a start date',
          date_format: 'Please complete start date',
        },
        endDate: {
          required: 'Please enter an end date',
          date_format: 'Please complete end date',
        },
        notifyDate: {
          date_format: 'Please complete on-sale date',
        },
        regoStart: {
          truthy: 'Please enter a registration start date',
        },
        regoEnd: {
          truthy: 'Please enter a registration end date',
        },
        winnerNotification: {
          truthy: 'Please enter a winner notification date',
        },
        presentationDescription: {
          required: 'Please enter a campaign description',
        },
        image: {
          truthy: 'Please upload a valid image',
        },
        event: {
          eventHasBeenSelected:
            'Please select an existing event or create a new one from the dropdown',
        },
        timezone: {
          required: 'Please select a valid timezone',
        },
        nonTimestampedDob: {
          date_format: 'Enter a date in the format DD/MM/YYYY',
        },
        urlSlug: {
          required: 'A unique URL for the campaign is required',
        },
        rewardsHeadline: {
          required: 'Please enter a reward headline',
        },
        rewardsDescription: {
          required: 'Please enter a reward description',
        },
        shareMediaTitle: {
          required: 'Please enter a title',
        },
        shareMediaDescription: {
          required: 'Please enter a description',
        },
        ticketName: {
          required: 'Please enter a ticket name',
        },
        ticketValue: {
          required: 'Please enter a ticket value',
        },
        numWinners: {
          required: 'Please enter the number of winners for this tier',
        },
        rewardPoints: {
          required: 'Please enter a value between 0 and 100',
          max_value: 'Please enter a value between 0 and 100'
        },
      },
    },
  };
  return dictionary;
};

export const inviteMethodDefaultCopy = (name) => {
  switch(name) {
    case 'email':
      return 'Invite via email'
    case 'instagram':
      return 'Invite via Instagram'
    case 'messenger':
      return 'Invite via Messenger'
    case 'sms':
      return 'Invite via SMS'
    case 'twitter':
      return 'Invite via Twitter'
    case 'whatsapp':
      return 'Invite via Whatsapp'
    case 'tiktok':
      return 'Invite via TikTok'
    default:
      return 'Invite'
  }
}
