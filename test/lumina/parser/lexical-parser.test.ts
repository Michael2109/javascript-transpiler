import {
    identifier,
    integer,
    keyword,
    stringLiteral,
    variable,
} from "../../../src/lumina/compiler/parser/lexical-parser";
import {parse} from "../../../src/lumina/parser/parser";
import {assertFailure, assertSuccess} from "./parser-test-utils";
import {ExpressionAst} from "../../../src/lumina/compiler/ast/expression-ast";
import IntConst = ExpressionAst.IntConst;
import Variable = ExpressionAst.Variable;

beforeAll(() => {
    global.console = require('console')
})

test('Parse keywords', () => {
    assertSuccess(parse("public", keyword("public")), undefined, 6)
    assertSuccess(parse("class", keyword("class")),undefined, 5)
    assertFailure(parse("other", keyword("other")))
});

test('Parse identifier', () => {
    assertSuccess(parse("example_123", identifier()), "example_123", 11)
    assertFailure(parse("123_example",identifier()))
    assertFailure(parse("",identifier()))
});

test('Parse string literal', () => {
    assertSuccess(parse("\" \"",stringLiteral()), " ", 3)
    assertSuccess(parse("\"example_123 \"",stringLiteral()), "example_123 ", 14)
    assertFailure(parse("\"",stringLiteral()))
    assertFailure(parse("",stringLiteral()))
    assertFailure(parse("example_123",stringLiteral()))
});

test('Parse integer', () => {
    assertSuccess(parse("123",integer()), new IntConst(123), 3)
    assertFailure(parse("",integer()))
});

test('Parse variable', () => {
    assertSuccess(parse("a",variable()), new Variable("a"), 1)
    assertSuccess(parse("a_b_c",variable()), new Variable("a_b_c"), 5)
    assertFailure(parse("1ab",variable()))
});