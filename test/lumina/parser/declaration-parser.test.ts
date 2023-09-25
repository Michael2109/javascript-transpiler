import {assertSuccess} from "./parser-test-utils";
import {DeclarationAst} from "../../../src/lumina/compiler/ast/declaration-ast";
import Namespace = DeclarationAst.Namespace;
import {lambda, namespace} from "../../../src/lumina/compiler/parser/declaration-parser";

import {parse} from "../../../src/lumina/parser/parser";
import Lambda = DeclarationAst.Lambda;
import Field = DeclarationAst.Field;
import {ExpressionAst} from "../../../src/lumina/compiler/ast/expression-ast";
import Type = ExpressionAst.Type;
import LocalType = ExpressionAst.LocalType;

beforeAll(() => {
    global.console = require('console')
})

test('Parse namespace', () => {

    assertSuccess(parse("namespace NamespaceName {}",namespace()),
        new Namespace(
            "NamespaceName",
            []
        ), 26)
})

test('Parse lambda', () => {

    assertSuccess(parse("() => {})",lambda()),
        new Lambda(
            [],
            []
        ), 8)

    assertSuccess(parse("(a: Int, b: Int) => {})",lambda()),
        new Lambda(
            [new Field(
                "a",
                true,
                new LocalType("Int")
            ),
                new Field(
                    "b",
                    true,
                    new LocalType("Int")
                )],
            []
        ), 22)
})
