import {digit, end, either, Parser, ParseResult, seq, str, rep, cut} from "../../../src/ethera/parser/parser";
import {identifier, integer, keyword, stringLiteral} from "../../../src/ethera/parser/lexical-parser";
import {assertFail, assertSuccess} from "./parser-test-utils";
import {Ast} from "../../../src/ethera/compiler/ast/ast";
import IntConst = Ast.IntConst;

test('Parse keywords', () => {
    assertSuccess(keyword("public").parserFn().parse("public"), undefined, "")
    assertSuccess(keyword("class").parserFn().parse("class"), undefined, "")
    assertFail(keyword("other").parserFn().parse("other"))
});

test('Parse identifier', () => {
    assertSuccess(identifier().parserFn().parse("example_123"), "example_123", "")
    assertFail(identifier().parserFn().parse("123_example"))
    assertFail(identifier().parserFn().parse(""))
});

test('Parse string literal', () => {
    assertSuccess(stringLiteral().parserFn().parse("\" \""), " ", "")
    assertSuccess(stringLiteral().parserFn().parse("\"example_123 \""), "example_123 ", "")
    assertFail(stringLiteral().parserFn().parse("\""))
    assertFail(stringLiteral().parserFn().parse(""))
    assertFail(stringLiteral().parserFn().parse("example_123"))
});

test('Parse integer', () => {
    assertSuccess(integer().parserFn().parse("123"), new IntConst(BigInt(123)), "")
    assertFail(integer().parserFn().parse(""))
});