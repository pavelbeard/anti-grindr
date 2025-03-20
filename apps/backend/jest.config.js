/** @type {import('ts-jest').JestConfigWithTsJest} **/

export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^tests/(.*)$": "<rootDir>/tests/$1",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json",
      },
    ],
  },
  // setupFiles: [],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts", "<rootDir>/singleton.ts"],
};
