import {Ast} from "../../../src/ethera/compiler/ast/ast";
import {assertSuccess} from "./parser-test-utils";
import {block} from "../../../src/ethera/parser/statement-parser";
import CurlyBraceBlock = Ast.CurlyBraceBlock;
import ExprAsStmt = Ast.ExprAsStmt;
import Variable = Ast.Variable;


test('Parse block', () => {
    assertSuccess(block().createParser().parse("{ x }"), new CurlyBraceBlock([new ExprAsStmt(new Variable("x"))]), "")

});
