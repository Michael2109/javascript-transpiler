import {digit, end, either, Parser, ParseResult, seq, str, rep, cut} from "../../../src/ethera/parser/parser";

import {assertFail, assertSuccess} from "./parser-test-utils";
import {keyword} from "../../../src/ethera/parser/lexical-parser";
import {methodCall, modifier} from "../../../src/ethera/parser/expression-parser";
import {Ast} from "../../../src/ethera/compiler/ast/ast";
import Public = Ast.Public;
import Protected = Ast.Protected;
import IntConst = Ast.IntConst;
import Private = Ast.Private;
import Open = Ast.Open;
import {block} from "../../../src/ethera/parser/statement-parser";

import BlockStmt = Ast.BlockStmt;
import CurlyBraceBlock = Ast.CurlyBraceBlock;


test('Parse block', () => {
    //assertSuccess(block().parserFn().parse("{ x }"), new CurlyBraceBlock([]), "")

});
