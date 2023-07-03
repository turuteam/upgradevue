import { AutomationResetState, UITrigger, UIAction, AutomationBox } from "./types";

// TODO: some of these functions may not be needed

export function getAutomationAction(actions: any[], id: number | string) {
  let found = null
  let i = actions.length
  while (i--) {
    let k = actions[i].length
    while (k--) {
      if (!actions[i][k].block) {
        continue
      } else {
        if (actions[i][k].block.id === id) {
          found = actions[i][k]
          return found
        }
      }
    }
  }

  return found
}

export function getActionBlock(boxes: any, id: number) {
  let found
  let i = boxes.length
  while (i--) {
    let j = boxes[i].length
    while (j--) {
      if (!boxes[i][j].id) {
        continue
      }
      if (boxes[i][j].block.id === id) {
        found = boxes[i][j].block
        return found
      }
    }
  }
  return found
}

export async function getTriggers(data: any, promoterOid: number, automationOid: number): Promise<any> {
  let api = window.$nuxt.$api
  let triggers: any = []
  let arr = Object.entries(data)
  let count = 0

  const addTriggers = new Promise((resolve, _) => {
    arr.forEach(async (val, _, array) => {

      try {
        let item: any = val[1]
        let trigger = defaultTrigger()
        trigger.id = item.oid
        trigger.key = item.type.split('.').slice(1).join('.')
        trigger.config = item.config

        switch (item.type) {
          case 'trigger.purchased.ticket-to-event':
            trigger.name = 'Purchased ticket'
            trigger.icon = 'credit-card'
            if (item.config?.['event-oid']) {
              let resp = await api.event.get(promoterOid, item.config['event-oid'])
              trigger.meta = {
                name: resp.name,
                location: resp.location
              }
            }
            triggers.push(trigger)

            break
          case 'trigger.purchased.product-from-store':
            trigger.name = 'Purchased product'
            trigger.icon = 'credit-card'

            if (item.config?.['promoter-product-oid']) {
              let resp = await api.automation.getProduct(promoterOid, item.config['promoter-product-oid'])

              trigger.config.frontend = {
                title: resp.title,
                vendor: resp.vendor
              }
            }
            
            triggers.push(trigger)

            break
          case 'trigger.campaign.registered':
            trigger.name = 'Registers for campaign'
            trigger.icon = 'target'
            if (item.config?.['campaign-oid']) {
              let resp = await api.campaign.fetchCampaignForAutomation(promoterOid, item.config['campaign-oid'])
              trigger.meta = {
                name: resp.name
              }
            }
            triggers.push(trigger)

            break
          case 'trigger.messaging.list.subscribed':
            trigger.name = 'Subscribes to list'
            trigger.icon = 'message'
            // the below is to handle the case in which a promoter
            // creates this trigger and references a list, but later
            // deletes that list from their account.
            // We're resetting the config on the backend to an empty
            // object and here on the frontend also.
            if (!!item.errors?.semantical?.['not-found']) {
              api.automation.updateItemConfig(promoterOid, automationOid, 'trigger', item.oid, {})
              trigger.config = {}
            } else if (item.config?.['message-list-oid']) {
              let list = await api.messageLists.fetchList(promoterOid, item.config['message-list-oid'])
              trigger.meta.list = list.name
            }
            triggers.push(trigger)

            break

          case 'trigger.messaging.list.unsubscribed':
            trigger.name = 'Unsubscribes from list'
            trigger.icon = 'message'
            // the below is to handle the case in which a promoter
            // creates this trigger and references a list, but later
            // deletes that list from their account.
            // We're resetting the config on the backend to an empty
            // object and here on the frontend also.
            if (!!item.errors?.semantical?.['not-found']) {
              api.automation.updateItemConfig(promoterOid, automationOid, 'trigger', item.oid, {})
              trigger.config = {}
            } else if (item.config?.['message-list-oid']) {
              let list = await api.messageLists.fetchList(promoterOid, item.config['message-list-oid'])
              trigger.meta.list = list.name
            }
            triggers.push(trigger)

            break

          case 'trigger.contact.tag.added':
            trigger.name = 'Tag added'
            trigger.icon = 'contacts'
            if (item.config?.['tag-oid']) {
              let tagResp = await api.tags.fetchTagByOid(promoterOid, item.config['tag-oid'])
              if (!!tagResp.length) {
                trigger.meta = {
                  name: tagResp[0].name
                }
              }
            }
            triggers.push(trigger)

            break

          case 'trigger.contact.tag.removed':
            trigger.name = 'Tag removed'
            trigger.icon = 'contacts'
            if (item.config?.['tag-oid']) {
              let tagResp = await api.tags.fetchTagByOid(promoterOid, item.config['tag-oid'])
              if (!!tagResp.length) {
                trigger.meta = {
                  name: tagResp[0].name
                }
              }
            }
            triggers.push(trigger)

            break
          case 'trigger.contact.birthday':
            trigger.name = 'Birthday'
            trigger.icon = 'birthday'

            triggers.push(trigger)

            break
          case 'trigger.short-url.visited':
            trigger.name = 'Clicks on short URL'
            trigger.icon = 'other'
            triggers.push(trigger)

            break
          case 'trigger.webhook':
            trigger.name = 'Webhook'
            trigger.icon = 'other'
            triggers.push(trigger)

            break
          default:
            console.log('An unrecognised trigger type was received:', val)
            break
        }
      } catch (error) {
        console.log('Error creating trigger from api response:', error)
      } finally {
        count += 1
        if (count === array.length) resolve(true)
      }
    })
  })

  await addTriggers
  return triggers
}

export async function formattedAPIBox(box: any, promoterOid: number, automationOid: number): Promise<any> {
  let api = window.$nuxt.$api
  let actionBox: AutomationBox

  try {
    let block = box.block
    let action = {
      ...defaultAction(),
      id: block.oid,
      key: block.type.split('.').slice(1).join('.'),
      config: block.config,
      parentOutBoxId: block.parentOutBoxId,
    }

    switch (block.type) {
      case 'action.tag.add':
        action.name = 'Add a Tag'
        action.icon = 'contacts'
        if (block.config?.['tag-oid']) {
          let tagResp = await api.tags.fetchTagByOid(promoterOid, block.config['tag-oid'])
          if (!!tagResp.length) {
            action.meta = {
              name: tagResp[0].name
            }
          }
        }
        break
      case 'action.tag.remove':
        action.name = 'Remove a Tag'
        action.icon = 'contacts'
        if (block.config?.['tag-oid']) {
          let tagResp = await api.tags.fetchTagByOid(promoterOid, block.config['tag-oid'])
          if (!!tagResp.length) {
            action.meta = {
              name: tagResp[0].name
            }
          }
        }
        break
      case 'action.send.sms':
        action.name = 'Send SMS'
        action.icon = 'message'
        break
      case 'action.send.email':
        action.name = 'Send email'
        action.icon = 'message'
        if (block.config?.['promoter-property-oid']) {
          const messageSender = await api.messageSenders.get(promoterOid, block.config['promoter-property-oid']);
          action.meta.messageSender = messageSender;
        }
        if (block.config?.['bucket-oid']) {
          const bucket = await api.buckets.fetch(block.config['bucket-oid']);
          action.meta.bucket = bucket;
        }
        break
      case 'action.list.add':
        action.name = 'Add to List'
        action.icon = 'message'
        
        // the below is to handle the case in which a promoter
        // creates this action and references a list, but later
        // deletes that list from their account.
        // We're resetting the config on the backend to an empty
        // object and here on the frontend also.
        if (!!block.errors?.semantical?.['not-found']) {
          api.automation.updateItemConfig(promoterOid, automationOid, 'block', block.oid, {})
          action.config = {}
        } else if (block.config?.['message-list']) {
          let list = await api.messageLists.fetchList(promoterOid, block.config['message-list'].oid)
          action.meta.list = list.name
        }
        break
      case 'action.list.remove':
        action.name = 'Remove from List'
        action.icon = 'message'

        // the below is to handle the case in which a promoter
        // creates this action and references a list, but later
        // deletes that list from their account.
        // We're resetting the config on the backend to an empty
        // object and here on the frontend also.
        if (!!block.errors?.semantical?.['not-found']) {
          api.automation.updateItemConfig(promoterOid, automationOid, 'block', block.oid, {})
          action.config = {}
        } else if (block.config?.['message-list-oid']) {
          let list = await api.messageLists.fetchList(promoterOid, block.config['message-list-oid'])
          action.meta.list = list.name
        }
        break
      case 'control.if-else':
        action.name = 'If/Else'
        action.icon = 'branch'
        if (block.config?.['filter-group-oid']) {
          if (!block.config?.frontend?.segment) {
            let { filter } = await api.automation.getFilterGroup(promoterOid, block.config['filter-group-oid'])
            action.meta.filter = filter.conditions[0]
          }
        }
        break
      case 'control.delay-by':
        action.name = 'Delay by'
        action.icon = 'clock'
        if (action.config?.['delay-sec']) {
          action.meta = action.config.frontend
        }
        break
      case 'control.wait-until':
        action.name = 'Wait until'
        action.icon = 'calendar'
        break
      case 'control.unique':
        action.name = 'Unique'
        action.icon = 'fingerprint'
        break
      default:
        action.icon = 'message'
        console.log('An unrecognised action type was received from the API: ', block)
    }

    actionBox = {
      ...box,
      block: action
    }

    return actionBox

  } catch (error) {
    console.log('Error creating action from api response:', error)
  }
}

export function defaultAction(): UIAction {
  return {
    id: null,
    key: null,
    name: null,
    type: 'action',
    icon: null,
    parentOutBoxId: null,
    config: {},
    meta: {},
  }
}

export function defaultTrigger(): UITrigger {
  return {
    id: null,
    key: null,
    name: null,
    type: 'trigger',
    icon: null,
    config: {},
    meta: {},
  }
}

export function automationResetState(): AutomationResetState {
  return {
    id: null,
    name: null,
    status: null,
    rootBoxId: null,
    createdAt: null,
    triggers: {
      boxId: null,
      items: [],
    },
    actions: [],
    editableItem: null,
    loading: false,
    newActionIsDragging: false,
    dragOverId: null,
    draggedBox: null,
    selectedSidebarTab: 'triggers',
    zoomVal: 1,
    scrollVals: null,
    isScrolling: null,
    isFullScreen: false,
    actionConfigHasUpdated: null,
    triggerIsMoving: false,
    products: null,
  }
}

export const runPromises = async (promiseObject: Object) => {
  let keys: any[] = []
  let promises: any[] = []

  Object.entries(promiseObject).forEach(([key, val]) => {
    keys.push(key)
    promises.push(val)
  })

  let data = await Promise.all(promises)
  let merged = data.reduce((obj, value, index) => ({ ...obj, [keys[index]]: value }), {})

  return merged
}