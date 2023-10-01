import {ParseResult, ParseSuccess} from "../../../../src/lumina/parser/parser";

function assertSuccess<T>(parseResult: ParseResult<T>, expectedValue: T, expectedPosition: number) {
    console.log(parseResult)
    expect(parseResult.success).toBeTruthy()

    const parseSuccess = parseResult as ParseSuccess<T>
    expect(parseSuccess.value).toStrictEqual(expectedValue)
    expect(parseSuccess.position).toStrictEqual(expectedPosition)
}

function assertFailure<T>(parseResult: ParseResult<T>, expectedPosition: number) {
    expect(parseResult.success).toBeFalsy()
    if(expectedPosition){
        expect(parseResult.position).toStrictEqual(expectedPosition)
    }
}

export {assertSuccess, assertFailure}