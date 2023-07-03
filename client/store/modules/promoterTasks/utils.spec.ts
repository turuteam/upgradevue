import {
  formatTask
} from './utils'

import {PromoterIntegrationTask} from "~/api/promoter-integration-task/types";


const integrationTaskMocks:PromoterIntegrationTask[] = [
  {
    oid: 1,
    promoterOid: 1,
    promoterAccountOid: 1,
    promoterIntegrationOid: 1,
    sysCtime: '2022-12-12',
    sysMtime: '2022-12-12',
    sysActivep: true,
    name: 'background-fan-import-csv',
    status: 'completed',
    scheduledAt: '2022-12-12',
    provider: 'test',
    duration: 1,
    started: '2022-12-12',
    automationBlockOid: 0,
    resourceOid: 0,
    messageListOid: 0,
    eventOid: 0,
    messageTaskOid: 0,
    campaignOid: 0,
    meta: {
      bucketMeta: {
        filename: 'test-file.csv',
        assetType: 'audience-contact',
      }
    }
  }
]


describe('formatTask', () => {

  it('background-fan-import-csv task is formatted correctly', () => {
    const formattedTask = formatTask(integrationTaskMocks[0]);
    expect(formattedTask.name).toBe('test-file.csv - List imported');
    expect(formattedTask.subtitle).toBe('Started 12:00 am, Dec. 12, 2022');
    expect(formattedTask.icon).toBe('upload');
    expect(formattedTask.status).toBe('completed');
  })


})
