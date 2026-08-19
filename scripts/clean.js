#!/usr/bin/env node
/**
 * Removes build output.
 *
 * tsc does not prune files whose sources have been deleted, so without this the
 * dist/ tree accumulates stale artifacts — and the `lumina` bin ships them.
 */
const fs = require("fs");
const path = require("path");

fs.rmSync(path.join(__dirname, "..", "dist"), {recursive: true, force: true});
