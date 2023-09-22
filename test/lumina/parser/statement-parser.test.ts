import {ExpressionAst} from "../../../src/lumina/compiler/ast/expression-ast";
import {StatementAst} from "../../../src/lumina/compiler/ast/statement-ast";

import {assertFailure, assertSuccess} from "./parser-test-utils";
import {
    assign,
    block,
    classParser,
    expressionAsStatement,
    field,
    ifStatement,
    method,
    reassign
} from "../../../src/lumina/compiler/parser/statement-parser";
import {ControlFlowAst} from "../../../src/lumina/compiler/ast/control-flow-ast";
import {DeclarationAst} from "../../../src/lumina/compiler/ast/declaration-ast";

import {parse} from "../../../src/lumina/parser/parser";
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
import {namespace} from "../../../src/lumina/compiler/parser/declaration-parser";

test('Parse expression as statement', () => {
    assertSuccess(parse("x", expressionAsStatement()), new ExprAsStmt(new Variable("x")), 1)
});

test('Parse block', () => {
    assertSuccess(parse("{ }", block()), [], 3)
    assertSuccess(parse("{ x }", block()), [new ExprAsStmt(new Variable("x"))], 5)
    assertFailure(parse("{ #unknown }", block()),  2)
});

test('Parse if statement', () => {
    assertSuccess(parse("if(1){ }", ifStatement()), new If(new IntConst(1), [], undefined), 8)
    assertSuccess(parse("if(1){ } else {}", ifStatement()), new If(new IntConst(1), [], []), 16)
    assertSuccess(parse("if(1){ } else if(2) {} else {}", ifStatement()), new If(new IntConst(1), [], new If(new IntConst(2), [], [])), 30)

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

test('Parse namespace', () => {

    const input = "namespace DeclarationAst {\n" +
        "\n" +
        "    class Declaration extends Statement\n" +
        "\n" +
        "    class CompilationUnit(ns: NameSpace, imports: Array[Import], statements: Array[Statement])\n" +
        "\n" +
        "    class Import(loc: Array[string])\n" +
        "\n" +
        "    class Namespace(name: string, statements: Array[Statement])\n" +
        "\n" +
        "    class Model extends Declaration\n" +
        "\n" +
        "    class ClassModel(\n" +
        "        name: string,\n" +
        "        modifiers: Array[Modifier],\n" +
        "        fields: Array[Field],\n" +
        "        parent: Type | undefined,\n" +
        "        parentArguments: Array[Expression],\n" +
        "        interfaces: Array[Type],\n" +
        "        statements: Array[Statement]\n" +
        "    ) extends Model\n" +
        "\n" +
        "    class Method (\n" +
        "        name: string,\n" +
        "        annotations: Array[Annotation],\n" +
        "        fields: Array[Field],\n" +
        "        modifiers: Array[Modifier],\n" +
        "        returnType: Type | undefined,\n" +
        "        statements: Array[Statement]\n" +
        "    ) extends Declaration\n" +
        "\n" +
        "    class Field(name: string, required: boolean, ref: Type, init?: Expression)\n" +
        "\n" +
        "    class Assign(\n" +
        "        name: string,\n" +
        "        type: Type | undefined,\n" +
        "        immutable: boolean,\n" +
        "        statement: Statement\n" +
        "    ) extends Declaration\n" +
        "\n" +
        "    class Reassign (name: string, statement: Statement) extends Statement\n" +
        "}"

    console.log(input.slice(436))
    console.log(parse(input, namespace()))

    //assertSuccess(parse(input, namespace()), undefined, 1)

    assertFailure(parse("namespace X { #unknown-syntax }", namespace()),  14)
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
