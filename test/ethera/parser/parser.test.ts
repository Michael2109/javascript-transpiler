import {
    digit,
    end,
    either,
    Parser,
    ParseResult,
    seq,
    str,
    rep,
    cut,
    charIn,
    charsWhileIn, spaces, capture
} from "../../../src/ethera/parser/parser";
import {assertFail, assertSuccess} from "./parser-test-utils";

test('Strings', () => {
    assertSuccess(capture(str('input')).parserFn().parse("input123"), 'input', "123")
});

test('Char in Regex', () => {
    assertSuccess(charIn("a-z").parserFn().parse("input123"), "i", "nput123")
    assertSuccess(charIn("A-Z").parserFn().parse("INPUT123"), "I", "NPUT123")
    assertFail(charIn("a-z").parserFn().parse("INPUT123"))
});

test('Chars while in', () => {
    assertSuccess(charsWhileIn("a-z").parserFn().parse("input123"), "input", "123")
    assertSuccess(charsWhileIn("A-Z").parserFn().parse("INPUT123"), "INPUT", "123")
    assertSuccess(charsWhileIn("a-z").parserFn().parse("INPUT123"), "", "INPUT123")
    assertSuccess(charsWhileIn("a-z").parserFn().parse(""), "", "")
});

test('Spaces', () => {
    assertSuccess(spaces().parserFn().parse(" "), undefined, "")
    assertSuccess(spaces().parserFn().parse("\n"), undefined, "")
    assertSuccess(spaces().parserFn().parse("\r"), undefined, "")
    assertSuccess(spaces().parserFn().parse(" \r\n"), undefined, "")
    assertSuccess(spaces().parserFn().parse(" \r\ntest"), undefined, "test")
});

test('Map', () => {

    const input = 'input';
    const parseResult: ParseResult<string> = capture(str(input)).map(result => result + "123").parserFn().parse("input");

    assertSuccess(parseResult, `${input}123`, "")
});

test('Filter success', () => {

    const input = 'test';
    const parseResult: ParseResult<string> = capture(str(input)).filter(result => result.length > 2).parserFn().parse("test");

    assertSuccess(parseResult, `${input}`, "")
});

test('Filter fail', () => {

    const input = 'test';
    const parseResult: ParseResult<string> = capture(str(input)).filter(result => result.length > 4).parserFn().parse("test");

    assertFail(parseResult)
});

test('Either', () => {

    const input1 = 'input';
    const input2 = '123';

    const parseResult: ParseResult<string | [string, string]> = either(digit(),seq(capture(str(input1)),digit())).parserFn().parse("input123");

    assertSuccess(parseResult, [input1, input2], "")
});

test('Cut', () => {
    const parseResult: ParseResult<string | [string, string]> = either(cut(seq(digit(),digit())),seq(capture(str("input")),digit())).parserFn().parse("input123");

    assertFail(parseResult)
});

test('Repeat', () => {
    assertSuccess( rep(seq(digit(),capture(str("test")))).parserFn().parse("12test34test56test"), [[ "12", "test"], [ "34", "test"], [ "56", "test"]], "")
    assertSuccess( rep(seq(digit(),capture(str("test"))), {sep: str(",")}).parserFn().parse("12test,34test,56test"), [[ "12", "test"], [ "34", "test"], [ "56", "test"]], "")
});

test('Sequence', () => {
    const input1 = 'input';
    const input2 = '123';
    const parseResult = seq(capture(str(input1)), capture(str(input2)), end()).parserFn().parse("input123")

    assertSuccess(parseResult, [input1, input2], "")
});


test('Sequence - First parser fail', () => {

    const input1 = 'input';
    const input2 = '123';

    assertFail(seq(str(input2), str(input2), end()).parserFn().parse("input123"))
    assertFail(seq(str(input1), str(input1), end()).parserFn().parse("input123"))
});


test('End', () => {

    const parseResult: ParseResult<void> = end().parserFn().parse("");

    assertSuccess(parseResult,  undefined, "")

    assertFail(end().parserFn().parse("1"))
});
