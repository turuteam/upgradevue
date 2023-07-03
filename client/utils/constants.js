export const TIMES = [
  '12:00am',
  '12:30am',
  '1:00am',
  '1:30am',
  '2:00am',
  '2:30am',
  '3:00am',
  '3:30am',
  '4:00am',
  '4:30am',
  '5:00am',
  '5:30am',
  '6:00am',
  '6:30am',
  '7:00am',
  '7:30am',
  '8:00am',
  '8:30am',
  '9:00am',
  '9:30am',
  '10:00am',
  '10:30am',
  '11:00am',
  '11:30am',
  '12:00pm',
  '12:30pm',
  '1:00pm',
  '1:30pm',
  '2:00pm',
  '2:30pm',
  '3:00pm',
  '3:30pm',
  '4:00pm',
  '4:30pm',
  '5:00pm',
  '5:30pm',
  '6:00pm',
  '6:30pm',
  '7:00pm',
  '7:30pm',
  '8:00pm',
  '8:30pm',
  '9:00pm',
  '9:30pm',
  '10:00pm',
  '10:30pm',
  '11:00pm',
  '11:30pm',
];

export const CURRENCY_CODES = [
  {
    symbol: '$',
    name: 'US Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'USD',
    name_plural: 'US dollars',
    minimum: 0.5,
  },
  {
    symbol: 'AU$',
    name: 'Australian Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'AUD',
    name_plural: 'Australian dollars',
    minimum: 0.5,
  },
  {
    symbol: '£',
    name: 'British Pound Sterling',
    symbol_native: '£',
    decimal_digits: 2,
    rounding: 0,
    code: 'GBP',
    name_plural: 'British pounds sterling',
    minimum: 0.3,
  },
  {
    symbol: 'NZ$',
    name: 'New Zealand Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'NZD',
    name_plural: 'New Zealand dollars',
    minimum: 0.5,
  },
  {
    symbol: '€',
    name: 'Euro',
    symbol_native: '€',
    decimal_digits: 2,
    rounding: 0,
    code: 'EUR',
    name_plural: 'euros',
    minimum: 0.5,
  },
  {
    symbol: '¥',
    name: 'Japanese Yen',
    symbol_native: '￥',
    decimal_digits: 0,
    rounding: 0,
    code: 'JPY',
    name_plural: 'Japanese yen',
    minimum: 50,
  },
  {
    symbol: 'CHF',
    name: 'Swiss Franc',
    symbol_native: 'CHF',
    decimal_digits: 2,
    rounding: 0.05,
    code: 'CHF',
    name_plural: 'Swiss francs',
    minimum: 0.5,
  },
  {
    symbol: 'HK$',
    name: 'Hong Kong Dollar',
    symbol_native: '$',
    decimal_digits: 2,
    rounding: 0,
    code: 'HKD',
    name_plural: 'Hong Kong dollars',
    minimum: 1,
  }
];

export const companyCategoryTypes = () => [
  {
    name: 'Artist Manager',
    key: 'artistManager'
  },
  {
    name: 'Beer/Food/Wine/Winery Festivals',
    key: 'beerWineFestival'
  },
  {
    name: 'Concert Promoter',
    key: 'concertPromoter'
  },
  {
    name: 'Music Festivals',
    key: 'musicFestival'
  },
  {
    name: 'Sports Club/Team',
    key: 'sportsTeam'
  },
  {
    name: 'Venues',
    key: 'venue'
  },
  {
    name: 'Other',
    key: 'other'
  },
]


// RK: This is and all subsequent *CSVMap are functions
// because if I parse it as a variable, it
// injects them by reference.
export const initialEventsCSVMap = () => [
  {
    value: 'Event name',
    required: true,
    serverHeaderName: 'name',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  {
    value: 'Start Date & Time',
    serverHeaderName: 'startDate',
    mappedTo: null,
    required: true,
    columnType: 'datetime',
    hint: 'Recommended format DD/MM/YYYY HH:mm:ss',
  },
  {
    value: 'Timezone',
    required: true,
    mappedTo: undefined,
    hint: "Applies to all events within this CSV import",
    columnType: 'string'
  },
  {
    value: 'End Date & Time',
    serverHeaderName: 'endDate',
    mappedTo: null,
    columnType: 'datetime',
    hint: 'Recommended format DD/MM/YYYY HH:mm:ss',
  },
  { value: 'Date Format', required: false, mappedTo: undefined, hint: 'Month-first (US) or day-first (International)', columnType: 'string' },
  {
    value: 'Event Description',
    serverHeaderName: 'description',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  {
    value: 'Venue',
    required: true,
    serverHeaderName: 'location',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  {
    value: 'Total ticket allocation quantity',
    serverHeaderName: 'capacity',
    mappedTo: null,
    columnType: 'number',
    hint: null,
  },
  {
    value: 'Event Image URL',
    serverHeaderName: 'imageUrl',
    mappedTo: null,
    columnType: 'string',
    hint: 'Must be a valid URL',
  },
  {
    value: 'Event ID',
    required: true,
    serverHeaderName: 'eventId',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  {
    value: 'Event URL',
    serverHeaderName: 'eventUrl',
    mappedTo: null,
    columnType: 'string',
    hint: 'Must be a valid URL',
  },
];

export const initialAudienceCSVMap = () => [
  {
    value: 'Email',
    required: true,
    serverHeaderName: 'emailAddress',
    mappedTo: null,
    columnType: 'email',
    hint: 'Emails must be in the format example@provider.com',
  },
  {
    value: 'First Name',
    serverHeaderName: 'firstName',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  {
    value: 'Last Name',
    serverHeaderName: 'lastName',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  { value: 'Street Address', serverHeaderName: 'streetAddress', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'Suburb', serverHeaderName: 'city', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'State', serverHeaderName: 'state', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'Country', serverHeaderName: 'country', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'Zip/post code', serverHeaderName: 'postcode', mappedTo: null, hint: null, columnType: 'string' },
  {
    value: 'Mobile',
    serverHeaderName: 'mobileNumber',
    mappedTo: null,
    columnType: 'mobileNumber',
    hint: 'Mobile numbers must include a country code and be between 1 and 14 digits. Recommended format +1555012345',
  },
  {
    value: 'Gender',
    serverHeaderName: 'gender',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  {
    value: 'Date of Birth',
    serverHeaderName: 'dob',
    mappedTo: null,
    columnType: 'datetime',
    hint: 'Recommended format DD/MM/YYYY',
  },
  { value: 'Date Format', required: false, mappedTo: undefined, hint: 'Month-first (US) or day-first (International)', columnType: 'string' },
  { value: 'Ticket Type', serverHeaderName: 'ticketClass', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'Total Paid', required: true, serverHeaderName: 'totalRevenue', mappedTo: null, columnType: 'number', hint: 'Numbers and decimals only' },
  { value: 'Currency', required: true, mappedTo: undefined, hint: null, columnType: 'string' },
  {
    value: 'Quantity of Tickets',
    required: true,
    serverHeaderName: 'totalTickets',
    columnType: 'number',
    mappedTo: null,
    hint: null,
  },
  {
    value: 'Order Created Datetime',
    serverHeaderName: 'orderDate',
    mappedTo: null,
    columnType: 'datetime',
    hint: 'Recommended format DD/MM/YYYY HH:mm:ss',
  },
  { value: 'Timezone', required: true, mappedTo: undefined, hint: null, columnType: 'string' },
  { value: 'Order ID', required: true, serverHeaderName: 'orderId', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'Discount Code Used', serverHeaderName: 'couponCode', mappedTo: null, hint: null, columnType: 'string' },
];

export const initialContactsCSVMap = () => [
  {
    name: 'Email',
    required: true,
    serverHeaderName: 'emailAddress',
    mappedTo: null,
    columnType: 'email',
    hint: 'Emails must be in the format example@provider.com',
  },
  {
    name: 'First Name',
    serverHeaderName: 'firstName',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  {
    name: 'Last Name',
    serverHeaderName: 'lastName',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  {
    name: 'Gender',
    serverHeaderName: 'gender',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  { name: 'Street Address', serverHeaderName: 'streetAddress', mappedTo: null, hint: null, columnType: 'string' },
  { name: 'City', serverHeaderName: 'city', mappedTo: null, hint: null, columnType: 'string' },
  { name: 'State', serverHeaderName: 'state', mappedTo: null, hint: null, columnType: 'string' },
  { name: 'Country', serverHeaderName: 'country', mappedTo: null, hint: null, columnType: 'string' },
  { name: 'Zip/post code', serverHeaderName: 'postcode', mappedTo: null, hint: null, columnType: 'string' },
  {
    name: 'Date of Birth',
    serverHeaderName: 'dob',
    mappedTo: null,
    columnType: 'datetime',
    hint: 'Recommended format DD/MM/YYYY',
  },
  { name: 'Date Format', required: false, mappedTo: undefined, hint: 'Month-first (US) or day-first (International)', columnType: 'string' },
  {
    name: 'Phone Number',
    serverHeaderName: 'mobileNumber',
    mappedTo: null,
    columnType: 'mobileNumber',
    hint: 'Phone numbers must include a country code and be between 1 and 14 digits. Recommended format +1555012345',
  },
  {
    name: 'Tag',
    serverHeaderName: 'tag',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  }
];


export const defaultTicketingProviders = () => [
  {
    key: 'default-ticketek',
    name: 'Ticketek',
    value: 'default-ticketek',
    defaultProvider: true,
    meta: {
      columnMap: {},
    },
    customMappings: [
      {
        value: 'Show ID',
        mappedTo: null,
        relatesTo: 'events',
        serverHeaderName: 'showId',
        required: true,
        error: null,
        enabledFor: ['events', 'events and orders'],
        hint: "Ticketek events must include a Show ID",
        columnType: 'string'
      },
    ]
  }
];

export const initialPosCSVMap = () => [
  {
    value: 'POS line item ID',
    required: true,
    serverHeaderName: 'lineItemId',
    mappedTo: null,
    columnType: 'string',
    hint: "The unique ID of each row. Rows cannot have the same line item ID",
  },
  // Order part
  {
    value: 'Order Created Datetime',
    serverHeaderName: 'orderDate',
    mappedTo: null,
    columnType: 'datetime',
    hint: 'Recommended format DD/MM/YYYY HH:mm:ss',
  },
  { value: 'Date Format', required: false, mappedTo: undefined, hint: 'Month-first (US) or day-first (International)', columnType: 'string' },
  {
    value: 'Timezone',
    required: true,
    mappedTo: undefined,
    hint: "Applies to all events within this CSV import",
    columnType: 'string'
  },
  {
    value: 'Order ID',
    required: true,
    serverHeaderName: 'orderId',
    mappedTo: null,
    columnType: 'string',
    hint: "The ID of the whole order. Rows can have the same order ID",
  },

  // product part
  {
    value: 'Product ID',
    required: true,
    serverHeaderName: 'productId',
    mappedTo: null,
    columnType: 'string',
    hint: 'The ID of the product type',
  },

  {
    value: 'Product Name/Title',
    required: true,
    serverHeaderName: 'product',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },

  {
    value: 'Quantity of items',
    required: true,
    serverHeaderName: 'quantity',
    columnType: 'string',
    mappedTo: null,
    hint: null,
  },

  { value: 'Total Paid', required: true, serverHeaderName: 'totalPaid', mappedTo: null, columnType: 'string', hint: 'Numbers and decimals only' },
   //currency mapped to undefined in order select from drondown not in column mapping
  {
    value: 'Currency',
    required: true,
    mappedTo: undefined,
    hint: null,
    columnType: 'string' },

  // order discount part
  { value: 'Discount Code Used', serverHeaderName: 'discountCode', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'Discount Percent',  serverHeaderName: 'percent', mappedTo: null, columnType: 'string', hint: 'Numbers and decimals only' },
];

export const initialPosAudienceCSVMap = () => [
  {
    value: 'Email',
    required: true,
    serverHeaderName: 'emailAddress',
    mappedTo: null,
    columnType: 'email',
    hint: 'Emails must be in the format example@provider.com',
  },
  {
    value: 'First Name',
    serverHeaderName: 'firstName',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  {
    value: 'Last Name',
    serverHeaderName: 'lastName',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  { value: 'Street Address', serverHeaderName: 'streetAddress', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'City/Suburb', serverHeaderName: 'city', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'State', serverHeaderName: 'state', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'Country', serverHeaderName: 'country', mappedTo: null, hint: null, columnType: 'string' },
  { value: 'Zip/post code', serverHeaderName: 'postcode', mappedTo: null, hint: null, columnType: 'string' },
  {
    value: 'Mobile',
    serverHeaderName: 'mobileNumber',
    mappedTo: null,
    columnType: 'mobileNumber',
    hint: 'Mobile numbers must include a country code and be between 1 and 14 digits. Recommended format +1555012345',
  },
  {
    value: 'Gender',
    serverHeaderName: 'gender',
    mappedTo: null,
    columnType: 'string',
    hint: null,
  },
  {
    value: 'Date of Birth',
    serverHeaderName: 'dob',
    mappedTo: null,
    columnType: 'datetime',
    hint: 'Recommended format DD/MM/YYYY',
  },
  { value: 'Date Format', required: false, mappedTo: undefined, hint: 'Month-first (US) or day-first (International)', columnType: 'string' },
];

// default product provider shopify. Add more if needed
export const defaultProductProviders = () => [
  {
    key: 'default-product',
    name: 'Shopify',
    value: 'Shopify',
    defaultProvider: true,
    meta: {
      columnMap: {},
    },
  }
];

// protected csv assetType for s3 upload, mapping from import-type to the assetType
export const csvAssetType = {
  "audience-contact": "import-audience-contact",
  "audience-sales": "import-audience-sales",
  "audience": "import-audience",
  "event": "import-event",
  "event-and-audience": "import-event-and-audience",
  "product-order": "import-product-order",
}

export const AR_SHORT_URL_PATTERN = `${process.env.arShortUrlDomain}/XXXXXX`;
export const AR_DEV1_SHORT_URL_PATTERN = `https://dev1.arep.co/XXXXXX`;
export const AR_STAGING_SHORT_URL_PATTERN = `https://staging.arep.co/XXXXXX`;
export const AR_PROD_SHORT_URL_PATTERN = `https://arep.cc/XXXXXX`;


export const MAX_CHARACTERS_SMS_MESSAGE = 1550;
export const MAX_CHARACTERS_FACEBOOK_MESSAGE = 2000;
