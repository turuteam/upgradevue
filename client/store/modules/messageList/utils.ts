import { AdvancedMessageListTargeting } from '@/store/modules/messageList/types';
import { RecipientFilter } from '@/store/modules/message/types';
import { clone } from '@/utils/helpers';
import { MessageList } from '@/api/message-lists/types';

export const getInitialAdvancedMessageListTargeting = function (): AdvancedMessageListTargeting {
  return {
    type: 'all',
    condition: 'include',
    subCondition: null,
    values: [],
  }
};

export const convertTargetingToFilterExpression =
  function(currentTargetingType:string | null,
           currentTargetingCondition:string | null,
           currentTargetingSubCondition:string | null,
           currentTargetingValues:string[]):RecipientFilter | null {

  if (currentTargetingType === 'all') return null;
  if (!currentTargetingType ||
      !currentTargetingCondition ||
      // !currentTargetingSubCondition ||   // Purposefully commenting this out as the subcondition may be null
      !currentTargetingValues ||
      currentTargetingValues.length === 0) {
    return null;
  }
  if (["include", "exclude"].indexOf(currentTargetingCondition) < 0) {
    return null;
  }

  let conditionSearchPickerValue;

  // If a subcondition is present, then use that. Otherwise, infer a value from the condition.
  if (currentTargetingSubCondition) {
    conditionSearchPickerValue = currentTargetingSubCondition;
  } else {
    conditionSearchPickerValue = currentTargetingCondition === 'include' ? 'true_to_all' : 'false_to_all';
  }
  const anyOrAll = ["true_to_any", "false_to_any"].indexOf(conditionSearchPickerValue) > -1 ? "any" : "all";

  switch(currentTargetingType) {
    case "tag":
      return {
        "conditions": [{
          "data": {
            "condition": conditionSearchPickerValue,
            "values": clone(currentTargetingValues),
          },
          "name": "tags",
          "type": "condition-search-picker",
          "provider": "advanced-targeting",
        }],
        "logic": [],
      };
    case "events":
      return {
        "conditions": [{
          "data": {
            "condition": conditionSearchPickerValue,
            "values": clone(currentTargetingValues),
          },
          "name": "events",
          "type": "condition-search-picker",
          "provider": "advanced-targeting",
        }],
        "logic": [],
      };
    case "campaigns":
      return {
        "conditions": [{
          "data": {
            "condition": conditionSearchPickerValue,
            "values": clone(currentTargetingValues),
          },
          "name": "campaigns",
          "type": "condition-search-picker",
          "provider": "advanced-targeting",
        }],
        "logic": [],
      };
    case "segment":
      return null; // We'll be adding this at a later date
    case "recent_send":
      return null; // We'll be adding this at a later date
    case "messages_clicked":

      // @ts-ignore
      return {
        "conditions": [{
          "data": {
            "condition": conditionSearchPickerValue,
            "values": clone(currentTargetingValues),
          },
          "name": "messages_clicked",
          "type": "condition-search-picker",
          "provider": "advanced-targeting",
        },{
          "data": {
            "condition": anyOrAll === "any" ? "true_to_any" : "true_to_all", // This ensures that the messages being tested were also received by the fan
            "values": clone(currentTargetingValues),
          },
          "name": "messages_sent",
          "type": "condition-search-picker",
          "provider": "advanced-targeting",
        }],
        "logic": ["and"],
      };
    case "messages_opened":
      // @ts-ignore
      return {
        "conditions": [{
          "data": {
            "condition": conditionSearchPickerValue,
            "values": clone(currentTargetingValues),
          },
          "name": "messages_opened",
          "type": "condition-search-picker",
          "provider": "advanced-targeting",
        },{
          "data": {
            "condition": anyOrAll === "any" ? "true_to_any" : "true_to_all", // This ensures that the messages being tested were also received by the fan
            "values": clone(currentTargetingValues),
          },
          "name": "messages_sent",
          "type": "condition-search-picker",
          "provider": "advanced-targeting",
        }],
        "logic": ["and"],
      };
    default:
      return null;
  }
};

export const getSMSTotalNumber = (campaignOid: any, messageList: MessageList): number => {
  let statSnapshotIsNew: boolean
  if (!!campaignOid) {
    statSnapshotIsNew = typeof messageList?.statsSnapshot?.sms?.validMobile !== 'undefined'

    return statSnapshotIsNew ? (messageList.statsSnapshot?.sms?.validMobile || 0) : (messageList.statsSnapshot.mobileNumber || 0)
  }
  statSnapshotIsNew = typeof messageList?.statsSnapshot?.sms?.optedIn !== 'undefined'
   // @ts-ignore
  return statSnapshotIsNew ? (messageList.statsSnapshot?.sms?.optedIn || 0) : (messageList.statsSnapshot?.sms || 0)
}

export const getFBTotalNumber = (facebookPageId: any, messageList: MessageList): number => {
  let pageId = facebookPageId || messageList?.meta?.facebookMessenger?.pageId

  // @ts-ignore
  if (!!messageList?.statsSnapshot.facebook && (!!messageList?.statsSnapshot.facebook[pageId] || messageList?.statsSnapshot.facebook[pageId] === 0)) {
    // @ts-ignore
    return messageList.statsSnapshot.facebook[pageId]
  }
    // @ts-ignore
  if (messageList?.statsSnapshot.facebookMessenger) { // facebookMessenger is the old method of tracking FB stats. We'll remove this eventually
    // @ts-ignore
    return messageList.statsSnapshot.facebookMessenger
  }

  return 0
}

export const getFilteredRecipientListCount = (deDupedName: string, channel: string | null, campaignOid: any, facebookPageId: any, messageList: MessageList): number => {

  if (channel === 'email' && !!campaignOid) {
    return messageList.statsSnapshot.total;
  }

  if (channel === 'sms') {
    return getSMSTotalNumber(campaignOid, messageList)
  }

  if (channel === 'facebookMessenger' || channel === 'facebook') {
    return getFBTotalNumber(facebookPageId, messageList)
  }

  // @ts-ignore
  if (deDupedName && !!messageList?.statsSnapshot[deDupedName]) {
    // @ts-ignore
    return messageList.statsSnapshot[deDupedName]
  }

  // @ts-ignore
  return messageList?.statsSnapshot[channel]
}

export const getMergedFilters = (prunedScratchSegment: any, targetingFilter: any): any => {
  if (!prunedScratchSegment) return targetingFilter

  if (!targetingFilter) return prunedScratchSegment.filter

  let filter = {...targetingFilter}

  if (!filter.conditions) {
    filter.conditions = []
  }

  if (!filter.logic) {
    filter.logic = []
  }

  if (!!prunedScratchSegment?.filter?.conditions?.length) {
    filter.conditions = prunedScratchSegment.filter.conditions.concat(filter.conditions)

    if (!!prunedScratchSegment.filter?.logic?.length) {
      filter.logic = (['(']).concat(prunedScratchSegment.filter.logic).concat([')']).concat(['and']).concat(filter.logic)
    } else {
      filter.logic = ['and'].concat(filter.logic)
    }
  }

  return filter
}

export const generateSignupFormEmbed = (hash: string, domain: string, payload: any): string => {
  let formOid = payload.oid
  let iframeContainer = document.createElement('div')
  iframeContainer.id = `arep-iframe-container-${formOid}`
  iframeContainer.appendChild(
    Object.assign(
      document.createElement('iframe'),
      {
        id: `arep-iframe-${formOid}`,
        src: `${process.env.arCampaignClientDomain}/m/${payload.urlSlug}?domain=${domain}&hash=${hash}`,
        style: "width:1px;height:1px;display:none;",
        onload: "arepSignupFormHandler.iframeLoaded(this)"
      }
    )
  )

  let formContainer = document.createElement('div')
  formContainer.id = `arep-form-container-${formOid}`
  formContainer.appendChild(
    Object.assign(
      document.createElement('h1'),
      {
        id: `arep-form-${formOid}-header`,
      }
    )
  )

  const script = document.createElement('script')
  script.src= `${window.location.origin}/scripts/embeddable-signup-form.js`;

  return `${iframeContainer.outerHTML} ${formContainer.outerHTML}
<script>
var arepFormId = ${formOid};
var targetOrigin = "${process.env.arCampaignClientDomain}"
</script>
${script.outerHTML}
<style>
/* Developers: customize your form styles here. Feel free to delete, overwrite or modify them as you see fit. */
.arep-form {
    width: 100%;
    max-width: 600px;
}
.arep-input {
    display: block;
    width: 100%;
}
.arep-form-field-wrapper {
    margin-bottom: 12px;
}
.arep-mobileNumber-input-wrap .arep-mobileNumber-code-input {
    display: inline-block;
    width: 100px;
    margin-right: 6px;
}
.arep-mobileNumber-input-wrap .arep-mobileNumber-number-input {
    display: inline-block;
    width: calc(100% - 100px - 6px);
}

</style>`
}
