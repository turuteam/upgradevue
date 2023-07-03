/**
 * Integration
 */
export interface Integration {
  oid: number;
  provider: string;
  app: string;
  name: string;
  description: string;
  categories: string;
  enabled: boolean;
  packageId: string;
  sysCtime: Date;
  sysMtime: object;
  sysActivep: boolean;
}
