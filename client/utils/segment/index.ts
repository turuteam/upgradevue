export const isSegmentConditionComplete = (segmentCondition: SegmentCondition): boolean => {
  if (segmentCondition.type === 'text') {
    return isTextConditionComplete(segmentCondition);
  } else if (segmentCondition.type === 'text-picker') {
    return isTextPickerConditionComplete(segmentCondition);
  } else if (segmentCondition.type === 'select') {
    return isSelectConditionComplete(segmentCondition);
  } else if (segmentCondition.type === 'date') {
    return isDateConditionComplete(segmentCondition);
  } else if (segmentCondition.type === 'date-picker') {
    return isDatePickerConditionComplete(segmentCondition);
  } else if (segmentCondition.type === 'numeric') {
    return isNumericConditionComplete(segmentCondition);
  } else if (segmentCondition.type === 'currency') {
    return isCurrencyConditionComplete(segmentCondition);
  } else if (segmentCondition.type === 'custom-field') {
    return isCustomFieldConditionComplete(segmentCondition);
  } else {
    return isConditionSearchPickerConditionComplete(segmentCondition);
  }
};

const isCustomFieldConditionComplete = (segmentCondition: SegmentCustomFieldCondition): boolean => {
  if (!segmentCondition.data.condition) { return false; }
  if (!segmentCondition.data.customFieldOid) { return false; }
  if (!segmentCondition.data.customFieldType) { return false; }
  if (segmentCondition.data.condition === 'is_known' || segmentCondition.data.condition === 'is_unknown') { return true; }
  switch(segmentCondition.data.customFieldType) {
    case "text":
      return !!segmentCondition.data.values[0];
    case "number":
    case "date":
      if (segmentCondition.data.condition === 'is_between') {
        return !!(segmentCondition.data.values[0] && segmentCondition.data.values[1]);
      }
      return !!segmentCondition.data.values[0];
    case "dropdown-single":
    case "dropdown-multi":
      return !!segmentCondition.data.values[0];
    default:
      return false;
  }
}

const isTextConditionComplete = (segmentCondition: SegmentTextCondition): boolean => {
  if (!segmentCondition.data.condition) { return false; }
  else if (segmentCondition.data.condition === 'is_known' || segmentCondition.data.condition === 'is_unknown') { return true; }
  else { return !!segmentCondition.data.value; }
};
const isTextPickerConditionComplete = (segmentCondition: SegmentTextPickerCondition): boolean => {
  if (!segmentCondition.data.condition) { return false; }
  else if (segmentCondition.data.condition === 'is_known' || segmentCondition.data.condition === 'is_unknown') { return true; }
  else { return !!segmentCondition.data.value; }
};

const isSelectConditionComplete = (segmentCondition: SegmentSelectCondition): boolean => {
  return !!segmentCondition.data;
};

const isDateConditionComplete = (segmentCondition: SegmentDateCondition): boolean => {
  if (!segmentCondition.data.condition) { return false; }
  else if (segmentCondition.data.condition === 'is_known' || segmentCondition.data.condition === 'is_unknown') { return true; }
  else if (segmentCondition.data.condition === 'is_between') { return !!(segmentCondition.data.values[0] && segmentCondition.data.values[1]); }
  else { return !!segmentCondition.data.values[0]; }
};

const isDatePickerConditionComplete = (segmentCondition: SegmentDatePickerCondition): boolean => {
  if (!segmentCondition.data.condition) { return false; }
  else if (segmentCondition.data.condition === 'is_known' || segmentCondition.data.condition === 'is_unknown') { return true; }
  else if (segmentCondition.data.condition === 'is_between') { return !!(segmentCondition.data.values[0] && segmentCondition.data.values[1]); }
  else { return !!segmentCondition.data.values[0]; }
};

const isNumericConditionComplete = (segmentCondition: SegmentNumericCondition): boolean => {
  if (!segmentCondition.data.condition) { return false; }
  else if (segmentCondition.data.condition === 'is_known' || segmentCondition.data.condition === 'is_unknown') { return true; }
  else if (segmentCondition.data.condition === 'is_between') { return !isNaN(segmentCondition.data.values[0]) && !isNaN(segmentCondition.data.values[1]); }
  else { return !isNaN(segmentCondition.data.values[0]); }
};

const isCurrencyConditionComplete = (segmentCondition: SegmentCurrencyCondition): boolean => {
  if (!segmentCondition.data.condition) { return false; }
  else if (segmentCondition.data.condition === 'is_known' || segmentCondition.data.condition === 'is_unknown') { return true; }
  else if (segmentCondition.data.condition === 'is_between') { return !isNaN(segmentCondition.data.values[0]) && !isNaN(segmentCondition.data.values[1]); }
  else { return !isNaN(segmentCondition.data.values[0]); }
};

const isConditionSearchPickerConditionComplete = (segmentCondition: SegmentConditionSearchPickerCondition): boolean => {
  if (!segmentCondition.data.condition) { return false; }
  if (["any", "none", "all"].indexOf(segmentCondition.data.condition) > -1) { return true; }
  else { return segmentCondition.data.values.length > 0; }
};

/**
 * Help you create new filter condition based on different criteria type without efforts
 *
 * @param segmentCriteria The criteria used to create condition
 * @returns The new condition with default value put in
 */
export const generateSegmentCondition = (segmentCriteria: SegmentCriteria, source: string | null): SegmentCondition => {
  let provider = {}
  if (!!source && source === "message-segment") {
    provider = {
      provider: "advanced-filtering"
    }
  }
  if (segmentCriteria.type === 'select') {
    return {
      data: "",
      name: segmentCriteria.resource,
      constraints: generateConstraints(segmentCriteria),
      type: 'select',
      ...provider
    };
  } else if (segmentCriteria.type === 'numeric') {
    return {
      data: { condition: segmentCriteria.data.predicates[0].value, values: [] },
      name: segmentCriteria.resource,
      constraints: generateConstraints(segmentCriteria),
      type: 'numeric',
      ...provider
    };
  } else if (segmentCriteria.type === 'currency') {
    return {
      data: { condition: segmentCriteria.data.predicates[0].value, values: [] },
      name: segmentCriteria.resource,
      constraints: generateConstraints(segmentCriteria),
      type: 'currency',
      ...provider
    };
  } else if (segmentCriteria.type === 'date') {
    return {
      data: { condition: segmentCriteria.data.predicates[0].value, values: [] },
      name: segmentCriteria.resource,
      constraints: generateConstraints(segmentCriteria),
      type: 'date',
      ...provider
    };
  }  else if (segmentCriteria.type === 'date-picker') {
    return {
      data: { condition: segmentCriteria.data.predicates[0].value, values: [] },
      name: segmentCriteria.resource,
      constraints: generateConstraints(segmentCriteria),
      type: 'date-picker',
      ...provider
    };
  } else if (segmentCriteria.type === 'condition-search-picker') {
    return {
      data: { condition: segmentCriteria.data.predicates[0].value, values: [] },
      name: segmentCriteria.resource,
      constraints: generateConstraints(segmentCriteria),
      type: 'condition-search-picker',
      ...provider
    };
  } else if (segmentCriteria.type === 'text-picker') {
    return {
      data: { condition: segmentCriteria.data.predicates[0].value, value: '' },
      name: segmentCriteria.resource,
      constraints: generateConstraints(segmentCriteria),
      type: 'text-picker',
      ...provider
    }
  } else if (segmentCriteria.type === 'custom-field') {
    return {
      data: {
        condition: segmentCriteria.data.predicates[0].value,
        values: [],
        customFieldOid: null,
        customFieldType: ''
      },
      name: segmentCriteria.resource,
      constraints: generateConstraints(segmentCriteria),
      type: 'custom-field',
      ...provider
    }
  } else {
    return {
      data: { condition: segmentCriteria.data.predicates[0].value, value: '' },
      name: segmentCriteria.resource,
      constraints: generateConstraints(segmentCriteria),
      type: 'text',
      ...provider
    };
  }
};


const generateConstraints = (segmentCriteria: SegmentCriteria): any => {
  return !!segmentCriteria.constraints ?
    // eslint-disable-next-line multiline-ternary
    {
      period: segmentCriteria.constraints.period && segmentCriteria.constraints.period.enabled ?
        // eslint-disable-next-line multiline-ternary
        {
          condition: segmentCriteria.constraints.period.predicates ? segmentCriteria.constraints.period.predicates[0].value : 'all',
          values: [],
        } : undefined,
      message: segmentCriteria.constraints.message && segmentCriteria.constraints.message.enabled ?
        // eslint-disable-next-line multiline-ternary
        {
          condition: segmentCriteria.constraints.message.predicates ? segmentCriteria.constraints.message.predicates[0].value : 'all',
          values: [],
        } : undefined,
      event: segmentCriteria.constraints.event && segmentCriteria.constraints.event.enabled ?
        // eslint-disable-next-line multiline-ternary
        {
          condition: segmentCriteria.constraints.event.predicates ? segmentCriteria.constraints.event.predicates[0].value : 'all',
          values: [],
        } : undefined,
      campaign: segmentCriteria.constraints.campaign && segmentCriteria.constraints.campaign.enabled ?
        // eslint-disable-next-line multiline-ternary
        {
          condition: segmentCriteria.constraints.campaign.predicates ? segmentCriteria.constraints.campaign.predicates[0].value : 'all',
          values: [],
        } : undefined,
      loyaltyProgram: segmentCriteria.constraints.loyaltyProgram && segmentCriteria.constraints.loyaltyProgram.enabled ?
        // eslint-disable-next-line multiline-ternary
        {
          condition: segmentCriteria.constraints.loyaltyProgram.predicates ? segmentCriteria.constraints.loyaltyProgram.predicates[0].value : null,
          values: [],
        } : undefined,
      loyaltyTier: segmentCriteria.constraints.loyaltyTier && segmentCriteria.constraints.loyaltyTier.enabled ?
        // eslint-disable-next-line multiline-ternary
        {
          condition: segmentCriteria.constraints.loyaltyTier.predicates ? segmentCriteria.constraints.loyaltyTier.predicates[0].value : 'all',
          values: [],
        } : undefined,
    } : undefined
};
