import { clone } from '@/utils/helpers';

export function fanFilterWithExtraConditions(filter, conditions, logic) {
  const resFilter = clone(filter || { conditions: [], logic: [] });

  const seachStringFilter = {
    conditions: conditions,
    logic: logic,
  };

  if (resFilter.conditions.length === 0) {
    return seachStringFilter;
  } else {
    return {
      conditions: resFilter.conditions.concat(seachStringFilter.conditions),
      logic: resFilter.logic.concat(['and']).concat(seachStringFilter.logic),
    };
  }
}

export function mergeSearchStringToOrderFilters(filter, searchString) {
  const resFilter = clone(filter || { conditions: [], logic: [] });

  if (!searchString) {
    return resFilter;
  }

  // Split by space, also remove all empty string from list of separated values
  const [firstPart, secondPart] = searchString.split(' ').filter(val => !!val);
  const nameSeparated = !!(firstPart && secondPart);


  /**
   * CAUTION!!!!
   * 2019.10.11
   * Our audienceFilter will group all conditions with 'or' between as one 'logic group',
   * so "a and b and c or d or e and f" will be "a and b and (c or d or e) and f",
   * but here, we're trying to attach (firstName or lastName or emailAddress or mobileNumber),
   * which is fine because it has only "ors", which won't break them into two groups.
   * But it will break if we're trying to attach (firstName and lastName or emailAddress or mobileNumber),
   * it will end up with (firstName and lastName) or emailAddress or mobileNumber
   * For more details: https://trello.com/c/N6Q8QvgL/1346-audiencefilter-logic-group
   */
  if (nameSeparated) {
    return fanFilterWithExtraConditions(filter, [
      {
        name: 'firstName',
        type: 'text',
        data: { value: firstPart, condition: 'contains' },
      },
      {
        name: 'lastName',
        type: 'text',
        data: { value: secondPart, condition: 'contains' },
      },
    ], ['and']);
  } else {
    return fanFilterWithExtraConditions(filter, [
      {
        name: 'firstName',
        type: 'text',
        data: { value: searchString, condition: 'contains' },
      },
      {
        name: 'lastName',
        type: 'text',
        data: { value: searchString, condition: 'contains' },
      },
    ], ['or', 'or', 'or']);
  }
}

export function mergeSearchStringToFanFilters(filter, searchString) {
  const resFilter = clone(filter || { conditions: [], logic: [] });

  if (!searchString) {
    return resFilter;
  }

  // Split by space, also remove all empty string from list of separated values
  const [firstPart, secondPart] = searchString.split(' ').filter(val => !!val);
  const nameSeparated = !!(firstPart && secondPart);


  /**
   * CAUTION!!!!
   * 2019.10.11
   * Our audienceFilter will group all conditions with 'or' between as one 'logic group',
   * so "a and b and c or d or e and f" will be "a and b and (c or d or e) and f",
   * but here, we're trying to attach (firstName or lastName or emailAddress or mobileNumber),
   * which is fine because it has only "ors", which won't break them into two groups.
   * But it will break if we're trying to attach (firstName and lastName or emailAddress or mobileNumber),
   * it will end up with (firstName and lastName) or emailAddress or mobileNumber
   * For more details: https://trello.com/c/N6Q8QvgL/1346-audiencefilter-logic-group
   */
  if (nameSeparated) {
    return fanFilterWithExtraConditions(filter, [
      {
        name: 'firstName',
        type: 'text',
        data: { value: firstPart, condition: 'contains' },
      },
      {
        name: 'lastName',
        type: 'text',
        data: { value: secondPart, condition: 'contains' },
      },
    ], ['and']);
  } else {
    return fanFilterWithExtraConditions(filter, [
      {
        name: 'firstName',
        type: 'text',
        data: { value: searchString, condition: 'contains' },
      },
      {
        name: 'lastName',
        type: 'text',
        data: { value: searchString, condition: 'contains' },
      },
      {
        name: 'emailAddress',
        type: 'text',
        data: { value: searchString, condition: 'contains' },
      },
      {
        name: 'mobileNumber',
        type: 'text',
        data: { condition: 'contains', value: searchString },
      },
    ], ['or', 'or', 'or']);
  }
}

export function filterCriteriaHasConstraint(filterCriteria) {
  if (!filterCriteria) return;

  return !!filterCriteria.constraints &&
    // @ts-ignore
    (filterCriteria.constraints?.event?.enabled ||
      // @ts-ignore
      filterCriteria.constraints?.campaign?.enabled ||
      // @ts-ignore
      filterCriteria.constraints?.message?.enabled ||
      // @ts-ignore
      filterCriteria.constraints?.period?.enabled ||
      // @ts-ignore
      filterCriteria.constraints?.loyaltyProgram?.enabled ||
      // @ts-ignore
      filterCriteria.constraints?.loyaltyTier?.enabled);
}

export function filterCriteriaHasMandatoryConstraint(filterCriteria) {
  if (!filterCriteria) return;

  return !!filterCriteria.constraints &&
    // @ts-ignore
    ((filterCriteria.constraints?.event?.enabled && filterCriteria.constraints?.event?.mandatory) ||
      // @ts-ignore
      (filterCriteria.constraints?.campaign?.enabled && filterCriteria.constraints?.campaign?.mandatory) ||
      // @ts-ignore
      (filterCriteria.constraints?.message?.enabled && filterCriteria.constraints?.message?.mandatory) ||
      // @ts-ignore
      (filterCriteria.constraints?.period?.enabled && filterCriteria.constraints?.period?.mandatory) ||
      // @ts-ignore
      (filterCriteria.constraints?.loyaltyProgram?.enabled && filterCriteria.constraints?.loyaltyProgram?.mandatory) ||
      // @ts-ignore
      (filterCriteria.constraints?.loyaltyTier?.enabled && filterCriteria.constraints?.loyaltyTier?.mandatory));
}

// Returns TRUE if a given filterCondition's mandatory constraints are fulfilled in the filterCriteria
// Also returns true if no mandatory constraints exist
export function filterCriteriaMandatoryConstraintsFilled(filterCriteria, editFilterCondition) {
  const constraintKeys = Object.keys(filterCriteria.constraints).filter( item => {
    return filterCriteria.constraints[item].mandatory;
  });
  let isFulfilled = true;
  constraintKeys.forEach( constraintName => {
    if (!editFilterCondition.constraints[constraintName] || !editFilterCondition.constraints[constraintName].condition) {
      isFulfilled = false;
    }
  });
  return isFulfilled;
}
