import {assertSuccess} from "./parser-test-utils";
import {compilationUnit} from "../../../src/lumina/compiler/parser/statement-parser";
import {DeclarationAst} from "../../../src/lumina/compiler/ast/declaration-ast";
import CompilationUnit = DeclarationAst.CompilationUnit;
import Method = DeclarationAst.Method;

import {parse} from "../../../src/lumina/parser/parser";

beforeAll(() => {
    global.console = require('console')
})

test('Parse function', () => {
    assertSuccess(parse("let functionName(){}",compilationUnit()),
        new CompilationUnit(
            {nameSpace: []},
            [],
            [new Method("functionName", [], [], [], undefined, [])]
        ), 20)
});