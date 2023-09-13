import {identifier, integer, keyword, stringLiteral, variable} from "../../../src/lumina/parser/lexical-parser";
import {assertFail, assertSuccess} from "./parser-test-utils";
import {Ast} from "../../../src/lumina/compiler/ast/ast";
import IntConst = Ast.IntConst;
import Variable = Ast.Variable;

test('Parse keywords', () => {
    assertSuccess(keyword("public").createParser("public"), undefined, "")
    assertSuccess(keyword("class").createParser("class"), undefined, "")
    assertFail(keyword("other").createParser("other"))
});

test('Parse identifier', () => {
    assertSuccess(identifier().createParser("example_123"), "example_123", "")
    assertFail(identifier().createParser("123_example"))
    assertFail(identifier().createParser(""))
});

test('Parse string literal', () => {
    assertSuccess(stringLiteral().createParser("\" \""), " ", "")
    assertSuccess(stringLiteral().createParser("\"example_123 \""), "example_123 ", "")
    assertFail(stringLiteral().createParser("\""))
    assertFail(stringLiteral().createParser(""))
    assertFail(stringLiteral().createParser("example_123"))
});

test('Parse integer', () => {
    assertSuccess(integer().createParser("123"), new IntConst(123), "")
    assertFail(integer().createParser(""))
});

test('Parse variable', () => {
    assertSuccess(variable().createParser("a"), new Variable("a"), "")
    assertSuccess(variable().createParser("a_b_c"), new Variable("a_b_c"), "")
    assertFail(variable().createParser("1ab"))
});