import {assertSuccess} from "./parser-test-utils";
import {DeclarationAst} from "../../../src/lumina/compiler/ast/declaration-ast";

import {parse} from "../../../src/lumina/parser/parser";
import {ControlFlowAst} from "../../../src/lumina/compiler/ast/control-flow-ast";
import {doWhileLoop, forLoop, whileLoop} from "../../../src/lumina/compiler/parser/control-flow-parser";
import {ExpressionAst} from "../../../src/lumina/compiler/ast/expression-ast";
import {StatementAst} from "../../../src/lumina/compiler/ast/statement-ast";
import For = ControlFlowAst.For;
import Variable = ExpressionAst.Variable;
import Range = ExpressionAst.Range;
import IntConst = ExpressionAst.IntConst;
import DoWhile = ControlFlowAst.DoWhile;
import While = ControlFlowAst.While;

beforeAll(() => {
    global.console = require('console')
})

test('Parse do while loop', () => {

    assertSuccess(
        parse("do {} while(condition)", doWhileLoop()),
        new DoWhile(
            new Variable("condition"),
            []),
        22)
})

test('Parse while loop', () => {

    assertSuccess(
        parse("while(condition) {}", whileLoop()),
        new While(
            new Variable("condition"),
            []),
        19)
})

test('Parse for loop', () => {

    assertSuccess(
        parse("for(i in x){}", forLoop()),
        new For(
            "i",
            new Variable("x"),
            []),
        13)

    assertSuccess(
        parse("for(i in 1..3){}", forLoop()),
        new For(
            "i",
            new Range(
                new IntConst(1),
                new IntConst(3)
            ),
            []),
        16)
})
