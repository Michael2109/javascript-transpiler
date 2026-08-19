import fs from "fs";
import os from "os";
import path from "path";
import {spawnSync} from "child_process";

import {normalise} from "./harness";

/**
 * Smoke test for the command line entry point.
 *
 * The corpus tests compile in-process, so nothing else covers argument parsing,
 * source-tree discovery or output paths. This runs the built compiler directly
 * rather than installing it globally — no `npm install -g`, no sudo on CI.
 *
 * Requires a build: npm run test:cli
 */

const PROJECT_ROOT = path.join(__dirname, "..", "..")
const APP = path.join(PROJECT_ROOT, "dist", "app.js")

describe("command line interface", () => {

    let target: string

    beforeAll(() => {
        if (!fs.existsSync(APP)) {
            throw new Error(`${APP} not found — run "npm run build" first`)
        }
        target = fs.mkdtempSync(path.join(os.tmpdir(), "lumina-cli-"))
    })

    afterAll(() => {
        if (target) {
            fs.rmSync(target, {recursive: true, force: true})
        }
    })

    test("compiles a source tree and writes runnable JavaScript", () => {

        const source = path.join("test", "cases", "arithmetic")

        const compileResult = spawnSync(
            process.execPath,
            [APP, "--source", source, "--target", target],
            {encoding: "utf8", cwd: PROJECT_ROOT}
        )

        expect(compileResult.error).toBeUndefined()
        expect(compileResult.status).toBe(0)

        const output = path.join(target, "input.js")
        expect(fs.existsSync(output)).toBe(true)

        const runResult = spawnSync(process.execPath, [output], {encoding: "utf8"})

        expect(runResult.status).toBe(0)
        expect(normalise(runResult.stdout)).toBe(normalise("1\n3\n-1\n2\n50\n6"))
    })

    test("fails with a non-zero exit code on a syntax error", () => {

        const source = path.join("test", "cases", "syntax-error")

        const compileResult = spawnSync(
            process.execPath,
            [APP, "--source", source, "--target", target],
            {encoding: "utf8", cwd: PROJECT_ROOT}
        )

        expect(compileResult.status).not.toBe(0)
    })
})
