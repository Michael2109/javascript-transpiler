import {ParseResult, ParseSuccess} from "../../../src/lumina/parser/parser";

function assertSuccess<T>(parseResult: ParseResult<T>, expectedValue: T, expectedRemaining: string) {
    expect(parseResult.success).toBeTruthy()

    const parseSuccess = parseResult as ParseSuccess<T>
    expect(parseSuccess.value).toStrictEqual(expectedValue)
    expect(parseSuccess.remaining).toBe(expectedRemaining)
}

function assertFail<T>(parseResult: ParseResult<T>) {
    expect(parseResult.success).toBeFalsy()
}

export {assertSuccess, assertFail}