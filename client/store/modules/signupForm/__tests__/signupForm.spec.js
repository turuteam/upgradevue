import { convertRegistrationsObjectToArray } from "@/store/modules/signupForm/utils";

let mockFields = {
  "lastName": true,
  "messenger": true,
  "city": false,
  "postcode": false,
  "state": true,
  "firstName": true,
  "mobileNumber": true,
  "dob": false,
  "emailAddress": true,
  "country": false
}
let mockRequiredFields = {
  "lastName": true,
  "messenger": false,
  "city": false,
  "postcode": false,
  "state": false,
  "firstName": true,
  "mobileNumber": true,
  "dob": false,
  "emailAddress": true,
  "country": false
}

describe('Convert Signup Form Registration Settings', () => {
  it ('Signup form registrations should convert successfully', () => {
    const converted = convertRegistrationsObjectToArray(mockFields, mockRequiredFields);
    expect(converted).toEqual([
        {
          name: 'Email address',
          key: 'emailAddress',
          order: 1,
          predefined: true,
          optional: false,
          enabled: true,
          isMandatory: true
        },
        {
          name: 'First name',
          key: 'firstName',
          order: 2,
          predefined: true,
          optional: false,
          enabled: true,
          isMandatory: false
        },
        {
          name: 'Last name',
          key: 'lastName',
          order: 3,
          predefined: true,
          optional: false,
          enabled: true,
          isMandatory: false
        },
        {
          name: 'Mobile number',
          key: 'mobileNumber',
          order: 4,
          predefined: true,
          optional: false,
          enabled: true,
          isMandatory: false
        },
        {
          name: 'Date of birth',
          key: 'dob',
          order: 5,
          predefined: true,
          optional: false,
          enabled: false,
          isMandatory: false
        },
        {
          name: 'Country',
          key: 'country',
          order: 7,
          predefined: true,
          optional: false,
          enabled: false,
          isMandatory: false
        },
        {
          name: 'Postcode',
          key: 'postcode',
          order: 8,
          predefined: true,
          optional: false,
          enabled: false,
          isMandatory: false
        },
        {
          name: 'City',
          key: 'city',
          order: 9,
          predefined: true,
          optional: false,
          enabled: false,
          isMandatory: false
        },
        {
          name: 'State',
          key: 'state',
          order: 10,
          predefined: true,
          optional: true,
          enabled: true,
          isMandatory: false
        }
      ]
    )
  })
})
