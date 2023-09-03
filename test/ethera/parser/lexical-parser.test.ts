import {identifier, integer, keyword, stringLiteral} from "../../../src/ethera/parser/lexical-parser";
import {assertFail, assertSuccess} from "./parser-test-utils";
import {Ast} from "../../../src/ethera/compiler/ast/ast";
import IntConst = Ast.IntConst;

test('Parse keywords', () => {
    assertSuccess(keyword("public").createParser().parse("public"), undefined, "")
    assertSuccess(keyword("class").createParser().parse("class"), undefined, "")
    assertFail(keyword("other").createParser().parse("other"))
});

test('Parse identifier', () => {
    assertSuccess(identifier().createParser().parse("example_123"), "example_123", "")
    assertFail(identifier().createParser().parse("123_example"))
    assertFail(identifier().createParser().parse(""))
});

test('Parse string literal', () => {
    assertSuccess(stringLiteral().createParser().parse("\" \""), " ", "")
    assertSuccess(stringLiteral().createParser().parse("\"example_123 \""), "example_123 ", "")
    assertFail(stringLiteral().createParser().parse("\""))
    assertFail(stringLiteral().createParser().parse(""))
    assertFail(stringLiteral().createParser().parse("example_123"))
});

test('Parse integer', () => {
    assertSuccess(integer().createParser().parse("123"), new IntConst(BigInt(123)), "")
    assertFail(integer().createParser().parse(""))
});