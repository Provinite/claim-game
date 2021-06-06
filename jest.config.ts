import type { InitialOptionsTsJest } from "ts-jest/dist/types";

const config: InitialOptionsTsJest = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/test/global_hooks.ts"],
  reporters: [
    "default",
    ["jest-junit", { outputDirectory: "./reports/junit" }],
  ],
};

export default config;
