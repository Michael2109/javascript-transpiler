import {assertSuccess} from "./parser-test-utils";
import {compilationUnit, statement} from "../../../src/lumina/parser/statement-parser";
import {Ast} from "../../../src/lumina/compiler/ast/ast";
import CompilationUnit = Ast.CompilationUnit;
import Method = Ast.Method;

test('Parse function', () => {
    assertSuccess(compilationUnit().createParser(
            "let functionName(){}"),
        new CompilationUnit(
            {nameSpace: []},
            [],
            [new Method("functionName", [], [], [], undefined, [])]
        ), "")
});