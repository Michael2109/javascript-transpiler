import {
    capture,
    charIn,
    charsWhileIn,
    cut,
    digit,
    either, eitherMany,
    end,
    label,
    opt,
    P,
    parse,
    ParseFailure,
    ParseResult,
    quiet,
    rep,
    seq,
    spaces,
    str
} from "../../../../src/lumina/parser/parser";
import {assertFailure, assertSuccess} from "./parser-test-utils";

import {Optional} from "../../../../src/lumina/parser/optional";
import {InputStream} from "../../../../src/lumina/parser/input-stream";

beforeAll(() => {
    global.console = require('console')
})

test('Digit', () => {
    assertSuccess(parse("123", digit()), 123, 3)
    assertFailure(parse("abc", digit()), 0)
});

test('Strings', () => {
    assertSuccess(parse("input123", str('input')), undefined, 5)
    assertFailure(parse("other", str('input')), 0)
});

test('Capture', () => {
    assertSuccess(parse("capturethis", capture(str('capture'))), "capture", 7)
    assertFailure(parse("other", capture(str('input'))), 0)
});

test('Repeat', () => {

    assertSuccess(parse("test,test,test", rep(capture(str("test")), {sep: str(",")})), ["test", "test", "test"], 14)
    assertSuccess(parse("12test34test56test", rep(seq(digit(), capture(str("test"))))), [[12, "test"], [34, "test"], [56, "test"]], 18)
    assertSuccess(parse("12test,34test,56test", rep(seq(digit(), capture(str("test"))), {sep: str(",")})), [[12, "test"], [34, "test"], [56, "test"]], 20)

    // Minimum
    assertFailure(parse("test,test,test", rep(capture(str("test1")), {sep: str(","), min: 1})), 0)
});


test('Either', () => {

    assertSuccess(
        parse(
            "input123",
            either(digit(), seq(capture(str("input")), digit()))
        ),
        ["input", 123],
        8
    )


    assertFailure(
        parse(
            "inputother",
            either(digit(), seq(capture(str("input")), digit()))
        ),
        5
    )
});




test('Either Many', () => {

    const parseResult: ParseResult<string> = parse("successnotmatch",

            eitherMany(seq(cut(str("success")), str("failure")), str("other"))

    );

    assertFailure(parseResult,  7)
});



test('Char in', () => {

    assertSuccess(parse("b", charIn("a-z")), undefined, 1)
    assertFailure(parse("b", charIn("c-z")), 0)

    assertSuccess(parse("3", capture(charIn("0-9"))), "3", 1)
    assertSuccess(parse("b", capture(charIn("a-z"))), "b", 1)
    assertFailure(parse("b", capture(charIn("c-z"))), 0)
});

test('Chars while in', () => {
    assertSuccess(parse("input", capture(charsWhileIn("a-z"))), "input", 5)
    assertSuccess(parse("input123", capture(charsWhileIn("a-z"))), "input", 5)
    assertSuccess(parse("INPUT123", capture(charsWhileIn("A-Z"))), "INPUT", 5)
    assertSuccess(parse("INPUT123", capture(charsWhileIn("a-z"))), "", 0)
    assertSuccess(parse("", capture(charsWhileIn("a-z"))), "", 0)
});

test('Spaces', () => {
    assertSuccess(parse(" ", spaces()), undefined, 1)
    assertSuccess(parse("\n", spaces()), undefined, 1)
    assertSuccess(parse("\r", spaces()), undefined, 1)
    assertSuccess(parse(" \r\n", spaces()), undefined, 3)
    assertSuccess(parse(" \r\ntest", spaces()), undefined, 3)

    // Required
    assertSuccess(parse(" ", spaces(true)), undefined, 1)
    assertFailure(parse("", spaces(true)), 0)
});

test('Cut', () => {
    const parseResult: ParseResult<string | [string, string]> = parse("input123", either(cut(seq(digit(), digit())), seq(capture(str("input")), digit())));
});


test('Optional', () => {
    assertSuccess(parse("input123", opt(capture(str("input")))), new Optional<string>("input"), 5)
    assertSuccess(parse("input123", opt(capture(str("other")))), new Optional<string>(), 0)
});

/**
 * Where the stream is left after running a parser. Asserted directly rather than
 * through parse(), whose reported position is the furthest failure rather than
 * the stream position.
 */
function positionAfter<T>(input: string, parser: P<T>): number {
    const inputStream = new InputStream(input)
    parser.createParser(inputStream)
    return inputStream.position
}

test('Failed parsers do not consume input', () => {

    // str must rewind after a partial match, not leave the stream mid-token
    expect(positionAfter("input123", str("inputX"))).toBe(0)

    // a failed optional must leave the stream exactly where it started
    expect(positionAfter("input123", opt(capture(str("inputX"))))).toBe(0)

    // rep must not leave the stream inside the element that failed
    expect(positionAfter("ababaX", rep(capture(str("ab"))))).toBe(4)

    // a separator consumed by rep must be given back when no element follows it
    expect(positionAfter("ab,ab,", rep(capture(str("ab")), {sep: str(",")}))).toBe(5)

    // successful parsers still advance
    expect(positionAfter("input123", str("input"))).toBe(5)
});

test('Failures report the furthest position reached', () => {

    // The first alternative fails immediately, the second gets three characters
    // in. After backtracking the stream is back at 0, but 3 is where the input
    // actually went wrong.
    const parseResult = parse("abcX", eitherMany(seq(str("z"), str("z")), seq(str("abc"), str("Y"))))

    assertFailure(parseResult, 3)
    expect((parseResult as ParseFailure<any>).expected).toContain('"Y"')
});

test('label replaces the expected set of its parser', () => {

    const parseResult = parse("!", label("identifier", capture(charIn("a-z"))))

    assertFailure(parseResult, 0)
    expect((parseResult as ParseFailure<string>).expected).toStrictEqual(["identifier"])
});

test('quiet keeps a parser out of the expected set', () => {

    const parseResult = parse("!", seq(opt(quiet(str("a"))), str("b")))

    expect((parseResult as ParseFailure<any>).expected).toStrictEqual(['"b"'])
});

test('Map', () => {

    const input = 'input';
    const parseResult: ParseResult<string> = parse("input", capture(str(input)).map(result => result + "123"));

    assertSuccess(parseResult, `${input}123`, 5)
});

test('Filter success', () => {

    const input = 'test';
    const parseResult: ParseResult<string> = parse("test", capture(str(input)).filter(result => result.length > 2));

    assertSuccess(parseResult, `${input}`, 4)
});

test('Filter fail', () => {

    const parseResult: ParseResult<string> = parse("test", capture(str('test')).filter(result => result.length > 4));

    assertFailure(parseResult, 4)
});

test('Sequence', () => {
    assertSuccess(
        parse(
            "input123",
            seq(capture(str('input')), capture(str('123')), end())
        ),
        ['input', '123'],
        8)

    assertFailure(
        parse(
            "input123",
            seq(capture(str('input')), end())
        ),
        5)
});

test('End', () => {

    const parseResult: ParseResult<void> = parse("", end())

    assertSuccess(parseResult, undefined, 0)
    assertFailure(parse("1", end()), 0)
});