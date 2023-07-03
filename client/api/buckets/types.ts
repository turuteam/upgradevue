export interface Bucket {
  oid: number;
  url: string | null;
  filename: string | null;
  taskOid: number;
  assetType: string;
  sysCtime: Date;
  meta: object | null;
  sysActivep: boolean;
  privacyPortalOid: boolean | null;
  campaignOid: boolean | null;
  eventOid: boolean | null;
  fanOid: boolean | null;
  contentType: string;
  uploadParams: {
      xAmzAlgorithm: string;
      successActionStatus: string;
      key: string;
      policy: string;
      finalUrl: string;
      filename: string;
      xAmzDate: string;
      xAmzSignature: string;
      contentType: string;
      acl: string;
      action: string;
      uploadUrl: string;
      xAmzCredential: string;
  } | {};
  tourOid: boolean | null;
  promoterOid: number;
}
