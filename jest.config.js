/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globalSetup: "./test/setup.ts",
  // dist/ holds build output, some of it stale; collecting it as tests picks up
  // compiled artifacts whose sources no longer exist.
  testPathIgnorePatterns: ["/node_modules/", "/dist/", "/coverage/"],
};
