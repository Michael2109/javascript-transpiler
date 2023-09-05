import {assertFail, assertSuccess} from "./parser-test-utils";
import {expressionParser, methodCall, modifier} from "../../../src/ethera/parser/expression-parser";
import {Ast} from "../../../src/ethera/compiler/ast/ast";
import Public = Ast.Public;
import Protected = Ast.Protected;
import IntConst = Ast.IntConst;
import Private = Ast.Private;
import Open = Ast.Open;

test('Parse access modifier', () => {
    assertSuccess(modifier().createParser("public"), Public, "")
    assertSuccess(modifier().createParser("protected"), Protected, "")
    assertSuccess(modifier().createParser("private"), Private, "")
    assertSuccess(modifier().createParser("open"), Open, "")
    assertFail(modifier().createParser(""))
});


test('Parse method call', () => {
    assertSuccess(methodCall().createParser("example()"), {name: "example", expressions: []}, "")
    assertSuccess(methodCall().createParser("example(1)"), {
        name: "example",
        expressions: [new IntConst(BigInt(1))]
    }, "")
    assertSuccess(methodCall().createParser("example(1,2,3)"), {
        name: "example",
        expressions: [new IntConst(BigInt(1)), new IntConst(BigInt(2)), new IntConst(BigInt(3))]
    }, "")
    assertSuccess(methodCall().createParser("example(1  ,  2  ,  3)"), {
        name: "example",
        expressions: [new IntConst(BigInt(1)), new IntConst(BigInt(2)), new IntConst(BigInt(3))]
    }, "")
    assertSuccess(methodCall().createParser("example(  1  ,  2  ,  3  )"), {
        name: "example",
        expressions: [new IntConst(BigInt(1)), new IntConst(BigInt(2)), new IntConst(BigInt(3))]
    }, "")
    assertFail(modifier().createParser(""))
});

test('Parse expressions', () => {
    assertSuccess(expressionParser().createParser("example()"), {name: "example", expressions: []}, "")
    assertSuccess(expressionParser().createParser("1"), new IntConst(BigInt(1)), "")
});