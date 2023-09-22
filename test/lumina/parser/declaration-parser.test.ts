import {assertSuccess} from "./parser-test-utils";
import {DeclarationAst} from "../../../src/lumina/compiler/ast/declaration-ast";
import Namespace = DeclarationAst.Namespace;
import {namespace} from "../../../src/lumina/compiler/parser/declaration-parser";

import {parse} from "../../../src/lumina/parser/parser";

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
