import fs from "fs";
import path from "path";

import {assertGolden, compile, CompileResult, runJs} from "./harness";

/**
 * Corpus-driven compiler tests.
 *
 * Each directory under test/cases/ is one case:
 *
 *   input.lumina     the source to compile                       (required)
 *   expected.js      exact generated JavaScript                   (L3 golden)
 *   expected.out     stdout after running the generated code      (L4 golden)
 *   expected.error   compiler error, for cases that must not compile
 *
 * A case with expected.error is expected to fail compilation and is not executed.
 * Every other case is expected to compile and run.
 *
 * To add a case: create a directory with input.lumina and run the suite. Missing
 * goldens are written on first run (except on CI) — review them before committing.
 * To re-baseline everything after an intentional codegen change: npm run test:update
 */

const CASES_DIRECTORY = path.join(__dirname, "..", "cases")

function discoverCases(): string[] {
    if (!fs.existsSync(CASES_DIRECTORY)) {
        return []
    }
    return fs.readdirSync(CASES_DIRECTORY)
        .filter(entry => fs.statSync(path.join(CASES_DIRECTORY, entry)).isDirectory())
        .filter(entry => fs.existsSync(path.join(CASES_DIRECTORY, entry, "input.lumina")))
        .sort()
}

const cases = discoverCases()

test("the corpus is not empty", () => {
    expect(cases.length).toBeGreaterThan(0)
})

describe.each(cases)("%s", (name: string) => {

    const directory = path.join(CASES_DIRECTORY, name)
    const source = fs.readFileSync(path.join(directory, "input.lumina"), "utf8")
    const errorGolden = path.join(directory, "expected.error")

    if (fs.existsSync(errorGolden)) {

        test("fails to compile with the expected error", () => {
            const result = compile(source)

            expect(result.code).toBeUndefined()
            expect(result.error).toBeDefined()

            assertGolden(errorGolden, result.error!)
        })

        return
    }

    // Compiled inside the suite rather than at collection time, so a compiler
    // crash surfaces as a failing case instead of taking down the whole run.
    let result: CompileResult

    beforeAll(() => {
        result = compile(source)
    })

    test("compiles", () => {
        expect(result.error).toBeUndefined()
        expect(result.code).toBeDefined()
    })

    test("generates the expected JavaScript", () => {
        expect(result.error).toBeUndefined()
        assertGolden(path.join(directory, "expected.js"), result.code!)
    })

    test("produces the expected output when run", () => {
        expect(result.error).toBeUndefined()
        assertGolden(path.join(directory, "expected.out"), runJs(result.code!))
    })
})
