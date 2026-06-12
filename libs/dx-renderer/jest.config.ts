/* eslint-disable */
export default {
  displayName: 'dx-renderer',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/dx-renderer',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  moduleNameMapper: {
    '^remark$': '<rootDir>/src/test/mocks/remark.ts',
    '^remark-gfm$': '<rootDir>/src/test/mocks/remark-gfm.ts',
    '^remark-html$': '<rootDir>/src/test/mocks/remark-html.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$)'
  ],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    '<rootDir>/src/test/dx-snapshot-serializer.js',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
