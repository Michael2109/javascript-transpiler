import {ParseResult} from "../../../src/lumina/parser/parser";

function assertSuccess<T>(parseResult: ParseResult<T>, expectedValue: T, expectedRemaining: string) {
    expect(parseResult.success).toBeTruthy()
    console.log(parseResult.value)
    expect(parseResult.value).toStrictEqual(expectedValue)
    expect(parseResult.remaining).toBe(expectedRemaining)
}

function assertFail<T>(parseResult: ParseResult<T>) {
    expect(parseResult.success).toBeFalsy()
}

export {assertSuccess, assertFail}