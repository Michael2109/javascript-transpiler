import {
    charIn,
    charsWhileIn,
    cut,
    digit,
    either,
    eitherMany,
    LazyParser,
    Parser,
    rep,
    seq,
    spaces,
    str
} from "./parser";
import {Ast} from "../compiler/ast/ast"
import If = Ast.If;
import Expression = Ast.Expression;
import {keyword} from "./lexical-parser";
import {expressionParser} from "./expression-parser";
import Block = Ast.Block;
import CurlyBraceBlock = Ast.CurlyBraceBlock;
import Statement = Ast.Statement;
import ExprAsStmt = Ast.ExprAsStmt;
import BlockStmt = Ast.BlockStmt;



/*function ifStatement(): Parser<If> {
    function ifParser(): Parser<(Expression, Statement)> {
        return seq(keyword("if"), spaces(), str("("), spaces(), expressionParser(), spaces(), str(")"), spaces()).map(result => result)
    }



}*/

function block(): LazyParser<BlockStmt> {
    // TODO Should repeat by either a semi-colon or a newline
    return seq(spaces(), str("{"), spaces(), rep(statement(),{sep: spaces()}), spaces())
        .map(result => new CurlyBraceBlock(result))
}

function statement(): LazyParser<Statement> {
    return eitherMany(expressionAsStatement())
}

function expressionAsStatement(): LazyParser<ExprAsStmt> {
    return seq(spaces(), expressionParser(), spaces()).map(result => new ExprAsStmt(result))
}

export { block }