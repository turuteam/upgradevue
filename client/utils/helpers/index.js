/**
 * All the functions here are just to help us easily deal with some duplicated and 'generic' tasks.
 * For something relative to Campaign, Account, blabla..., don't put them here.
 */
import { allowedDateFormats, allowedDateFormatsUs, allowedDateFormatsInternational } from '~/utils/allDateFormats';
import accounting from 'accounting';
import merge from 'deepmerge';
import moment from 'moment';
import { hexColorCodeRegex } from '@/utils/regex/';
import { gzipSync } from 'fflate';

Object.filter = (obj, predicate) =>
    Object.keys(obj)
          .filter( key => predicate(obj[key]) )
          .reduce( (res, key) => (res[key] = obj[key], res), {} );

export function arraysEqual(arr1, arr2) {
  if(arr1.length !== arr2.length)
      return false;
  for(var i = arr1.length; i--;) {
      if(arr1[i] !== arr2[i])
          return false;
  }

  return true;
}

export function sliceObject (obj, start = 0, end = null) {
  return Object.fromEntries(
      Object.entries(obj).slice(start, end)
  );
}

// Converts an object of key:value pairs into an array of objects
/*
  Eg, the following inputs...
    ({"foo": "bar", "xyz": "abc"}, 'title', 'value')
  ... will become...
    [{title: "foo", value: "bar"},
     {title: "xyz", value: "abc"}]
 */
export function objectToArrayOfObjectsj(obj, keyKey, valueKey) {
  const returnArray = [];
  Object.keys(obj).forEach(item => {
    const newObj = {}
    newObj[keyKey] = item;
    newObj[valueKey] = obj[item];
    returnArray.push(newObj);
  });
  return returnArray;
}

export function arraysEqualUnsorted(arr1, arr2) {
  const newArr1 = [...arr1].sort();
  const newArr2 = [...arr2].sort();
  return arraysEqual(newArr1, newArr2);
}

// Does a light comparison of objects - converts both objects into JSON strings and compares the pairs
export function objectsEqual(obj1, obj2) {
  // Ensure that both are objects first
  if (Object.prototype.toString.call(obj1) !== Object.prototype.toString.call(obj2)) {
    return false;
  }

  const obj1Keys = Object.keys(obj1);
  const obj2Keys = Object.keys(obj2);

  // Same number of keys?
  if (obj1Keys.length !== obj2Keys.length) return false;

  // Are keys the same?
  obj1Keys.forEach((obj1Key, idx) => {
    if (obj2Keys[idx] !== obj1Key) return false;
  });

  let jsonString1 = '';
  let jsonString2 = '';

  try {
    jsonString1 = JSON.stringify(obj1);
    jsonString2 = JSON.stringify(obj2);

    return jsonString1 === jsonString2;
  } catch (e) {
    return false;
  }
}


//If you write your own code, remember hex color shortcuts (eg., #fff, #000)

export function hexToRGBA(hex, opacity) {
  let c;
  if (hexColorCodeRegex.test(hex)){
      c = hex.substring(1).split('');
      if (c.length === 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = '0x' + c.join('');
      return `rgba(${[(c>>16)&255, (c>>8)&255, c&255].join(',')},${opacity === undefined ? 1 : opacity})`;
  } else {
    return null;
  }
};

export function rgbToHex(color) {
  color = '' + color;
  if (!color || color.indexOf('rgb') < 0) {
    return;
  }

  if (color.charAt(0) == '#') {
    return color;
  }

  var nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
      r = parseInt(nums[2], 10).toString(16),
      g = parseInt(nums[3], 10).toString(16),
      b = parseInt(nums[4], 10).toString(16);

  return '#' + (
      (r.length == 1 ? '0' + r : r) +
      (g.length == 1 ? '0' + g : g) +
      (b.length == 1 ? '0' + b : b)
  );
};

// https://stackoverflow.com/a/13542669
// https://github.com/PimpTrizkit/PJs/wiki/12.-Shade,-Blend-and-Convert-a-Web-Color-(pSBC.js)
export function shadeHexColor(color, percent) {
  let f=parseInt(color.slice(1),16); let t=percent<0?0:255; let p=percent<0?percent*-1:percent; let R=f>>16; let G=f>>8&0x00FF; let B=f&0x0000FF;
  return "#"+(0x1000000+(Math.round((t-R)*p)+R)*0x10000+(Math.round((t-G)*p)+G)*0x100+(Math.round((t-B)*p)+B)).toString(16).slice(1);
}


export function pause(timeout) {
  return new Promise(res => {
    setTimeout(res, timeout);
  });
};

export function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  return JSON.parse(atob(base64));
}

// Convert every string to camel case
export const convertToCamelCase = function (str) {
  return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

export function convertToSnakeCase(text) {
  return text.replace(/[^a-zA-Z ]/g, " ").split(/(?=[A-Z])/).join(' ').toLowerCase().replace(/\s+/g,"_");
}

export function convertToKebabCase(text) {
  if (typeof text !== 'string') return text;
  // https://regexr.com/75hfe
  return text
    .replace(/\B([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export function convertToTitleCase(text) {
  const wordsToKeepLowerCase = ['a', 'is', 'the', 'of', 'but', 'nor', 'etc'];
  const textArr = text.toLowerCase().split(' ');
  const returnText = textArr.map( (item, idx) => {
    if (idx !== 0 && wordsToKeepLowerCase.indexOf(item) > -1) return item;
    return item.charAt(0).toUpperCase() + item.slice(1);
  });
  return returnText.join(' ');
}

export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function toSlug(value = '') {
  return value
    .toLowerCase()
    .normalize('NFKD') // remove diacretics from letters
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
}

export const formatCurrency = number => accounting.formatMoney(number, { precision: 2 });

export function amountInDollars(number) {
  const currency = formatCurrency(number/100);
  return currency.slice(1, currency.length - 3);
}

export function formatNumberWithCommas(number) {
  const numberString = number.toString();
  let [integerPart, decimalPart] = numberString.split('.');

  const regex = /(\d)(?=(\d{3})+(?!\d))/g;
  const formattedIntegerPart = integerPart.replace(regex, '$1,');

  decimalPart = decimalPart && decimalPart !== '00' ? decimalPart.slice(0, 2) : null;
  const formattedNumber = decimalPart ? `${formattedIntegerPart}.${decimalPart}` : formattedIntegerPart;

  return formattedNumber;
}

export function centsRemaining(number) {
  const currency = formatCurrency(number/100);
  return currency.slice(currency.length - 3);
}

export function formatInteger(number) {
  return accounting.formatNumber(number);
}

export function formatFloat(number) {
  return accounting.toFixed(number, 2);
}

export function clone(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  } else if (typeof obj === 'object') {
    return merge({}, obj);
  } else if (typeof obj === 'array') {
    return obj.map(item => clone(item));
  } else {
    return obj;
  }
}

export const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray

export function mergeObjects(objA, objB) {
  return merge(objA, objB, { arrayMerge: overwriteMerge })
}

export function generateHash(length = 14) {
  return Math.random()
    .toString(16)
    .substring(2, 2 + length);
}
export function UtcInCurrentLocale(date, timeZone) {
  return moment(moment.tz(date, timeZone).format('YYYY-MM-DDTHH:mm:ss')).format()
}

export function formateLocalDateInUTC(date, timeZone) {
  return moment.tz(moment(date).format('YYYY-MM-DDTHH:mm:ss'), timeZone).utc().format()
}

export function isURL(maybeUrl) {
  if(!maybeUrl) return false;
  const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;

  return maybeUrl.match(urlRegex) !== null;
}

export function filterObjectToQueryString({
  logicalOperators = [],
  expressions = []
}) {
  if (expressions.length === 0) {
    return null;
  }

  let queryExpression = '';
  const numExpressions = expressions.length;

  if (numExpressions > 0 && logicalOperators.length !== (numExpressions - 1)) {
    throw `Invalid filter object: there are ${numExpressions} expressions joined by ${logicalOperators.length} logical operators. There should either be ${logicalOperators.length + 1} expressions or ${numExpressions - 1} logical operators.`
  }

  expressions.forEach((expression, index) => {
    let { key, value, operator } = expression;
    let subExpressions = expression.expressions;
    let subLogicalOperators = expression.logicalOperators;

    if (!!subExpressions && !!subLogicalOperators) {
      // Recursively build groupings
      const queryPart = filterObjectToQueryString({
        expressions: subExpressions,
        logicalOperators: subLogicalOperators,
      });
      queryExpression += queryPart;
    } else {
      if (typeof(value) === 'string' && value !== 'NULL') {
        value = `"${value}"`;
      }
      let queryPart = `${key} ${operator} ${value}`;
      if (index != numExpressions - 1) {
        queryPart += ` ${logicalOperators[index]} `
      }
      queryExpression += queryPart;
    }
  });

  return `(${queryExpression})`;
}

// Returns a color for a given icon
export function iconColor(icon) {
  switch(icon) {
    case 'sms':
      return 'sms';
      break;
    case 'messenger':
      return 'messenger';
      break;
    default:
      return null
  }
}

export function generateRandomString(length = 5, options = {
  includeCapitals: true,
  includeNumbers: false,
}) {
  let allowedChars = "abcdefghijklmnopqrstuvwxyz";
  if (options.includeCapitals) allowedChars = `${allowedChars}${allowedChars.toUpperCase()}`;
  if (options.includeNumbers) allowedChars = `${allowedChars}0123456789`;
  let returnString = "";
  const charsetLength = allowedChars.length;
  for (let i = 0; i < length; i++) {
    returnString += allowedChars.charAt(Math.floor(Math.random() * charsetLength));
  }
  return returnString;
}

export function generateUniqueIntegersArray(length, min, max) {
  let arr = [];
  let hashTable = {};
  while (arr.length < length) {
    let num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!hashTable[num]) {
      arr.push(num);
      hashTable[num] = true;
    }
  }
  return arr;
}

export function csvValidationCheck(
  mapping,
  csvRows,
  fullCheck = false,
  dateFormat = 'all',
  indexesToCheck = []) {
   // mapping is in shape: {9: "emailAddress", ....}

  // If we pass in an array of rows to check to the function, then use that.
  // If the number of rows is less than 1000 OR fullcheck is selected, do all rows
  // Otherwise, default to an empty array and calculate the rows to check below...
  // Note - ideally pre-compute the indexesToCheck, so that we dont have to redo it for
  // each field being checked...
  let checkTheseRows;
  if (fullCheck) {
    checkTheseRows = csvRows;
  } else if (indexesToCheck.length > 0) {
    checkTheseRows = indexesToCheck.map( index => csvRows[index]);
  } else {
    checkTheseRows = csvRows.length < 1000
      ? Array.from({length: csvRows.length}, (_, i) => i)
        .map(index => csvRows[index])
      : generateUniqueIntegersArray(500, 0, csvRows.length - 1)
        .map(index => csvRows[index])
  }

  const checkType = mapping.columnType || "string";
   // The blank '' or ' ' will be trimed to empty string ''
   // the predicate haven't identify error values will return false
   let predicate = () => true;
   switch (checkType) {
     case "email":
       predicate = (row) => {
         const index = mapping.mappedTo;
         // this is the email regex used in campaign server
         const emailRegex = /.+\@.+\..+/;
         return !emailRegex.test(row[index]);
       };
       break;
     case "number":
       predicate = (row) => {
         const index = mapping.mappedTo;
         if (!mapping.required && !row[index].trim()) {
          return false;
        }
         return isNaN(parseFloat(row[index]));
       };
       break;
     case "mobileNumber":
        predicate = (row) => {
          const index = mapping.mappedTo;
          if (!mapping.required && !row[index].trim()) {
           return false;
          }
          const mobilePhoneRegex = /^[1-9]\d{3,14}$/;
          const nonNumberRemoved = row[index].replace(/\D/g, "");
          return !mobilePhoneRegex.test(nonNumberRemoved);
        };
        break;
     case "datetime":
       predicate = (row) => {
         const index = mapping.mappedTo;
         if (!mapping.required && !row[index].trim()) {
           return false;
         }
         // all valid formats allowed by campaign server
         if (dateFormat === 'us') {
           return !moment(row[index], allowedDateFormatsUs, true).isValid();
         } else if (dateFormat === 'international') {
           return !moment(row[index], allowedDateFormatsInternational, true).isValid();
         }
         return !moment(row[index], allowedDateFormats, true).isValid();

       };
       break;
     case "string":
       predicate = (row) => {
         // if not required, pass the check for row[index].trim().length === 0;
         // currency and timezone is string type but have undefined mapppedTo
         if (mapping.required && (mapping.mappedTo != undefined)) {
          const index = mapping.mappedTo;
          return !row[index]
         } else {
          return false
         }
       };
       break;
     default:
       predicate = (row) => undefined;
       break;
   }

   const failingRow = checkTheseRows.find(predicate);
   if (failingRow !== undefined) {
     return failingRow[mapping.mappedTo];
   } else {
     return null;
   }
 }

export function updatedImportBtnColor(arToPromoterMap, importType, selectedProvider, selectedCurrency) {
  if (!arToPromoterMap || !selectedProvider) {
    return 'grey'
  }
  // check the import conditions: required mapping, currency and provider
  const unmappedRequired = arToPromoterMap.filter(item => item.required && (item.mappedTo === null ))
  if (importType == "events") {
    return unmappedRequired.length === 0 ? 'purple' : 'grey';
  } else {
    return (selectedCurrency && unmappedRequired.length === 0) ? 'purple' : 'grey';
  }
 }

export function sanitizeFilename(filename) {
  return filename.replace(/[^a-zA-Z0-9\.\-_]/g, '_');
}

export async function fileContentZipToB64(file) {
  let date = new Date();
  const dataBuffer = new Uint8Array(await file.arrayBuffer());

  const gzipped = gzipSync(dataBuffer, {
    // GZIP-specific: the filename to use when decompressed
    filename: file.name,
    // GZIP-specific: the modification time. Can be a Date, date string,
    // or Unix timestamp
    mtime: date.toISOString(),
  });

  return Buffer.from(gzipped).toString('base64')
}

