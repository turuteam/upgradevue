type ConstraintsCondition = {
  period?: {
    condition: string;
    values?: number[];
  } | undefined,
  message?: {
    condition: string;
    values?: number[];
  } | undefined,
  event?: {
    condition: string;
    values?: number[];
  } | undefined,
  campaign?: {
    condition: string;
    values?: number[];
  } | undefined,
  loyaltyProgram?: {
    condition: string | null;
    values?: number[];
  } | undefined,
  loyaltyTier?: {
    condition: string;
    values?: number[];
  } | undefined
} | undefined;

type SegmentNumericCondition = {
  data: {
    condition: string;
    values: number[];
  },
  name: string;
  type: 'numeric';
  constraints?: ConstraintsCondition | undefined;
};

type SegmentCurrencyCondition = {
  data: {
    condition: string;
    values: number[];
  },
  name: string;
  type: 'currency';
  constraints?: ConstraintsCondition;
};

type SegmentTextCondition = {
  data: {
    condition: string;
    value: string;
  },
  name: string;
  type: 'text';
  constraints?: ConstraintsCondition;
};

type SegmentTextPickerCondition = {
  data: {
    condition: string;
    value: string;
  },
  name: string;
  type: 'text-picker';
  constraints?: ConstraintsCondition;
};

type SegmentSelectCondition = {
  data: string;
  name: string;
  type: 'select';
  constraints?: ConstraintsCondition;
};

type SegmentConditionSearchPickerCondition = {
  data: {
    condition: string;
    values: number[] | string[];
  },
  name: SegmentConditionSearchPickerCriteriaResource;
  type: 'condition-search-picker';
  constraints?: ConstraintsCondition;
  provider?: ('advanced-targeting' | 'advanced-filtering');
};

type SegmentDateCondition = {
  data: {
    condition: string;
    values: string[];
  },
  name: string;
  type: 'date';
  constraints?: ConstraintsCondition;
};

type SegmentDatePickerCondition = {
  data: {
    condition: string;
    values: string[];
  },
  name: string;
  type: 'date-picker';
  constraints?: ConstraintsCondition;
};

type SegmentCustomFieldCondition = {
  data: {
    condition: string;
    values: string[] | number[];
    customFieldOid: number;
    customFieldType: string;
  },
  name: string;
  type: 'custom-field',
  constraints?: ConstraintsCondition
}
type SegmentCondition = SegmentNumericCondition | SegmentCurrencyCondition | SegmentTextCondition |
  SegmentTextPickerCondition | SegmentSelectCondition | SegmentConditionSearchPickerCondition |
  SegmentDateCondition | SegmentDatePickerCondition | SegmentCustomFieldCondition;

type Segment = {
  name: string;
  favourite: boolean;
  filter: {
    logic: ('and' | 'or' | '(' | ')')[];
    conditions: SegmentCondition[];
  };
  oid: number;
  userDefined: boolean;
  version: number;
}
