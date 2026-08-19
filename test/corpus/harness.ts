import fs from "fs";
import os from "os";
import path from "path";
import {spawnSync} from "child_process";
import js_beautify from "js-beautify";

import {describeFailure, parse, ParseFailure, ParseSuccess} from "../../src/lumina/parser/parser";
import {compilationUnit} from "../../src/lumina/compiler/parser/statement-parser";
import {AstToIr} from "../../src/lumina/compiler/asttoir/ast-to-ir";
import {CodeGenerator} from "../../src/lumina/compiler/codegen/statement-to-code";
import {DeclarationAst} from "../../src/lumina/compiler/ast/declaration-ast";

/**
 * Set UPDATE_GOLDENS=1 to rewrite every golden file in place. Review the resulting
 * diff — that diff is the codegen review.
 */
const UPDATE_GOLDENS: boolean = process.env.UPDATE_GOLDENS === "1"

/**
 * On CI a missing golden is a failure. Locally it is written on first run, so that
 * adding a case means adding a directory rather than writing test code.
 */
const IS_CI: boolean = process.env.CI !== undefined && process.env.CI !== ""

interface CompileResult {
    code?: string
    error?: string
}

/**
 * Compiles in-process rather than through the CLI, so codegen tests stay in the
 * millisecond range. The CLI itself is covered separately by cli.test.ts.
 */
function compile(source: string): CompileResult {

    try {
        const parseResult = parse(source, compilationUnit())

        if (!parseResult.success) {
            return {error: describeFailure(parseResult as ParseFailure<DeclarationAst.CompilationUnit>)}
        }

        const parseSuccess = parseResult as ParseSuccess<DeclarationAst.CompilationUnit>
        const code = CodeGenerator.compilationUnitToCode(AstToIr.compilationUnitToIr(parseSuccess.value))

        return {code: js_beautify.js_beautify(code)}
    } catch (error: any) {
        // Every stage can throw, including the parser's own AST construction.
        // Failures embed a JSON dump of the offending node, so keep the first
        // line only and goldens stay stable.
        return {error: String(error.message).split("\n")[0]}
    }
}

/**
 * Writes the generated JavaScript to a temporary directory and runs it under the
 * same node binary running the tests.
 */
function runJs(code: string): string {

    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "lumina-"))

    try {
        const file = path.join(directory, "main.js")
        fs.writeFileSync(file, code, "utf8")

        const result = spawnSync(process.execPath, [file], {encoding: "utf8"})

        if (result.error) {
            throw result.error
        }
        if (result.status !== 0) {
            throw new Error(`node exited with ${result.status}\n${result.stderr}`)
        }

        return result.stdout
    } finally {
        fs.rmSync(directory, {recursive: true, force: true})
    }
}

/**
 * Normalises line endings and trailing whitespace so goldens are stable across
 * platforms.
 */
function normalise(value: string): string {
    return value.replace(/\r\n/g, "\n").replace(/[ \t]+$/gm, "").trim()
}

/**
 * Compares against a golden file, creating or updating it when asked to.
 * Returns the expectation so callers can assert in the test body.
 */
function assertGolden(goldenPath: string, actual: string): void {

    const normalised = normalise(actual)

    if (UPDATE_GOLDENS || (!fs.existsSync(goldenPath) && !IS_CI)) {
        fs.writeFileSync(goldenPath, normalised + "\n", "utf8")
        return
    }

    if (!fs.existsSync(goldenPath)) {
        throw new Error(`Missing golden file: ${goldenPath}`)
    }

    expect(normalised).toBe(normalise(fs.readFileSync(goldenPath, "utf8")))
}

export {compile, runJs, normalise, assertGolden, CompileResult, UPDATE_GOLDENS}
