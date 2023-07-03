type ConstraintsCriteria = {
  campaign?: {
    enabled: boolean;
    predicates?: {
      title: string;
      value: string;
    }[];
  };
  event?: {
    enabled: boolean;
    predicates?: {
      title: string;
      value: string;
    }[];
  };
  message?: {
    enabled: boolean;
    predicates?: {
      title: string;
      value: string;
    }[];
  };
  period?: {
    enabled: boolean;
    predicates?: {
      title: string;
      value: string;
    }[];
  };
  loyaltyProgram?: {
    enabled: boolean;
    predicates?: {
      title: string;
      value: string;
    }[];
  };
  loyaltyTier?: {
    enabled: boolean;
    predicates?: {
      title: string;
      value: string;
    }[];
  };
}

type SegmentSelectCriteria = {
  type: 'select';
  title: string;
  data: {
    title: string;
    value: string;
  }[];
  resource: string;
  constraints?: ConstraintsCriteria;
}

type SegmentTextCriteria = {
  type: 'text';
  title: string;
  data: {
    predicates: {
      title: string;
      value: string;
    }[];
  };
  resource: string;
  constraints?: ConstraintsCriteria;
}

type SegmentTextPickerCriteria = {
  type: 'text-picker';
  title: string;
  targetResource: string;
  targetColumn: string;
  data: {
    predicates: {
      title: string;
      value: string;
    }[];
  };
  resource: string;
  constraints?: ConstraintsCriteria;
}

type SegmentDateCriteria = {
  type: 'date';
  title: string;
  data: {
    predicates: {
      title: string;
      value: string;
    }[];
  };
  resource: string;
  constraints?: ConstraintsCriteria;
}

type SegmentDatePickerCriteria = {
  type: 'date-picker';
  title: string;
  targetResource: string;
  targetColumn: string;
  data: {
    predicates: {
      title: string;
      value: string;
    }[];
  };
  resource: string;
  constraints?: ConstraintsCriteria;
}

type SegmentNumericCriteria = {
  type: 'numeric';
  title: string;
  data: {
    predicates: {
      title: string;
      value: string;
    }[];
  };
  resource: string;
  constraints?: ConstraintsCriteria;
}

type SegmentCurrencyCriteria = {
  type: 'currency';
  title: string;
  data: {
    predicates: {
      title: string;
      value: string;
    }[];
  };
  resource: string;
  constraints?: ConstraintsCriteria;
}

type SegmentConditionSearchPickerCriteriaResource = 'campaigns' | 'events' | 'tags' | 'pages' | 'opt-in-forms' | 'messages_clicked' | 'messages_opened' | 'messages_sent';
/**
 * Condition search picker is not like other types of criteria, each item of it
 * is highly customized, so whenever server adds new type, we have to know that.
 */
type SegmentConditionSearchPickerCriteria = {
  type: 'condition-search-picker';
  title: string;
  data: {
    predicates: {
      title: string;
      value: string;
    }[];
    source: string;
  };
  resource: SegmentConditionSearchPickerCriteriaResource;
  constraints?: ConstraintsCriteria;
}

type SegmentCustomFieldCriteria = {
  type: 'custom-field',
  title: string;
  data: {
    predicates: {
      title: string;
      value: string;
    }[];
  };
  resource: string;
  constraints?: ConstraintsCriteria;
}

type SegmentCriteria = SegmentSelectCriteria | SegmentTextCriteria | SegmentTextPickerCriteria |
  SegmentDateCriteria | SegmentDatePickerCriteria | SegmentNumericCriteria | SegmentCurrencyCriteria |
  SegmentConditionSearchPickerCriteria | SegmentCustomFieldCriteria;

type SegmentCriteriaGroup = {
  title: string;
  data: SegmentCriteria[];
}

type SegmentCriteriaMap = {
  [key: string]: SegmentCriteria;
}
