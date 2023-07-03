module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json', 'vue', 'svg'],
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^.+\\.(jpg|jpeg)$': 'jest-static-stubs/jpg',
    '^.+/(.*\\.svg)': "jest-transform-stub",
    '^.+\\.(png)$': 'jest-static-stubs/png',
    '@/(.*)': '<rootDir>/client/$1',
    '~/(.*)': '<rootDir>/client/$1',
  },
  transform: {
    '^.+\\.js$': '<rootDir>/node_modules/babel-jest',
    "^.+\\.ts?$": "<rootDir>/node_modules/ts-jest",
    '.*\\.(vue)$': '<rootDir>/node_modules/vue-jest',
    ".+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-stub"
  },
  setupFiles: [
    './client/tests/setup.js',
  ],
  snapshotSerializers: ['<rootDir>/node_modules/jest-serializer-vue'],
  transformIgnorePatterns: [
    "node_modules/(?!(babel-jest|jest-vue-preprocessor|arep-ui)/)",
  ],
  reporters: [
    "default",
    ["jest-html-reporters", {
      "publicPath": "./html-report",
      "filename": "report.html",
      "openReport": false
    }]
  ],
  coveragePathIgnorePatterns: ['types.ts'],
  modulePathIgnorePatterns: [
    ".*__mocks__.*"
  ]
};
