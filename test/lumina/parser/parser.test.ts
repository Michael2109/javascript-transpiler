import {
    capture,
    charIn,
    charsWhileIn,
    cut,
    digit,
    either, eitherMany,
    end,
    opt,
    parse,
    ParseResult,
    rep,
    seq,
    spaces,
    str
} from "../../../src/lumina/parser/parser";
import {assertFailure, assertSuccess} from "./parser-test-utils";

import {Optional} from "../../../src/lumina/parser/optional";

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