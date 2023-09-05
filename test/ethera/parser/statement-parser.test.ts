import {Ast} from "../../../src/ethera/compiler/ast/ast";
import {assertSuccess} from "./parser-test-utils";
import {block, ifStatement} from "../../../src/ethera/parser/statement-parser";
import CurlyBraceBlock = Ast.CurlyBraceBlock;
import ExprAsStmt = Ast.ExprAsStmt;
import Variable = Ast.Variable;
import If = Ast.If;
import IntConst = Ast.IntConst;


test('Parse block', () => {
    assertSuccess(block().createParser("{ }"), new CurlyBraceBlock([]), "")
    assertSuccess(block().createParser("{ x }"), new CurlyBraceBlock([new ExprAsStmt(new Variable("x"))]), "")
});

test('Parse if statement', () => {
    assertSuccess(ifStatement().createParser("if(1){ }"), new If(new IntConst(BigInt(1)), new CurlyBraceBlock([]), undefined), "")
});
