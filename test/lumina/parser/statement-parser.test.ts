import {ExpressionAst} from "../../../src/lumina/compiler/ast/expression-ast";
import {StatementAst} from "../../../src/lumina/compiler/ast/statement-ast";

import {assertSuccess} from "./parser-test-utils";
import {
    assign,
    block,
    classParser,
    comment,
    field,
    ifStatement,
    method,
    reassign
} from "../../../src/lumina/compiler/parser/statement-parser";
import {ControlFlowAst} from "../../../src/lumina/compiler/ast/control-flow-ast";
import {DeclarationAst} from "../../../src/lumina/compiler/ast/declaration-ast";
import ExprAsStmt = StatementAst.ExprAsStmt;
import Variable = ExpressionAst.Variable;
import If = ControlFlowAst.If;
import IntConst = ExpressionAst.IntConst;
import Method = DeclarationAst.Method;
import Field = DeclarationAst.Field;
import RefLocal = ExpressionAst.LocalType;
import ClassModel = DeclarationAst.ClassModel;
import Assign = DeclarationAst.Assign;
import Reassign = DeclarationAst.Reassign;
import LocalType = ExpressionAst.LocalType;

test('Parse block', () => {
    assertSuccess(block().createParser("{ }"), [], "")
    assertSuccess(block().createParser("{ x }"), [new ExprAsStmt(new Variable("x"))], "")
});

test('Parse if statement', () => {
    assertSuccess(ifStatement().createParser("if(1){ }"), new If(new IntConst(1), [], undefined), "")
    assertSuccess(ifStatement().createParser("if(1){ } else {}"), new If(new IntConst(1), [], []), "")
    assertSuccess(ifStatement().createParser("if(1){ } else if(2) {} else {}"), new If(new IntConst(1), [], new If(new IntConst(2), [], [])), "")

});

test('Parse assignment', () => {
    assertSuccess(assign().createParser("let x = 10"),
        new Assign("x", undefined, true, new ExprAsStmt(new IntConst(10))),
        "")
});

test('Parse reassignment', () => {
    assertSuccess(reassign().createParser("x <- 10"),
        new Reassign("x", new ExprAsStmt(new IntConst(10))),
        "")
});


test('Parse field', () => {
    assertSuccess(field().createParser("x: ClassName"),
        new Field("x", true, new RefLocal("ClassName")),
        "")
    assertSuccess(field().createParser("let x: ClassName"),
        new Field("x", true, new RefLocal("ClassName")),
        "")
    assertSuccess(field().createParser("let x?: ClassName"),
        new Field("x", false, new RefLocal("ClassName")),
        "")
});


test('Parse class', () => {

    assertSuccess(classParser().createParser(
            "class ClassName ()"),
        new ClassModel(
            "ClassName",
            [],
            [],
            undefined,
            [],
            [],
            []
        ), "")

    assertSuccess(classParser().createParser(
            "class ClassName {}"),
        new ClassModel(
            "ClassName",
            [],
            [],
            undefined,
            [],
            [],
            []
        ), "")

    assertSuccess(classParser().createParser(
            "class ClassName extends Other"),
        new ClassModel(
            "ClassName",
            [],
            [],
            new LocalType("Other"),
            [],
            [],
            []
        ), "")

    assertSuccess(classParser().createParser(
            "class ClassName (let field1: Type, let field2: Type[string]) {}"),
        new ClassModel(
            "ClassName",
            [],
            [new Field("field1", true, new RefLocal("Type")), new Field("field2", true, new RefLocal("Type"))],
            undefined,
            [],
            [],
            []
        ), "")
});

test('Parse method', () => {
    assertSuccess(method().createParser("let methodName(){ }"), new Method("methodName", [], [], [], undefined, []), "")
    assertSuccess(method().createParser("let methodName(let x: Int, let y: String){ }"), new Method("methodName", [], [new Field("x", true, new RefLocal("Int")), new Field("y", true, new RefLocal("String"))], [], undefined, []), "")
    assertSuccess(method().createParser("let methodName(): ClassName{ }"), new Method("methodName", [], [], [], new RefLocal("ClassName"), []), "")
});

test('Parse block comment', () => {
    assertSuccess(comment().createParser("/**/"), undefined, "")
    assertSuccess(comment().createParser("/*fsdsfsdfdsf*/"), undefined, "")
});