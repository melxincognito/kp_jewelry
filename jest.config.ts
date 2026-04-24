import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^.+\\.(css|sass|scss)$": "<rootDir>/__mocks__/fileMock.js",
    "^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$": "<rootDir>/__mocks__/fileMock.js",
  },
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
  collectCoverageFrom: [
    "lib/**/*.ts",
    "components/**/*.tsx",
    "app/api/**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!app/generated/**",
  ],
  coverageThreshold: {
    global: {
      lines: 70,
    },
  },
};

export default createJestConfig(config);
