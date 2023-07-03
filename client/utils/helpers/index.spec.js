import merge from 'deepmerge';
import {
  hexToRGBA,
  convertToSnakeCase,
  clone,
  toSlug,
  capitalizeFirstLetter,
  isURL,
  formatCurrency,
  formatInteger,
  csvValidationCheck,
  formatNumberWithCommas,
  // not exported in index.js
  //   objectToQueryString,

  filterObjectToQueryString,
  updatedImportBtnColor,
} from './index.js';

const commonDateExamples = [
  ['2020/10/05'],
  ['2020/10/5'],
  ['2020/9/05'],
  ['2020/9/5'],

  ['2010/10/05 13:30:00Z'],
  ['2010/10/05 13:30:00'],
  ['2010/10/05 13:30'],
  ['2010/10/05 1:30:00 pm'],
  ['2010/10/05 1:30 pm'],

  ['2010/10/5 13:30:00Z'],
  ['2010/10/5 13:30:00'],
  ['2010/10/5 13:30'],
  ['2010/10/5 1:30:00 pm'],
  ['2010/10/5 1:30 pm'],

  ['2010/9/05 13:30:00Z'],
  ['2010/9/05 13:30:00'],
  ['2010/9/05 13:30'],
  ['2010/9/05 1:30:00 pm'],
  ['2010/9/05 1:30 pm'],

  ['2010/9/5 13:30:00Z'],
  ['2010/9/5 13:30:00'],
  ['2010/9/5 13:30'],
  ['2010/9/5 1:30:00 pm'],
  ['2010/9/5 1:30 pm'],

  ['2010/09/15T13:30:00Z'],
  ['2010/09/15T13:30:00'],


  ['2020-10-05'],
  ['2020-10-5'],
  ['2020-9-05'],
  ['2020-9-5'],

  ['2010-10-05 13:30:00Z'],
  ['2010-10-05 13:30:00'],
  ['2010-10-05 13:30'],
  ['2010-10-05 1:30:00 pm'],
  ['2010-10-05 1:30 pm'],

  ['2010-10-5 13:30:00Z'],
  ['2010-10-5 13:30:00'],
  ['2010-10-5 13:30'],
  ['2010-10-5 1:30:00 pm'],
  ['2010-10-5 1:30 pm'],

  ['2010-9-05 13:30:00Z'],
  ['2010-9-05 13:30:00'],
  ['2010-9-05 13:30'],
  ['2010-9-05 1:30:00 pm'],
  ['2010-9-05 1:30 pm'],

  ['2010-9-5 13:30:00Z'],
  ['2010-9-5 13:30:00'],
  ['2010-9-5 13:30'],
  ['2010-9-5 1:30:00 pm'],
  ['2010-9-5 1:30 pm'],

  ['2010-09-15T13:30:00Z'],
  ['2010-09-15T13:30:00'],

  ['2020.10.05'],
  ['2020.10.5'],
  ['2020.9.05'],
  ['2020.9.5'],

  ['2010.10.05 13:30:00Z'],
  ['2010.10.05 13:30:00'],
  ['2010.10.05 13:30'],
  ['2010.10.05 1:30:00 pm'],
  ['2010.10.05 1:30 pm'],

  ['2010.10.5 13:30:00Z'],
  ['2010.10.5 13:30:00'],
  ['2010.10.5 13:30'],
  ['2010.10.5 1:30:00 pm'],
  ['2010.10.5 1:30 pm'],

  ['2010.9.05 13:30:00Z'],
  ['2010.9.05 13:30:00'],
  ['2010.9.05 13:30'],
  ['2010.9.05 1:30:00 pm'],
  ['2010.9.05 1:30 pm'],

  ['2010.9.5 13:30:00Z'],
  ['2010.9.5 13:30:00'],
  ['2010.9.5 13:30'],
  ['2010.9.5 1:30:00 pm'],
  ['2010.9.5 1:30 pm'],

  ['2010.09.15T13:30:00Z'],
  ['2010.09.15T13:30:00'],

];

const usDateExamples = [
  ['05/13/2010'],
  ['5/13/2010'],

  ['05/19/2010 13:30:00'],
  ['05/19/2010 8:30:00'],
  ['05/19/2010 13:30'],
  ['05/19/2010 8:30'],
  ['05/19/2010 01:30:00 pm'],
  ['05/19/2010 1:30:00 pm'],
  ['05/19/2010 01:30 pm'],
  ['05/19/2010 1:30 pm'],

  ['5/19/2010 13:30:00'],
  ['5/19/2010 8:30:00'],
  ['5/19/2010 13:30'],
  ['5/19/2010 8:30'],
  ['5/19/2010 01:30:00 pm'],
  ['5/19/2010 1:30:00 pm'],
  ['5/19/2010 01:30 pm'],
  ['5/19/2010 1:30 pm'],

  ['05-19-2010'],
  ['5-19-2010'],

  ['05-19-2010 13:30:00'],
  ['05-19-2010 8:30:00'],
  ['05-19-2010 13:30'],
  ['05-19-2010 8:30'],
  ['05-19-2010 01:30:00 pm'],
  ['05-19-2010 1:30:00 pm'],
  ['05-19-2010 01:30 pm'],
  ['05-19-2010 1:30 pm'],

  ['5-19-2010 13:30:00'],
  ['5-19-2010 8:30:00'],
  ['5-19-2010 13:30'],
  ['5-19-2010 8:30'],
  ['5-19-2010 01:30:00 pm'],
  ['5-19-2010 1:30:00 pm'],
  ['5-19-2010 01:30 pm'],
  ['5-19-2010 1:30 pm'],

  ['05.19.2010'],
  ['5.19.2010'],

  ['05.19.2010 13:30:00'],
  ['05.19.2010 8:30:00'],
  ['05.19.2010 13:30'],
  ['05.19.2010 8:30'],
  ['05.19.2010 01:30:00 pm'],
  ['05.19.2010 1:30:00 pm'],
  ['05.19.2010 01:30 pm'],
  ['05.19.2010 1:30 pm'],

  ['5.19.2010 13:30:00'],
  ['5.19.2010 8:30:00'],
  ['5.19.2010 13:30'],
  ['5.19.2010 8:30'],
  ['5.19.2010 01:30:00 pm'],
  ['5.19.2010 1:30:00 pm'],
  ['5.19.2010 01:30 pm'],
  ['5.19.2010 1:30 pm'],
];

const internationalDateExamples = [

  ['05/10/2010'],
  ['5/10/2010'],
  ['15/9/2010'],

  ['15/09/2010 13:30:00'],
  ['15/09/2010 8:30:00'],
  ['15/09/2010 13:30'],
  ['15/09/2010 8:30'],
  ['15/09/2010 01:30:00 pm'],
  ['15/09/2010 1:30:00 pm'],
  ['15/09/2010 01:30 pm'],
  ['15/09/2010 1:30 pm'],

  ['5/09/2010 13:30:00'],
  ['5/09/2010 8:30:00'],
  ['5/09/2010 13:30'],
  ['5/09/2010 8:30'],
  ['5/09/2010 01:30:00 pm'],
  ['5/09/2010 1:30:00 pm'],
  ['5/09/2010 01:30 pm'],
  ['5/09/2010 1:30 pm'],

  ['15/9/2010 13:30:00'],
  ['15/9/2010 8:30:00'],
  ['15/9/2010 13:30'],
  ['15/9/2010 8:30'],
  ['15/9/2010 01:30:00 pm'],
  ['15/9/2010 1:30:00 pm'],
  ['15/9/2010 01:30 pm'],
  ['15/9/2010 1:30 pm'],

  ['5/9/2010 13:30:00'],
  ['5/9/2010 8:30:00'],
  ['5/9/2010 13:30'],
  ['5/9/2010 8:30'],
  ['5/9/2010 01:30:00 pm'],
  ['5/9/2010 1:30:00 pm'],
  ['5/9/2010 01:30 pm'],
  ['5/9/2010 1:30 pm'],

  ['15-10-2010'],
  ['5-10-2010'],
  ['15-9-2010'],
  ['5-9-2010'],


  ['15-09-2010 13:30:00'],
  ['15-09-2010 8:30:00'],
  ['15-09-2010 13:30'],
  ['15-09-2010 8:30'],
  ['15-09-2010 01:30:00 pm'],
  ['15-09-2010 1:30:00 pm'],
  ['15-09-2010 01:30 pm'],
  ['15-09-2010 1:30 pm'],

  ['5-09-2010 13:30:00'],
  ['5-09-2010 8:30:00'],
  ['5-09-2010 13:30'],
  ['5-09-2010 8:30'],
  ['5-09-2010 01:30:00 pm'],
  ['5-09-2010 1:30:00 pm'],
  ['5-09-2010 01:30 pm'],
  ['5-09-2010 1:30 pm'],

  ['15-9-2010 13:30:00'],
  ['15-9-2010 8:30:00'],
  ['15-9-2010 13:30'],
  ['15-9-2010 8:30'],
  ['15-9-2010 01:30:00 pm'],
  ['15-9-2010 1:30:00 pm'],
  ['15-9-2010 01:30 pm'],
  ['15-9-2010 1:30 pm'],

  ['5-9-2010 13:30:00'],
  ['5-9-2010 8:30:00'],
  ['5-9-2010 13:30'],
  ['5-9-2010 8:30'],
  ['5-9-2010 01:30:00 pm'],
  ['5-9-2010 1:30:00 pm'],
  ['5-9-2010 01:30 pm'],
  ['5-9-2010 1:30 pm'],

  ['15.10.2010'],
  ['5.10.2010'],
  ['15.9.2010'],
  ['5.9.2010'],

  ['15.09.2010 13:30:00'],
  ['15.09.2010 8:30:00'],
  ['15.09.2010 13:30'],
  ['15.09.2010 8:30'],
  ['15.09.2010 01:30:00 pm'],
  ['15.09.2010 1:30:00 pm'],
  ['15.09.2010 01:30 pm'],
  ['15.09.2010 1:30 pm'],

  ['5.09.2010 13:30:00'],
  ['5.09.2010 8:30:00'],
  ['5.09.2010 13:30'],
  ['5.09.2010 8:30'],
  ['5.09.2010 01:30:00 pm'],
  ['5.09.2010 1:30:00 pm'],
  ['5.09.2010 01:30 pm'],
  ['5.09.2010 1:30 pm'],

  ['15.9.2010 13:30:00'],
  ['15.9.2010 8:30:00'],
  ['15.9.2010 13:30'],
  ['15.9.2010 8:30'],
  ['15.9.2010 01:30:00 pm'],
  ['15.9.2010 1:30:00 pm'],
  ['15.9.2010 01:30 pm'],
  ['15.9.2010 1:30 pm'],

  ['5.9.2010 13:30:00'],
  ['5.9.2010 8:30:00'],
  ['5.9.2010 13:30'],
  ['5.9.2010 8:30'],
  ['5.9.2010 01:30:00 pm'],
  ['5.9.2010 1:30:00 pm'],
  ['5.9.2010 01:30 pm'],
  ['5.9.2010 1:30 pm']
];



describe('helpers', () => {
  describe('clone', () => {
    it('Shall clone object successfully', () => {
      const multipleLevelsObject = {
        a: 'a',
        b: {
          c: {
            d: 'e',
            f: 'g',
            h: {
              i: 'j',
            }
          },
        },
      };
      const clonedObject = clone(multipleLevelsObject);
      expect(clonedObject).toMatchObject(multipleLevelsObject);
      expect(multipleLevelsObject === clonedObject).toBe(false);
    });

    it('Make sure the cloned object is not using old references of old object', () => {
      const originObject = {
        subObj: {
          keyOne: 'Hello',
          keyTwo: 'World',
          keyThree: '!',
        },
        otherKeyOne: 'xxxx',
        otherKeyTwo: 'yyy',
      };
      const clonedObject = clone(originObject);
      clonedObject.subObj.keyOne = 'This is not Hello';
      expect(originObject.subObj.keyOne).toBe('Hello');
      expect(originObject === clonedObject).toBe(false);
    });

    it('If input value is not Object or Array', () => {
      expect(clone(null)).toBe(null);
    });

    it('Shall also be able to clone array', () => {
      // With array nested in array nested in array
      const arrayObj = [
        {
          a: 'b',
          c: 'd',
        },
        'hello',
        [
          'e',
          'f',
          'g',
          [
            'h',
            'i',
            'j',
          ],
        ],
      ];
      const clonedArray = clone(arrayObj);
      expect(clonedArray[2][3]).toMatchObject(['h', 'i', 'j']);
      expect(clonedArray[2][3] === arrayObj[2][3]).toBeFalsy();
      expect(clonedArray).toMatchObject(arrayObj);
    });

    it('If input value is null or undefined', () => {
      expect(clone(null)).toBeNull();
      expect(clone(undefined)).toBeUndefined();
    });

    it('If input value is not Object or Array', () => {
      expect(clone('String')).toBe('String');
      expect(clone(111)).toBe(111);
      expect(clone(true)).toBe(true);
    });
  });
  describe('hexToRGBA', () => {
    it('Convert hexadecimal color white to RGBA notation', () => {
      expect(hexToRGBA('#fff', 0.5)).toBe('rgba(255,255,255,0.5)');
    });

    it('Convert hexadecimal color red to RGBA notation', () => {
      expect(hexToRGBA('#f00', 0.75)).toBe('rgba(255,0,0,0.75)');
    });

    it('Convert random hexadecimal color to RGBA notation', () => {
      expect(hexToRGBA('#0AB31F', 0.93)).toBe('rgba(10,179,31,0.93)');
    });
  });

  describe('capitalizeFirstLetter', () => {
    it('Capitalize a lower-case word', () => {
      expect(capitalizeFirstLetter('test')).toBe('Test');
    });

    it('Word with all upper-cased letters should remain that way', () => {
      expect(capitalizeFirstLetter('TEST')).toBe('TEST');
    });

    it('Do not capitalize words beginning with numbers', () => {
      expect(capitalizeFirstLetter('123test')).toBe('123test');
    });

    it('Do not capitalize words beginning with non-alphabetical charactesr', () => {
      expect(capitalizeFirstLetter('-test')).toBe('-test');
    });
  });

  describe('isURL', () => {
    it('Check generic string isn\'t counted as a URL', () => {
      expect(isURL('googlecom')).toBe(false);
    });

    it('Test urls beginning with HTTP/HTTPS protocol as URLs', () => {
      expect(isURL('http://google.com')).toBe(true);
      expect(isURL('https://google.com')).toBe(true);
      expect(isURL('http://www.google.com')).toBe(true);
      expect(isURL('https://www.google.com')).toBe(true);
    });

    it('Urls must start with HTTP/HTTPS protocol', () => {
      expect(isURL('google.com')).toBe(false);
      expect(isURL('www.google.com')).toBe(false);
    });
  });

  describe('toSlug', () => {
    it('Convert conventional string to url-slug format', () => {
      expect(toSlug('test slug')).toBe('test-slug');
    });

    it('Strip non-alphanumeric characters that aren\'t dashes', () => {
      expect(toSlug('test slug (special char test)')).toBe('test-slug-special-char-test');
    });

    it('Normalize string with diacritics for url-slug format', () => {
      expect(toSlug('nicolas pépé')).toBe('nicolas-pepe');
    });
  });

  describe('convertToSnakeCase', () => {
    it('Convert conventional string to snake_case format', () => {
      expect(convertToSnakeCase('test string')).toBe('test_string');
    });

    it('Do nothing on strings that are already in snake_case', () => {
      expect(convertToSnakeCase('test_string')).toBe('test_string');
    });
  });

  describe('formatCurrency', () => {
    it('Convert number to currency format', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });
  });

  describe('formatInteger', () => {
    it('Format number such that comma\'s are placed in the appropriate places', () => {
      expect(formatInteger(12345678)).toBe('12,345,678');
    });
  });

  describe('filterObjectToQueryString', () => {
    it('Convert a filter Object to an encoded $filter expression', () => {
      expect(filterObjectToQueryString({
        expressions: [{
          key: 'name',
          value: 'blah',
          operator: '!=',
        }, {
          key: 'val',
          value: 123,
          operator: '>',
        }],
        logicalOperators: ['OR'],
      })).toBe('(name != \"blah\" OR val > 123)');
    });
  });

  describe('csvValidationCheck', () => {
    it('csv rows check with predefiend column mapping', () => {
      let emailMapping = { columnType: 'email', mappedTo: 0, required: true }
      // check both required or not-required
      let numberMapping = { columnType: 'number', mappedTo: 0 }
      let numberMapping1 = { columnType: 'number', mappedTo: 0, required: true}
      let datetimeMapping = { columnType: 'datetime', mappedTo: 0 }
      let datetimeMapping1 = { columnType: 'datetime', mappedTo: 0, required: true}
      let stringMapping = { columnType: 'string', mappedTo: 0 }
      let stringMapping1 = { columnType: 'string', mappedTo: 0, required: true }
      let stringMapping2 = { columnType: 'string', mappedTo: undefined, required: true }
      // mobile number
      let mobileMapping = { columnType: 'mobileNumber', mappedTo: 0}

      expect(csvValidationCheck(emailMapping, [['a@b.com'], ['']])).toBe('');
      expect(csvValidationCheck(emailMapping, [['1@2234'],])).toBe('1@2234');
      expect(csvValidationCheck(emailMapping, [['a@b.com'],])).toBeNull();

      // we have a lot predefined formats for datetime, we cannot test all
      expect(csvValidationCheck(datetimeMapping, [['2000/01/01/01']])).toBe('2000/01/01/01');
      expect(csvValidationCheck(datetimeMapping, [['01/01/2000'], ['']])).toBeNull();

      // Trying to read US dates with international selected (and visa versa) should cause
      // validation errors
      expect(internationalDateExamples.map( example => csvValidationCheck(datetimeMapping1, [example],
        false, 'us')).filter( item => item !== null)).toHaveLength(53)
      expect(usDateExamples.map( example => csvValidationCheck(datetimeMapping1, [example],
        false, 'international')).filter( item => item !== null)).toHaveLength(54)

      // Ensure that valid types are all working - we dont want false rejections
      expect(csvValidationCheck(datetimeMapping1, usDateExamples,
        false, 'us')).toBeNull()
      expect(csvValidationCheck(datetimeMapping1, commonDateExamples,
        false, 'us')).toBeNull()
      expect(csvValidationCheck(datetimeMapping1, internationalDateExamples,
        false, 'international')).toBeNull()
      expect(csvValidationCheck(datetimeMapping1, commonDateExamples,
        false, 'international')).toBeNull()

      // When no dateFormat is provided, then we should be passing Common, US and International
      expect(csvValidationCheck(datetimeMapping1, usDateExamples)).toBeNull()
      expect(csvValidationCheck(datetimeMapping1, internationalDateExamples)).toBeNull()
      expect(csvValidationCheck(datetimeMapping1, commonDateExamples)).toBeNull()

      // datetime required column
      expect(csvValidationCheck(datetimeMapping1, [['2000/01/01'], [''], ['01/01/2000']])).toBe('');
      expect(csvValidationCheck(datetimeMapping1, [['01/01/2000'], ['']])).toBe('');
      expect(csvValidationCheck(datetimeMapping1, [[''], ['01/01/2000'], ['2000/01/01']])).toBe('');
      // number check
      expect(csvValidationCheck(numberMapping, [['1'], ['2'], ['']])).toBeNull();
      expect(csvValidationCheck(numberMapping, [[''], ['1'], ['2'],])).toBeNull();
      expect(csvValidationCheck(numberMapping, [['1'], [''], ['2'],])).toBeNull();

      // if number column is required column will check
      expect(csvValidationCheck(numberMapping1, [['1'], ['']])).toBe('');
      expect(csvValidationCheck(numberMapping1, [[''], ['']])).toBe('');
      expect(csvValidationCheck(numberMapping1, [['1'], ['2'], ['']])).toBe('');
      expect(csvValidationCheck(numberMapping1, [[''], ['1'], ['']])).toBe('');
      // string check
      expect(csvValidationCheck(stringMapping, [['ab'], ['c'], ['']])).toBeNull();
      expect(csvValidationCheck(stringMapping, [[''], [''], ['']])).toBeNull();
      // string required column
      expect(csvValidationCheck(stringMapping1, [['ab'], ['c'], ['']])).toBe('');
      expect(csvValidationCheck(stringMapping1, [['ab'], [''], ['c']])).toBe('');
      expect(csvValidationCheck(stringMapping1, [[''], ['c'], ['ab']])).toBe('');
      expect(csvValidationCheck(stringMapping2, [['ab'], ['c'], ['']])).toBeNull();
      // mobile number check
      expect(csvValidationCheck(mobileMapping, [[''],])).toBeNull();
      expect(csvValidationCheck(mobileMapping, [['+123456'],])).toBeNull();
      expect(csvValidationCheck(mobileMapping, [['+123'],])).toBe('+123');
      // if we have blanks will further check with following
      expect(csvValidationCheck(mobileMapping, [['+123 456 789 10000 000'],])).toBe('+123 456 789 10000 000');
      expect(csvValidationCheck(mobileMapping, [['+123 456 789'],])).toBeNull();

    });
  });
});


describe('csvImportButtonColorUpdate', () => {
  it('csv rows if the required columns mapped, the import button will be purple', () => {
    let arToPromoterMap0 = [{ columnType: 'email', mappedTo: 0, required: true }];
    let arToPromoterMap1 = [{ columnType: 'email', mappedTo: null, required: true }];
    let arToPromoterMap2 = [{ columnType: 'email', mappedTo: null, required: true },
                            { columnType: 'email', mappedTo: 1, required: true }];
    let importTypeEvents = "events"
    let importTypeEvents1 = "orders"
    let selectedProvider = "A"
    let selectedCurrency = "AUD"
    expect(updatedImportBtnColor(arToPromoterMap0, importTypeEvents, selectedProvider, selectedCurrency)).toBe('purple');
    expect(updatedImportBtnColor(arToPromoterMap1, importTypeEvents, selectedProvider, selectedCurrency)).toBe('grey');
    expect(updatedImportBtnColor(arToPromoterMap2, importTypeEvents, selectedProvider, selectedCurrency)).toBe('grey');

    expect(updatedImportBtnColor(arToPromoterMap0, importTypeEvents1, selectedProvider, selectedCurrency)).toBe('purple');
    expect(updatedImportBtnColor(arToPromoterMap1, importTypeEvents1, selectedProvider, selectedCurrency)).toBe('grey');
    expect(updatedImportBtnColor(arToPromoterMap2, importTypeEvents1, selectedProvider, selectedCurrency)).toBe('grey');
    let selectedCurrency1 = null
    expect(updatedImportBtnColor(arToPromoterMap0, importTypeEvents1, selectedProvider, selectedCurrency1)).toBe('grey');
    expect(updatedImportBtnColor(arToPromoterMap1, importTypeEvents1, selectedProvider, selectedCurrency1)).toBe('grey');
    expect(updatedImportBtnColor(arToPromoterMap2, importTypeEvents1, selectedProvider, selectedCurrency1)).toBe('grey');
    let selectedProvider1 = null
    expect(updatedImportBtnColor(arToPromoterMap0, importTypeEvents1, selectedProvider1, selectedCurrency)).toBe('grey');
    expect(updatedImportBtnColor(arToPromoterMap1, importTypeEvents1, selectedProvider1, selectedCurrency)).toBe('grey');
    expect(updatedImportBtnColor(arToPromoterMap2, importTypeEvents1, selectedProvider1, selectedCurrency)).toBe('grey');
  });
});

describe('formatNumberWithCommas', () => {
  test('formats an integer correctly', () => {
    expect(formatNumberWithCommas(1234567)).toBe('1,234,567');
  });

  test('formats a float with two decimal places correctly', () => {
    expect(formatNumberWithCommas(1234567.89)).toBe('1,234,567.89');
  });

  test('formats a float with one decimal place correctly', () => {
    expect(formatNumberWithCommas(1234567.8)).toBe('1,234,567.8');
  });

  test('formats a float with trailing zeros in the decimal part correctly', () => {
    expect(formatNumberWithCommas(1234567.00)).toBe('1,234,567');
  });

  test('rounds a float with more than two decimal places correctly', () => {
    expect(formatNumberWithCommas(1234567.891)).toBe('1,234,567.89');
  });

  test('formats zero correctly', () => {
    expect(formatNumberWithCommas(0)).toBe('0');
  });

  test('formats negative numbers correctly', () => {
    expect(formatNumberWithCommas(-1234567.89)).toBe('-1,234,567.89');
  });
});

