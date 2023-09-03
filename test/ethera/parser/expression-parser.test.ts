import {digit, end, either, Parser, ParseResult, seq, str, rep, cut} from "../../../src/ethera/parser/parser";

import {assertFail, assertSuccess} from "./parser-test-utils";
import {keyword} from "../../../src/ethera/parser/lexical-parser";
import {expressionParser, methodCall, modifier} from "../../../src/ethera/parser/expression-parser";
import {Ast} from "../../../src/ethera/compiler/ast/ast";
import Public = Ast.Public;
import Protected = Ast.Protected;
import IntConst = Ast.IntConst;
import Private = Ast.Private;
import Open = Ast.Open;

test('Parse access modifier', () => {
    assertSuccess(modifier().parserFn().parse("public"), Public, "")
    assertSuccess(modifier().parserFn().parse("protected"), Protected, "")
    assertSuccess(modifier().parserFn().parse("private"), Private, "")
    assertSuccess(modifier().parserFn().parse("open"), Open, "")
    assertFail(modifier().parserFn().parse(""))
});


test('Parse method call', () => {
    assertSuccess(methodCall().parserFn().parse("example()"), {name: "example", expressions: []}, "")
    assertSuccess(methodCall().parserFn().parse("example(1)"), {name: "example", expressions: [new IntConst(BigInt(1))]}, "")
    assertSuccess(methodCall().parserFn().parse("example(1,2,3)"), {name: "example", expressions: [new IntConst(BigInt(1)), new IntConst(BigInt(2)), new IntConst(BigInt(3))]}, "")
    assertSuccess(methodCall().parserFn().parse("example(1  ,  2  ,  3)"), {name: "example", expressions: [new IntConst(BigInt(1)), new IntConst(BigInt(2)), new IntConst(BigInt(3))]}, "")
    assertSuccess(methodCall().parserFn().parse("example(  1  ,  2  ,  3  )"), {name: "example", expressions: [new IntConst(BigInt(1)), new IntConst(BigInt(2)), new IntConst(BigInt(3))]}, "")
    assertFail(modifier().parserFn().parse(""))
});

test('Parse expressions', () => {
    assertSuccess(expressionParser().parserFn().parse("example()"), {name: "example", expressions: []}, "")

    console.log(expressionParser().parserFn().parse("1"))
    assertSuccess(expressionParser().parserFn().parse("1"), new IntConst(BigInt(1)), "")
});