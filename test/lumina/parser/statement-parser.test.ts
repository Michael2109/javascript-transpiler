import {Ast} from "../../../src/lumina/compiler/ast/ast";
import {assertSuccess} from "./parser-test-utils";
import {
    assign,
    block,
    classParser,
    comment,
    field,
    ifStatement,
    method, reassign, statement
} from "../../../src/lumina/parser/statement-parser";
import ExprAsStmt = Ast.ExprAsStmt;
import Variable = Ast.Variable;
import If = Ast.If;
import IntConst = Ast.IntConst;
import Method = Ast.Method;
import Field = Ast.Field;
import RefLocal = Ast.RefLocal;
import ClassModel = Ast.ClassModel;
import Assign = Ast.Assign;
import Reassign = Ast.Reassign;

test('Parse block', () => {
    assertSuccess(block().createParser("{ }"), [], "")
    assertSuccess(block().createParser("{ x }"), [new ExprAsStmt(new Variable("x"))], "")
});

test('Parse if statement', () => {
    assertSuccess(ifStatement().createParser("if(1){ }"), new If(new IntConst(1), [], undefined), "")
    assertSuccess(ifStatement().createParser("if(1){ } else {}"), new If(new IntConst(1), [], []), "")
    assertSuccess(ifStatement().createParser("if(1){ } else if(2) {} else {}"), new If(new IntConst(1),[], new If(new IntConst(2), [], [])), "")

});

test('Parse assignment', () => {
    assertSuccess(assign().createParser("let x = 10"),
        new Assign("x",undefined, true, new ExprAsStmt(new IntConst(10))),
        "")
});

test('Parse reassignment', () => {
    assertSuccess(reassign().createParser("x <- 10"),
        new Reassign("x",new ExprAsStmt(new IntConst(10))),
        "")
});


test('Parse field', () => {
    assertSuccess(field().createParser("let x: ClassName"),
        new Field("x", new RefLocal("ClassName")),
        "")
});

test('Parse class', () => {
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
            "class ClassName (let field1: Type, let field2: Type) {}"),
        new ClassModel(
            "ClassName",
            [],
            [  new Field("field1", new RefLocal("Type")),   new Field("field2", new RefLocal("Type"))],
            undefined,
            [],
            [],
            []
        ), "")
});

test('Parse method', () => {
    assertSuccess(method().createParser("let methodName(){ }"), new Method("methodName", [], [], [], undefined, []), "")
    assertSuccess(method().createParser("let methodName(let x: Int, let y: String){ }"), new Method("methodName", [], [new Field("x", new RefLocal("Int")), new Field("y", new RefLocal("String"))], [], undefined, []), "")
    assertSuccess(method().createParser("let methodName(): ClassName{ }"), new Method("methodName", [], [], [], new RefLocal("ClassName"), []), "")
});

test('Parse block comment', () => {
    assertSuccess(comment().createParser("/**/"), undefined, "")
    assertSuccess(comment().createParser("/*fsdsfsdfdsf*/"), undefined, "")
});