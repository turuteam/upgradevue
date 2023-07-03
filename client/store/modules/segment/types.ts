export type SegmentConditionHashMap ={
  [key: number]: string;
};

export type SratchSegmentInfo =
  { source: null, changed: boolean, sourceOid: null } |
  { source: 'saved-audience-filter', changed: boolean, sourceOid: number } |
  { source: 'internal-audience-filter', changed: boolean, sourceOid: number } |
  { source: 'tag', changed: true, sourceOid: number } |
  { source: 'message-segment', changed: boolean, sourceOid: number | null };

/**
 * Condition Search Condition will fetch api to get items, we save them here, so people
 * can get detailed item object of each item by providing key of that item.
 * @field campaigns Mapping Campaign oid to Campaign object
 * @field events Mapping Event oid to Event object
 * @field tags Mapping Tag oid to Tag object
 * @field pages Mapping FB page puid to FB object
 */
export type ConditionSearchPickerChosenItemsMap = {
  campaigns: {
    [key: number]: any;
  };
  events: {
    [key: number]: any;
  };
  tags: {
    [key: number]: any;
  };
  pages: {
    [key: string]: any;
  };
};


/**
 * State of Audience Filter Module
 * @field segmentCriteriaGroups Entire filter criteria data returned from server
 * @field segmentCriteriaMap Audience map for you to get filter criteria information by condition's name
 * @field savedSegmentList All segments returned from sever, including Internal and Scratch segments
 * @field scratchSegment The filter being used for editing purpose
 * @field scratchSegmentConditionHashMap The client side generated unique key map for each dontion of applied filter
 */
export type SegmentState = {
  segmentCriteriaGroups: SegmentCriteriaGroup[];
  segmentCriteriaMap: SegmentCriteriaMap;
  savedSegmentList: Segment[],
  internalSegment: Segment | null,
  scratchSegment: Segment | null,
  scratchSegmentInfo: SratchSegmentInfo;
  scratchSegmentConditionHashMap: SegmentConditionHashMap;
  segmentChosenItemsMap: ConditionSearchPickerChosenItemsMap;
  isPatchingSegment: boolean;
  isCreatingSegment: boolean;
  isDeletingSegment: boolean;
}