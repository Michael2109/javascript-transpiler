import {assertFail, assertSuccess} from "./parser-test-utils";
import {expressionParser, expressions, methodCall, modifier} from "../../../src/lumina/parser/expression-parser";
import {Ast} from "../../../src/lumina/compiler/ast/ast";
import Public = Ast.Public;
import Protected = Ast.Protected;
import IntConst = Ast.IntConst;
import Private = Ast.Private;
import Open = Ast.Open;
import MethodCall = Ast.MethodCall;
import ABinary = Ast.ABinary;
import Add = Ast.Add;
import Subtract = Ast.Subtract;
import Multiply = Ast.Multiply;

test('Parse arithmetic', () => {
    assertSuccess(expressions().createParser("1 - 2 + 5"),
        new ABinary(
            new Add(),
            new ABinary(
                new Subtract(),
                new IntConst(1),
                new IntConst(2)),
            new IntConst(5)), "")

    assertSuccess(expressions().createParser("1 - (2 + 5) * 3"),
        new ABinary(
            new Subtract(),
            new IntConst(1),
            new ABinary(
                new Multiply(),
                new ABinary(
                    new Add(),
                    new IntConst(2),
                    new IntConst(5)),
                new IntConst(3))
        ), "")
});

test('Parse access modifier', () => {
    assertSuccess(modifier().createParser("public"), Public, "")
    assertSuccess(modifier().createParser("protected"), Protected, "")
    assertSuccess(modifier().createParser("private"), Private, "")
    assertSuccess(modifier().createParser("open"), Open, "")
    assertFail(modifier().createParser(""))
});

test('Parse method call', () => {
    assertSuccess(methodCall().createParser("example()"), new MethodCall("example", []), "")
    assertSuccess(methodCall().createParser("example(1)"),
        new MethodCall("example", [new IntConst(1)]), "")
    assertSuccess(methodCall().createParser("example(1,2,3)"),
        new MethodCall("example",
            [new IntConst(1), new IntConst(2), new IntConst(3)]), "")
    assertSuccess(methodCall().createParser("example(1  ,  2  ,  3)"), new MethodCall("example",
        [new IntConst(1), new IntConst(2), new IntConst(3)]
    ), "")
    assertSuccess(methodCall().createParser("example(  1  ,  2  ,  3  )"),
        new MethodCall("example",
            [new IntConst(1), new IntConst(2), new IntConst(3)]), "")
    assertFail(modifier().createParser(""))
});

test('Parse expressions', () => {
    assertSuccess(expressionParser().createParser("example()"), new MethodCall("example", []), "")
    assertSuccess(expressionParser().createParser("1"), new IntConst(1), "")
});