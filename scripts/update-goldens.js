#!/usr/bin/env node
/**
 * Re-baselines every golden file in test/cases/.
 *
 * Run after an intentional codegen change, then review the diff — that diff is
 * the codegen review.
 */
const {execSync} = require("child_process");

execSync("npx jest --testPathPattern=test/corpus/corpus", {
    stdio: "inherit",
    env: {...process.env, UPDATE_GOLDENS: "1"}
});
