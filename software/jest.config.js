module.exports = {
  moduleFileExtensions: ['js', 'ts', 'tsx'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  testMatch: ['**/*.spec.{ts,tsx}'],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1',
  },
};
