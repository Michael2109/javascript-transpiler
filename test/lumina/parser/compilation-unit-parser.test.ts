import {assertSuccess} from "./parser-test-utils";
import {StatementAst} from "../../../src/lumina/compiler/ast/statement-ast";
import {compilationUnit, statement} from "../../../src/lumina/parser/statement-parser";
import {ExpressionAst} from "../../../src/lumina/compiler/ast/expression-ast";
import CompilationUnit = StatementAst.CompilationUnit;
import Method = StatementAst.Method;

test('Parse function', () => {
    assertSuccess(compilationUnit().createParser(
            "let functionName(){}"),
        new CompilationUnit(
            {nameSpace: []},
            [],
            [new Method("functionName", [], [], [], undefined, [])]
        ), "")
});