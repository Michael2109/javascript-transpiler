import {ExpressionAst} from "../../../../src/lumina/compiler/ast/expression-ast";
import {StatementAst} from "../../../../src/lumina/compiler/ast/statement-ast";

import {assertFailure, assertSuccess} from "./parser-test-utils";
import {
    assign,
    block,
    classParser,
    expressionAsStatement,
    field,
    ifStatement,
    method,
    reassign, statement
} from "../../../../src/lumina/compiler/parser/statement-parser";
import {ControlFlowAst} from "../../../../src/lumina/compiler/ast/control-flow-ast";
import {DeclarationAst} from "../../../../src/lumina/compiler/ast/declaration-ast";

import {parse} from "../../../../src/lumina/parser/parser";
import ExprAsStmt = StatementAst.ExprAsStmt;
import Variable = ExpressionAst.Variable;
import If = ControlFlowAst.If;
import Block = StatementAst.Block;
import IntConst = ExpressionAst.IntConst;
import RBinary = ExpressionAst.RBinary;
import Greater = ExpressionAst.Greater;
import Method = DeclarationAst.Method;
import Field = DeclarationAst.Field;
import RefLocal = ExpressionAst.LocalType;
import ClassModel = DeclarationAst.ClassModel;
import Assign = DeclarationAst.Assign;
import Reassign = DeclarationAst.Reassign;
import LocalType = ExpressionAst.LocalType;

beforeAll(() => {
    global.console = require('console')
})

test('Parse expression as statement', () => {
    assertSuccess(parse("x", expressionAsStatement()), new ExprAsStmt(new Variable("x")), 1)
});

test('Parse block', () => {
    assertSuccess(parse("{ }", block()), [], 3)
    assertSuccess(parse("{ x }", block()), [new ExprAsStmt(new Variable("x"))], 5)
    assertFailure(parse("{ #unknown }", block()),  2)
});

test('Parse if statement', () => {
    assertSuccess(parse("if(x){ }", statement()), new If(new Variable("x"), new Block([]), undefined), 8)
    assertSuccess(parse("if(1){ } else {}", statement()), new If(new IntConst(1), new Block([]), new Block([])), 16)
    assertSuccess(parse("if(1){ } else if(2) {} else {}", statement()), new If(new IntConst(1), new Block([]), new If(new IntConst(2), new Block([]), new Block([]))), 30)
    assertSuccess(parse("if(x > 1){ }", statement()), new If(new RBinary(new Greater(), new Variable("x"), new IntConst(1)), new Block([]), undefined), 12)

});

test('Statements are separated by a newline or a semicolon', () => {

    const twoStatements = [new ExprAsStmt(new Variable("a")), new ExprAsStmt(new Variable("b"))]

    assertSuccess(parse("{ a\nb }", block()), twoStatements, 7)
    assertSuccess(parse("{ a; b }", block()), twoStatements, 8)
    assertSuccess(parse("{ a;\nb }", block()), twoStatements, 8)

    // blank lines and comments around the separator are fine
    assertSuccess(parse("{ a // note\n\n b }", block()), twoStatements, 17)

    // a trailing separator before the closing brace is allowed
    assertSuccess(parse("{ a; }", block()), [new ExprAsStmt(new Variable("a"))], 6)

    // but two statements with nothing between them are not
    assertFailure(parse("{ a b }", block()), 4)
});

test('Parse assignment', () => {
    assertSuccess(parse("let x = 10", assign()),
        new Assign("x", undefined, true, new ExprAsStmt(new IntConst(10))),
        10)
});

test('Parse reassignment', () => {
    assertSuccess(parse("x <- 10", reassign()),
        new Reassign("x", new ExprAsStmt(new IntConst(10))),
        7)
});


test('Parse field', () => {
    assertSuccess(parse("x: ClassName", field()),
        new Field("x", true, new RefLocal("ClassName")),
        12)
    assertSuccess(parse("let x: ClassName", field()),
        new Field("x", true, new RefLocal("ClassName")),
        16)
    assertSuccess(parse("let x?: ClassName", field()),
        new Field("x", false, new RefLocal("ClassName")),
        17)
});

test('Parse class', () => {

    assertSuccess(parse("class ClassName ()", classParser()),
        new ClassModel(
            "ClassName",
            [],
            [],
            undefined,
            [],
            [],
            []
        ), 18)

    assertSuccess(parse("class ClassName {}", classParser()),
        new ClassModel(
            "ClassName",
            [],
            [],
            undefined,
            [],
            [],
            []
        ), 18)

    assertSuccess(parse("class ClassName extends Other", classParser()),
        new ClassModel(
            "ClassName",
            [],
            [],
            new LocalType("Other"),
            [],
            [],
            []
        ), 29)

    assertSuccess(parse("class ClassName (let field1: Type, let field2: Type[string]) {}", classParser()),
        new ClassModel(
            "ClassName",
            [],
            [new Field("field1", true, new RefLocal("Type")), new Field("field2", true, new RefLocal("Type"))],
            undefined,
            [],
            [],
            []
        ), 63)
});

test('Parse method', () => {
    assertSuccess(
        parse("let methodName(){ }", method()),
        new Method("methodName", [], [], [], undefined, []),
        19
    )
    assertSuccess(
        parse("let methodName(let x: Int, let y: String){ }", method()),
        new Method("methodName", [], [new Field("x", true, new RefLocal("Int")), new Field("y", true, new RefLocal("String"))], [], undefined, []),
        44
    )
    assertSuccess(
        parse("let methodName(): ClassName{ }", method()),
        new Method("methodName", [], [], [], new RefLocal("ClassName"), []),
        30)
});
/*
 TODO
test('Parse block comment', () => {
    assertSuccess(parse("/!**!/",comment()), undefined, 10)
    assertSuccess(parse("/!*fsdsfsdfdsf*!/",comment()), undefined, 10)
});*/
