import {assertFailure, assertSuccess} from "./parser-test-utils";
import {parse} from "../../../src/lumina/parser/parser";
import {expressionParser, expressions, methodCall, modifier} from "../../../src/lumina/compiler/parser/expression-parser";
import {ExpressionAst} from "../../../src/lumina/compiler/ast/expression-ast";
import Public = ExpressionAst.Public;
import Protected = ExpressionAst.Protected;
import IntConst = ExpressionAst.IntConst;
import Private = ExpressionAst.Private;
import Open = ExpressionAst.Open;
import MethodCall = ExpressionAst.MethodCall;
import ABinary = ExpressionAst.ABinary;
import Add = ExpressionAst.Add;
import Subtract = ExpressionAst.Subtract;
import Multiply = ExpressionAst.Multiply;
import BBinary = ExpressionAst.BBinary;
import Greater = ExpressionAst.Greater;
import RBinary = ExpressionAst.RBinary;
import Postfix = ExpressionAst.Postfix;
import Variable = ExpressionAst.Variable;
import Increment = ExpressionAst.Increment;
import Decrement = ExpressionAst.Decrement;
import NewClassInstance = ExpressionAst.NewClassInstance;
import LocalType = ExpressionAst.LocalType;

beforeAll(() => {
    global.console = require('console')
})

test('Parse arithmetic', () => {
    assertSuccess(parse("1 - 2 + 5",expressions()),
        new ABinary(
            new Add(),
            new ABinary(
                new Subtract(),
                new IntConst(1),
                new IntConst(2)),
            new IntConst(5)),
        9)

    assertSuccess(parse("1 - (2 + 5) * 3",expressions()),
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
        ), 15)
});

test('Parse boolean expressions', () => {
    assertSuccess(parse("1 > 10",expressions()),
        new RBinary(
            new Greater(),
                new IntConst(1),
                new IntConst(10),
           ),
        6)
});

test('Parse access modifier', () => {
    assertSuccess(parse("public", modifier()), Public, 6)
    assertSuccess(parse("protected",modifier()), Protected, 9)
    assertSuccess(parse("private", modifier()), Private, 7)
    assertSuccess(parse("open", modifier()), Open, 4)
    assertFailure(parse("",modifier()), 0)
});

test('Parse increment', () => {
    assertSuccess(parse("a++",expressionParser()), new Postfix(new Variable("a"),new Increment( )), 3)
});

test('Parse decrement', () => {
    assertSuccess(parse("a--",expressionParser()), new Postfix(new Variable("a"),new Decrement( )), 3)
});

test('Parse new class instance', () => {
    assertSuccess(parse("new ClassName()",expressionParser()), new NewClassInstance(new LocalType("ClassName"),[]), 15)
    assertSuccess(parse("new ClassName(a, b, c)",expressionParser()),
        new NewClassInstance(
            new LocalType("ClassName"),
            [
                new Variable("a"),
                new Variable("b"),
                new Variable("c"),
            ]
        ), 22)
});

test('Parse method call', () => {
    assertSuccess(parse("example()",expressionParser()), new Postfix(new Variable("example"),new MethodCall( [])), 9)
    assertSuccess(parse("example(1)",expressionParser()),
        new Postfix(
            new Variable("example"),
            new MethodCall([new IntConst(1)])
        ), 10)
    assertSuccess(parse("example(1,2,3)",expressionParser()),
        new Postfix(
            new Variable("example"),
            new MethodCall([new IntConst(1), new IntConst(2), new IntConst(3)])
        ), 14)
    assertSuccess(parse("example(1  ,  2  ,  3)",expressionParser()),
        new Postfix(new Variable("example"),new MethodCall(
        [new IntConst(1), new IntConst(2), new IntConst(3)]
    )), 22)
    assertSuccess(parse("example(  1  ,  2  ,  3  )",expressionParser()),
        new Postfix(new Variable("example"),new MethodCall(
            [new IntConst(1), new IntConst(2), new IntConst(3)])), 26)
    assertFailure(parse("",modifier()), 0)
});

test('Parse expressions', () => {
    assertSuccess(parse("1",expressionParser()), new IntConst(1), 1)
});