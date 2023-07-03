import { generateHash, clone } from '@/utils/helpers';
import { isSegmentConditionComplete } from '@/utils/segment';
import { SegmentConditionHashMap, ConditionSearchPickerChosenItemsMap } from './types';

/**
 * Help you create new filter condition based on different criteria type without efforts
 *
 * @param segmentCriteria The criteria used to create condition
 * @returns The new condition with default value put in
 */
const generateSegmentTextConditionExpression = (segmentCondition: SegmentTextCondition, segmentCriteria: SegmentTextCriteria): string => {
  const predicate = segmentCriteria.data.predicates.find(predicate => predicate.value === segmentCondition.data.condition);
  const subject: string = segmentCriteria.title;
  const verb: string = predicate ? predicate.title : '';
  const object = segmentCondition.data.value || '';
  return `${subject} ${verb}${object ? ' ' : ''}${object}`;
};
const generateSegmentTextPickerConditionExpression = (segmentCondition: SegmentTextPickerCondition, segmentCriteria: SegmentTextPickerCriteria): string => {
  const predicate = segmentCriteria.data.predicates.find(predicate => predicate.value === segmentCondition.data.condition);
  let subject: string = segmentCriteria.title;
  if (subject === 'Tag contains') {
    subject = 'Tag'
  }
  const verb: string = predicate ? predicate.title : '';
  const object = segmentCondition.data.value || '';
  return `${subject} ${verb}${object ? ' ' : ''}${object}`;
};

const generateSegmentSelectConditionExpression = (segmentCondition: SegmentSelectCondition, segmentCriteria: SegmentSelectCriteria): string => {
  const subject: string = segmentCriteria.title;
  const verb: string = 'is';
  const object = (segmentCondition.data || '').replace(/_/g, " ");
  return `${subject} ${verb}${object ? ' ' : ''}${object}`;
};

const generateSegmentDateConditionExpression = (segmentCondition: SegmentDateCondition, segmentCriteria: SegmentDateCriteria): string => {
  const predicate = segmentCriteria.data.predicates.find(predicate => predicate.value === segmentCondition.data.condition);
  const subject: string = segmentCriteria.title;
  const verb: string = predicate ? predicate.title : '';
  const object = segmentCondition.data.values ? segmentCondition.data.values.join(' and ') : '';
  return `${subject} ${verb}${object ? ' ' : ''}${object}`;
};

const generateSegmentDatePickerConditionExpression = (segmentCondition: SegmentDatePickerCondition, segmentCriteria: SegmentDatePickerCriteria): string => {
  const predicate = segmentCriteria.data.predicates.find(predicate => predicate.value === segmentCondition.data.condition);
  const subject: string = segmentCriteria.title;
  const verb: string = predicate ? predicate.title : '';
  const object = segmentCondition.data.values ? segmentCondition.data.values.join(' and ') : '';
  return `${subject} ${verb}${object ? ' ' : ''}${object}`;
};

const generateSegmentNumericConditionExpression = (segmentCondition: SegmentNumericCondition, segmentCriteria: SegmentNumericCriteria): string => {
  const predicate = segmentCriteria.data.predicates.find(predicate => predicate.value === segmentCondition.data.condition);
  const subject: string = segmentCriteria.title;
  const verb: string = predicate ? predicate.title : '';
  const object = segmentCondition.data.values ? segmentCondition.data.values.join(' and ') : '';
  return `${subject} ${verb}${object ? ' ' : ''}${object}`;
};

const generateSegmentCurrencyConditionExpression = (segmentCondition: SegmentCurrencyCondition, segmentCriteria: SegmentCurrencyCriteria): string => {
  const predicate = segmentCriteria.data.predicates.find(predicate => predicate.value === segmentCondition.data.condition);
  const subject: string = segmentCriteria.title;
  const verb: string = predicate ? predicate.title : '';
  // Unit is cent, so let's divide it by 100
  const prunedValues = segmentCondition.data.values ? segmentCondition.data.values.map(value => value / 100) : [];
  const object = prunedValues.join(' and ');
  return `${subject} ${verb}${object ? ' ' : ''}${object}`;
};

const generateSegmentConditionSearchPickerConditionExpression = (
  segmentCondition: SegmentConditionSearchPickerCondition,
  segmentCriteria: SegmentConditionSearchPickerCriteria,
  segmentChosenItemsMap: ConditionSearchPickerChosenItemsMap,
): string => {
  const predicate = segmentCriteria.data.predicates.find(predicate => {
    return predicate.value === segmentCondition.data.condition
  })
  const subject: string = segmentCriteria.title;
  const resource: string = segmentCriteria.resource;

  // In order to make the filter expressions read a bit more naturally, we need to modify the predicate title to remove ' all' and ' any', and use
  // 'and' and 'or' to join the objects
  let verb: string = '';
  let joinWord = 'and';
  if (predicate && (predicate.value === 'true_to_all' || predicate.value === 'false_to_all')) {
    verb = predicate.title.substr(-4, 4) === ' all' ? predicate.title.replace(` all`, ``) : predicate.title;
    joinWord = 'and';
  } else if (predicate && (predicate.value === 'true_to_any' || predicate.value === 'false_to_any')) {
    verb = predicate.title.substr(-4, 4) === ' any' ? predicate.title.replace(` any`, ``) : predicate.title;
    joinWord = 'or';
  }

  let values: any = segmentCondition.data.values || [];
  let chosenItems: any[] = [];
  if (segmentCondition.name === 'pages') { chosenItems = values.map((value: any) => segmentChosenItemsMap.pages[value]); }
  if (segmentCondition.name === 'campaigns') { chosenItems = values.map((value: any) => segmentChosenItemsMap.campaigns[value]); }
  if (segmentCondition.name === 'events') { chosenItems = values.map((value: any) => segmentChosenItemsMap.events[value]); }
  if (segmentCondition.name === 'tags') { chosenItems = values.map((value: any) => segmentChosenItemsMap.tags[value]); }
  chosenItems = chosenItems.map(item => {
    if (!item) { return ''; }
    return item.name.length > 15 ? `"${item.name.substring(0, 15)}..."` : `"${item.name}"`;
  });
  const object = chosenItems.length !== 0 ? chosenItems.join(` ${joinWord} `) : '';

  if (resource === 'tags') {
    return setTagsFilterString(chosenItems, segmentChosenItemsMap, predicate)
  }

  // Manually setting the strings here, because otherwise it just reads awkwardly
  if (predicate && predicate.value === 'any') {
    if (resource === 'optInForms') return `Submitted any signup form`;
    if (resource === 'events') return `Purchased tickets to any event`;
    if (resource === 'campaigns') return `Registered to any campaign`;
  } else if (predicate && predicate.value === 'all') {
    if (resource === 'events') return `Purchased tickets to all events`;
  } else if (predicate && predicate.value === 'none') {
    if (resource === 'campaigns') return `Not registered to any campaign`;
  }

  return `${subject} ${verb}${object ? ' ' : ''}${object}`;
};

const generateSegmentCustomFieldConditionExpression =
  (segmentCondition: SegmentCustomFieldCondition,
   segmentCriteria: SegmentCustomFieldCriteria):string => {
    const predicate = segmentCriteria.data.predicates.find(predicate => {
      return predicate.value === segmentCondition.data.condition
    })
    const fieldName = 'Custom field';
    const verb: string = predicate ? predicate.title : '';
    const objectA = segmentCondition.data.values[0] || '';
    const objectB = segmentCondition.data.values[1] || '';
    const combinedObjects = objectB ? `${objectA} and ${objectB}` : objectA;

    const customFieldType = segmentCondition.data.customFieldType || 'text';
    switch (customFieldType) {
      case "text":
        return `${fieldName} ${verb}${objectA ? ' ' : ''}${objectA}`;
      case "number":
        return `${fieldName} ${verb}${combinedObjects ? ' ' : ''}${combinedObjects}`;
      case "date":
        return `${fieldName} ${verb}${combinedObjects ? ' ' : ''}${combinedObjects}`;
      default:
        return `${fieldName} ${verb}${combinedObjects ? ' ' : ''}${combinedObjects}`;
    }
}

const setTagsFilterString = (data:any, segmentChosenItemsMap:any, predicate:any):string => {
  if (!data.length || !predicate) return ''
  let subject = data.length > 1 ? 'Tags' : 'Tag'

  let tagString = ''
  let length = data.length
  let i = 0
  while(i < length) {
    if (i === length - 1) {
      if (length > 1) {
        tagString += `and ${data[i]}`
      } else {
        tagString += `${data[i]}`
      }
    } else if (i === length - 2) {
      tagString += `${data[i]} `
    } else {
      tagString += `${data[i]}, `
    }

    i++
  }

  let filterString = `${subject} ${tagString} ${predicate.title}`
  return filterString
}

/**
 * Generate nice expression for describing filter condition
 * @param segmentCondition
 * @param segmentCriteria
 * @param segmentChosenItemsMap
 */
export const generateSegmentConditionExpression = (
  segmentCondition: SegmentCondition,
  segmentCriteria: SegmentCriteria,
  segmentChosenItemsMap: ConditionSearchPickerChosenItemsMap,
): string => {
  if (segmentCondition.type === 'text' && segmentCriteria.type === 'text') {
    return generateSegmentTextConditionExpression(segmentCondition, segmentCriteria);
  } else if (segmentCondition.type === 'text-picker' && segmentCriteria.type === 'text-picker') {
    return generateSegmentTextPickerConditionExpression(segmentCondition, segmentCriteria)
  } else if (segmentCondition.type === 'select' && segmentCriteria.type === 'select') {
    return generateSegmentSelectConditionExpression(segmentCondition, segmentCriteria);
  } else if (segmentCondition.type === 'date' && segmentCriteria.type === 'date') {
    return generateSegmentDateConditionExpression(segmentCondition, segmentCriteria);
  } else if (segmentCondition.type === 'date-picker' && segmentCriteria.type === 'date-picker') {
    return generateSegmentDatePickerConditionExpression(segmentCondition, segmentCriteria);
  } else if (segmentCondition.type === 'numeric' && segmentCriteria.type === 'numeric') {
    return generateSegmentNumericConditionExpression(segmentCondition, segmentCriteria);
  } else if (segmentCondition.type === 'currency' && segmentCriteria.type === 'currency') {
    return generateSegmentCurrencyConditionExpression(segmentCondition, segmentCriteria);
  } else if (segmentCondition.type === 'condition-search-picker' && segmentCriteria.type === 'condition-search-picker') {
    return generateSegmentConditionSearchPickerConditionExpression(segmentCondition, segmentCriteria, segmentChosenItemsMap);
  } else if (segmentCondition.type === 'custom-field' && segmentCriteria.type === 'custom-field') {
    return generateSegmentCustomFieldConditionExpression(segmentCondition, segmentCriteria);
  } else {
    return '';
  }
};

/**
 * Unfotunately, we don't have unique id for each condition of Applied filter,
 * so we have to generate a hash map for the purpose of rendering list in Vue template.
 *
 * @param segment Generate map from condition of this filter
 */
export const generateSegmentConditionHashMap = (segment: Segment): SegmentConditionHashMap => {
  const hashMap: SegmentConditionHashMap = {};

  segment.filter.conditions.forEach((condition, conditionIndex) => {
    hashMap[conditionIndex] = generateHash();
  });

  return hashMap;
};

export const addSegmentConditionHash = (filterConditionHashMap: SegmentConditionHashMap): SegmentConditionHashMap => {
  const mapSize: number = Object.keys(filterConditionHashMap).length;
  return {
    ...filterConditionHashMap,
    [mapSize]: generateHash(),
  };
};

export const removeSegmentConditionHash = (filterConditionHashMap: SegmentConditionHashMap, index: number): SegmentConditionHashMap => {
  const mapSize = Object.keys(filterConditionHashMap).length;
  const newMap = clone(filterConditionHashMap);
  for (let i = index; i < mapSize - 1; i += 1) {
    newMap[i] = newMap[i + 1];
  }
  delete newMap[mapSize - 1];
  return newMap;
};

export const getPrunedSegmentFilter = (segment: Segment): Segment => {
  const clonedSegment = clone(segment);
  const newFilterConditions = [];
  let newFilterLogic = [];
  let parenthesisLength = 0;

  for (let i = 0, j = 0; i < clonedSegment.filter.conditions.length; i += 1, j += 1) {
    const condition = clonedSegment.filter.conditions[i];
    let logic = clonedSegment.filter.logic[j];

    const isConditionComplete = isSegmentConditionComplete(condition);

    if (isConditionComplete) {
      newFilterConditions.push(condition);

      if (logic === '(' || logic === ')') {
        parenthesisLength += 1;
        newFilterLogic.push(logic);
        j++;
        logic = clonedSegment.filter.logic[j];
      }

      newFilterLogic.push(logic);

    }
  }
  newFilterLogic = newFilterLogic.slice(0, newFilterLogic.length - 1);

  return {
    ...clonedSegment,
    filter: { conditions: newFilterConditions, logic: newFilterLogic },
  };
};

export const getPrunedSegment = (segment: Segment): Segment => {
  const clonedSegment = clone(segment);
  const newFilterConditions = [];
  let newFilterLogic = [];

  for (let i = 0; i < clonedSegment.filter.conditions.length; i += 1) {
    const condition = clonedSegment.filter.conditions[i];
    const logic = clonedSegment.filter.logic[i];

    const isConditionComplete = isSegmentConditionComplete(condition);

    if (isConditionComplete) {
      newFilterConditions.push(condition);
      newFilterLogic.push(logic);
    }
  }
  newFilterLogic = newFilterLogic.slice(0, newFilterLogic.length - 1);

  return {
    ...clonedSegment,
    filter: { conditions: newFilterConditions, logic: newFilterLogic },
  };
};

export const generateScratchSegmentFromTag = (tagOid: number, scratchFilter: Segment): Segment => {
  return {
    oid: scratchFilter.oid,
    favourite: false,
    userDefined: false,
    version: 2,
    name: '',
    filter: {
      logic: [],
      conditions: [
        {
          name: 'tags',
          type: 'condition-search-picker',
          data: {
            condition: 'true_to_all',
            values: [tagOid],
          },
        },
      ],
    },
  }
};

export const generateScratchSegmentFromMessageSegment = (messageSegment: number, filter: any): Segment => {
  return {
    oid: messageSegment,
    favourite: false,
    userDefined: false,
    version: 2,
    name: '',
    filter,
  }
};

// Compares two segments and returns true if it finds any 'meaningful' difference between the two.
// A segment is considered meaningfully different if it contains more or fewer completed filters than the other, or if
// the completed filters differ in any way whatsoever.
// Thus, a filter with an additional incomplete segment will not be considered meaningfully different.
export const segmentsAreMeaningfullyDifferent = (segment1: Segment, segment2: Segment): boolean => {
  if (!segment1?.filter && !segment2?.filter) return false; // If both null, then no difference
  if (!segment1?.filter || !segment2?.filter) return true; // If only one is null then assume different
  if (segment1.oid !== segment2.oid) return true; // If oids dont match, then assume different
  const segment1Filter = segment1.filter;
  const segment2Filter = segment2.filter;

  // If any of the logic items dont exactly match, assume different
  if (segment1Filter.logic.length === segment2Filter.logic.length) {
    const isDifferent = segment1Filter.logic.some( (item, idx) => {
      return segment2Filter.logic[idx] !== item;
    });
    if (isDifferent) return true;
  }

  const segment1Complete = segment1Filter.conditions.filter( item => isSegmentConditionComplete(item))
  const segment2Complete = segment2Filter.conditions.filter( item => isSegmentConditionComplete(item))

  // If the number of complete segments doesn't match, then assume different
  if (segment1Complete.length !== segment2Complete.length) return true;

  // Finally, iterate over each of the segment conditions. Stringify them and match the output string.
  // If the strings dont match exactly, then there's a difference.
  let isDifferent = false;
  segment1Complete.forEach( (item, idx) => {
    const segment1String = JSON.stringify(item);
    const segment2String = JSON.stringify(segment2Complete[idx]);
    if (segment1String !== segment2String) {
      isDifferent = true;
    }
  })

  return isDifferent;
}

