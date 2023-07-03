import * as utils from '../utils'
import {
  generateSegmentConditionExpression,
  segmentsAreMeaningfullyDifferent
} from "../utils";


const testConditions = [
  {
    expectedResult: 'First name contains Test',
    condition: {
      "data":{
        "condition":"contains",
        "value":"Test"
      },
      "name":"firstName",
      "type":"text"},
    criteria: {
      "type": "text",
      "title": "First name",
      "data":
        {
          "predicates":
            [
              {
                "title": "contains",
                "value": "contains"
              },
              {
                "title": "does not contain exactly",
                "value": "not_contains_exactly"
              },
              {
                "title": "starts with",
                "value": "starts_with"
              },
              {
                "title": "is known",
                "value": "is_known"
              },
              {
                "title": "is unknown",
                "value": "is_unknown"
              }
            ]
        },
      "resource": "firstName"
    }
  },


  {
    expectedResult: 'Age is older than',
    condition: {
      "data":{
        "condition":"is_more_than",
        "value":18
      },
      "name":"age",
      "type":"numeric"},
    criteria: {
      "type": "numeric",
      "title": "Age",
      "data":
        {
          "predicates":
            [
              {
                "title": "is between",
                "value": "is_between"
              },
              {
                "title": "is older than",
                "value": "is_more_than"
              },
              {
                "title": "is younger than",
                "value": "is_less_than"
              },
              {
                "title": "is exactly",
                "value": "is_equal_to"
              },
              {
                "title": "is known",
                "value": "is_known"
              },
              {
                "title": "is unknown",
                "value": "is_unknown"
              }
            ]
        },
      "resource": "age"
    }
  },



  {
    expectedResult: 'Date of birth is between 2023-05-01 and 2023-05-31',
    condition: {
      "data":{
        "condition":"is_between",
        "values":[
          "2023-05-01",
          "2023-05-31"
        ]},
      "name":"dob",
      "type":"date"},
    criteria: {
      "type": "date",
      "title": "Date of birth",
      "data":
        {
          "predicates":
            [
              {
                "title": "is equal to",
                "value": "is_equal_to"
              },
              {
                "title": "is after",
                "value": "is_after"
              },
              {
                "title": "is before",
                "value": "is_before"
              },
              {
                "title": "is between",
                "value": "is_between"
              },
              {
                "title": "is known",
                "value": "is_known"
              },
              {
                "title": "is unknown",
                "value": "is_unknown"
              }
            ]
        },
      "resource": "dob"
    }
  },



  {
    expectedResult: 'Gender is is known',
    condition: {
      "data":"is_known",
      "name":"gender",
      "type":"select"
    },
    criteria: {
      "type": "select",
      "title": "Gender",
      "data":
        [
          {
            "title": "is male",
            "value": "male"
          },
          {
            "title": "is female",
            "value": "female"
          },
          {
            "title": "is other",
            "value": "other"
          },
          {
            "title": "is known",
            "value": "is_known"
          },
          {
            "title": "is unknown",
            "value": "is_unknown"
          }
        ],
      "resource": "gender"
    },
  },



  {
    expectedResult: "Tags \"Test item 1\" and \"Test item 2\" assigned to all",
    condition: {
      "data":
        {
          "condition":"true_to_all",
          "values":[1,2]
        },
      "name":"tags",
      "type":"condition-search-picker"
    },
    criteria: {
      "type": "condition-search-picker",
      "title": "Tag",
      "data":
        {
          "predicates":
            [
              {
                "title": "assigned to all",
                "value": "true_to_all"
              },
              {
                "title": "assigned to any",
                "value": "true_to_any"
              },
              {
                "title": "not assigned to all",
                "value": "false_to_all"
              },
              {
                "title": "not assigned to any",
                "value": "false_to_any"
              }
            ]
        },
      "resource": "tags"
    },
  },



  {
    expectedResult: 'Tag contains Testing',
    condition: {
      "data":{
        "condition":"contains",
        "value":"Testing"
      },
      "name":"tagWithName",
      "type":"text-picker"},
    criteria: {
      "type": "text-picker",
      "title": "Tag contains",
      "targetResource": "tag",
      "targetColumn": "name",
      "data":
        {
          "predicates":
            [
              {
                "title": "contains",
                "value": "contains"
              },
              {
                "title": "starts with",
                "value": "starts_with"
              }
            ]
        },
      "resource": "tagWithName"
    },
  },



  {
    expectedResult: 'Spend on tickets is less than 100',
    condition: {
      "data":{
        "condition":"is_less_than",
        "values":[10000]
      },
      "name":"totalTicketSales",
      "type":"currency"},
    criteria: {
      "type": "currency",
      "title": "Spend on tickets",
      "data":
        {
          "predicates":
            [
              {
                "title": "is between",
                "value": "is_between"
              },
              {
                "title": "is more than",
                "value": "is_more_than"
              },
              {
                "title": "is less than",
                "value": "is_less_than"
              },
              {
                "title": "is exactly",
                "value": "is_equal_to"
              },
              {
                "title": "is known",
                "value": "is_known"
              },
              {
                "title": "is unknown",
                "value": "is_unknown"
              }
            ]
        },
      "resource": "totalTicketSales"
    },
  },
]



describe('generateSegmentConditionExpression', () => {
  testConditions.forEach( testCondition => {
    it(`generateSegmentTextConditionExpression for ${testCondition.criteria.type} generates correct expression`, () => {
      const chosenItemsMap = {
        campaigns: {},
        events: {},
        tags: {},
        pages: {}
      }
      const resource = testCondition.criteria.resource;
      if (Object.keys(chosenItemsMap).indexOf(resource) > -1) {
        testCondition.condition.data.values.forEach( value => {
          chosenItemsMap[resource][value] = {
            "sysCtime": "2022-01-27T23:29:18Z",
            "sysMtime": "2022-01-27T23:29:36Z",
            "name": `Test item ${value}`,
            "sysActivep": true,
            "oid": value,
            "promoterOid": 196,
            "safeName": `Test item ${value}`
          }
        })
      }
      const expression = generateSegmentConditionExpression(
        testCondition.condition,
        testCondition.criteria,
        chosenItemsMap
      )
      expect(expression).toBe(testCondition.expectedResult);
    })
  })
})




const segmentDifferenceTests = {
  isMeaningfullyDifferent: [
    {"sysCtime":"2019-11-04T01:34:24Z","meta":{},"sysMtime":"2019-11-04T01:34:24Z","name":"","favourite":false,"filter":{"conditions":[],"logic":[]},"oid":14578,"userDefined":true},
    {"sysCtime":"2019-11-04T01:34:24Z","meta":{},"sysMtime":"2019-11-04T01:34:24Z","name":"","favourite":false,"filter":{"conditions":[{"data":{"condition":"false_to_any","values":[2146]},"name":"tags","type":"condition-search-picker"}],"logic":[]},"oid":14578,"userDefined":true}
  ],
  isNotMeaningfullyDifferent: [
    {"sysCtime":"2019-11-04T01:34:24Z","meta":{},"sysMtime":"2019-11-04T01:35:24Z","name":"","favourite":false,"filter":{"conditions":[],"logic":[]},"oid":14578,"userDefined":true},
    {"sysCtime":"2019-11-04T01:34:24Z","meta":{},"sysMtime":"2019-11-04T01:34:24Z","name":"","favourite":false,"filter":{"conditions":[],"logic":[]},"oid":14578,"userDefined":true},
  ],
  isIdentical: [
    {"sysCtime":"2019-11-04T01:34:24Z","meta":{},"sysMtime":"2019-11-04T01:35:24Z","name":"","favourite":false,"filter":{"conditions":[],"logic":[]},"oid":14578,"userDefined":true},
  ]
}




describe('segmentsAreMeaningfullyDifferent', () => {
  it('Correctly identifies segments which are meaningfully different', () => {
    // @ts-ignore
    const meaningfullyDifferent = segmentsAreMeaningfullyDifferent(segmentDifferenceTests.isMeaningfullyDifferent[0], segmentDifferenceTests.isMeaningfullyDifferent[1])
    expect(meaningfullyDifferent).toBe(true)
  })
  it('Correctly identifies segments which are not meaningfully different', () => {
    const meaningfullyDifferent = segmentsAreMeaningfullyDifferent(segmentDifferenceTests.isNotMeaningfullyDifferent[0], segmentDifferenceTests.isNotMeaningfullyDifferent[1])
    expect(meaningfullyDifferent).toBe(false)
  })
  it('Correctly identifies segments which are identical', () => {
    const meaningfullyDifferent = segmentsAreMeaningfullyDifferent(segmentDifferenceTests.isIdentical[0], segmentDifferenceTests.isIdentical[0])
    expect(meaningfullyDifferent).toBe(false)
  })
  it('Returns false is segments do not contain a filter', () => {
    const shouldBeFalse = segmentsAreMeaningfullyDifferent({}, {});
    expect(shouldBeFalse).toBe(false)
  })
})
