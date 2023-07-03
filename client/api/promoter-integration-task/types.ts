export interface PromoterIntegrationTask {
  oid: number;
  promoterOid: number;
  promoterAccountOid: number;
  promoterIntegrationOid: number;
  sysCtime: string;
  sysMtime: string;
  sysActivep: boolean;
  meta?: {
    bucketMeta?: { filename: string, assetType: string },
    messageBody?: { subject: string },
  };
  name: string;
  status: string;
  statusDetails?: {
    fanOids?: [number],
    totalFanSynched?: number,
  };
  scheduledAt: string;
  provider: string;
  duration: number;
  started: string;
  automationBlockOid: number;
  resourceOid: number;
  messageListOid: number;
  eventOid: number;
  messageTaskOid: number;
  campaignOid: number;
}
