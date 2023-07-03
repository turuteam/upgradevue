/**
 * Temporarily built for CoreDNA, if server wants to
 * move forward with this, please double check, cause
 * we don't want to extend this temporary feature that
 * is highly customized for CoreDNA.
 */
export type ExternalApiSetting = {
  oid: number;
  promoterOid: number;
  whitelistIpAddresses: string[];
  associatedMessageListOids: number[];
  defaultDynamicTags: string[];
  sysCtime: Date;
  sysMtime: Date;
};
