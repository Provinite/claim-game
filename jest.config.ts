import type { InitialOptionsTsJest } from "ts-jest/dist/types";

const config: InitialOptionsTsJest = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/test/global_hooks.ts"],
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "./reports/junit" }],
  ],
  coverageDirectory: "./coverage",
  collectCoverage: true,
  coverageProvider: "v8",
};

export default config;
