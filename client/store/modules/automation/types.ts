export interface AutomationResetState {
  id: number | null;
  name: string | null;
  status: string | null;
  rootBoxId: number | null;
  createdAt: string | null;
  triggers: TriggersState;
  actions: any;
  editableItem: any;
  loading: boolean;
  newActionIsDragging: boolean;
  dragOverId: Number | null;
  draggedBox: AutomationBox | null;
  selectedSidebarTab: string;
  zoomVal: Number;
  scrollVals: any;
  isScrolling: any;
  isFullScreen: boolean;
  actionConfigHasUpdated: any;
  triggerIsMoving: boolean;
  products: any;
}

export interface AutomationState extends AutomationResetState {
  automationsList: any;
}

export type TriggersState = {
  boxId: null;
  items: UITrigger[];
};

export type BoxIds = {
  self: number | null;
  out: number | null;
};

export type AutomationBox = {
  id: BoxIds;
  parentOutBoxId: number | null;
  block: UIAction | null;
  children: AutomationBox[];
};

export type Link = {
  'chart-oid': number;
  'from-box-oid': number;
  oid: number;
  'promoter-oid': number;
  'sys-activep': boolean;
  'sys-ctime': string;
  'to-box-oid': number;
};

export interface AutomationResponse {
  oid: number;
  promoterOid: number;
  name: string;
  sysActivep: boolean;
  status: string;
  sysCtime: string;
}

export interface TriggerResponse extends AutomationResponse {
  config: any;
}

export interface UITrigger {
  id: number | null;
  key: string | null;
  name: string | null;
  type: string | null;
  config: any;
  meta: any;
  icon: string | null;
}

export interface UIAction {
  id: number | null;
  key: string | null;
  name: string | null;
  type: string | null;
  parentOutBoxId: number | null;
  config: any;
  meta: any;
  icon: string | null;
}

export interface ActionResponse extends AutomationResponse {
  full: any;
  config: any;
  state: string | null;
  'parent-link': any | null;
  chartOid: number;
  boxes: any;
  block: any;
}

export type ChartResponse = {
  rootBoxOid: number;
  chart: AutomationResponse;
  triggers: any;
  blocks: any;
  links: any;
  boxes: any;
};
