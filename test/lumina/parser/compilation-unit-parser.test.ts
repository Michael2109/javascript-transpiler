import {assertSuccess} from "./parser-test-utils";
import {compilationUnit} from "../../../src/lumina/parser/statement-parser";
import {DeclarationsAst} from "../../../src/lumina/compiler/ast/declarations-ast";
import CompilationUnit = DeclarationsAst.CompilationUnit;
import Method = DeclarationsAst.Method;

test('Parse function', () => {
    assertSuccess(compilationUnit().createParser(
            "let functionName(){}"),
        new CompilationUnit(
            {nameSpace: []},
            [],
            [new Method("functionName", [], [], [], undefined, [])]
        ), "")
});