import {assertSuccess} from "./parser-test-utils";
import {DeclarationAst} from "../../../src/lumina/compiler/ast/declaration-ast";

import {parse} from "../../../src/lumina/parser/parser";
import {ControlFlowAst} from "../../../src/lumina/compiler/ast/control-flow-ast";
import {forLoop} from "../../../src/lumina/compiler/parser/control-flow-parser";
import For = ControlFlowAst.For;
import Assign = DeclarationAst.Assign;
import {ExpressionAst} from "../../../src/lumina/compiler/ast/expression-ast";
import IntConst = ExpressionAst.IntConst;
import {StatementAst} from "../../../src/lumina/compiler/ast/statement-ast";
import ExprAsStmt = StatementAst.ExprAsStmt;
import BBinary = ExpressionAst.BBinary;
import Add = ExpressionAst.Add;
import Less = ExpressionAst.Less;
import Variable = ExpressionAst.Variable;
import Reassign = DeclarationAst.Reassign;
import ABinary = ExpressionAst.ABinary;
import RBinary = ExpressionAst.RBinary;

beforeAll(() => {
    global.console = require('console')
})

test('Parse for loop', () => {

    assertSuccess(
        parse("for(let mutable x = 0; x < 10; x++){}", forLoop()),
        new For(
            new Assign("x", undefined, false, new ExprAsStmt(new IntConst(0))),
            new RBinary(new Less(), new Variable("x"), new IntConst(10)),
            new Reassign("x",  new ABinary(new Add(), new Variable("x"),new IntConst(1))),
            []),
        37)
})
