import {assertSuccess} from "./parser-test-utils";
import {DeclarationAst} from "../../../src/lumina/compiler/ast/declaration-ast";
import Namespace = DeclarationAst.Namespace;
import {namespace} from "../../../src/lumina/compiler/parser/declaration-parser";

test('Parse namespace', () => {

    assertSuccess(namespace().createParser(
            "namespace NamespaceName {}"),
        new Namespace(
            "NamespaceName",
            []
        ), "")
})
