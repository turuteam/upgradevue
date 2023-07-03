export type EmailSenderProperty = {
  meta: {
    hash: string;
    expiresAt: Date;
  };
  additionalInfo: {
    senderName: string;
    businessAddress: string;
  };
  oid: number;
  promoterAccountOid: number;
  promoterOid: number;
  property: string;
  sysActivep: boolean;
  sysCtime: Date;
  sysMtime: Date;
  type: string;
  verified: boolean;
  verifiedTime: Date;
}
