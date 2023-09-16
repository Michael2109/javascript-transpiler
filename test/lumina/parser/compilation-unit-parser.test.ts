import {assertSuccess} from "./parser-test-utils";
import {compilationUnit} from "../../../src/lumina/compiler/parser/statement-parser";
import {DeclarationAst} from "../../../src/lumina/compiler/ast/declaration-ast";
import CompilationUnit = DeclarationAst.CompilationUnit;
import Method = DeclarationAst.Method;

test('Parse function', () => {
    assertSuccess(compilationUnit().createParser(
            "let functionName(){}"),
        new CompilationUnit(
            {nameSpace: []},
            [],
            [new Method("functionName", [], [], [], undefined, [])]
        ), "")
});