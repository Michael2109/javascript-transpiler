import {cut, either, eitherMany, lazy, opt, P, rep, seq, spaces, str} from "./parser";
import {Ast} from "../compiler/ast/ast"
import {expressionParser} from "./expression-parser";
import {keyword} from "./lexical-parser";
import CurlyBraceBlock = Ast.CurlyBraceBlock;
import Statement = Ast.Statement;
import ExprAsStmt = Ast.ExprAsStmt;
import BlockStmt = Ast.BlockStmt;
import Expression = Ast.Expression;
import If = Ast.If;

function ifParser(): P<[Expression, Statement]> {
    return seq(keyword("if"), spaces(), str("("), spaces(), expressionParser(), spaces(), str(")"), block()).map(result => result)
}


function ifStatement(): P<If> {
    function ifParser(): P<[Expression, Statement]> {
        return seq(keyword("if"), spaces(), str("("), spaces(), expressionParser(), spaces(), str(")"), block()).map(result => result)
    }

    function elseParser(): P<Statement> {
        return lazy(() =>either(seq(elifP(), opt(elseParser())).map(result => {

                    return  new If(result[0][0], result[0][1], result[1].get())

            }
        ), elseP()))
    }

    function elifP(): P<[Expression, Statement]> {
        return seq(spaces(), keyword("else"), spaces(), keyword("if"), spaces(), cut(str("(")), spaces(), expressionParser(), spaces(), str(")"), block())
    }

    function elseP(): P<Statement> {
        return seq( spaces(),keyword("else"), block())
    }

    return seq(ifParser(), opt(elseParser())).map(result => {
                return  new If(result[0][0], result[0][1], result[1].get())
        }    )

    /**
     *     def ifParser[$: P]: P[(Expression, Statement)] = P(LexicalParser.keyword("if") ~ space  ~/  "(" ~/ space ~ ExpressionParser.expressionParser ~ space ~ ")" ~ space ~/ block).map(x => (x._1, x._2))
     *
     *     def elseParser[$: P]: P[Statement] = P(elifP ~ elseParser.?).map(x => If(x._1, x._2, x._3)) | P(elseP)
     *
     *     def elifP[$: P]: P[(Expression, Statement)] = P(LexicalParser.keyword("else") ~ LexicalParser.keyword("if") ~/ "(" ~ ExpressionParser.expressionParser ~ ")" ~ block).map(x => (x._1, x._2))
     *
     *     def elseP[$: P]: P[Statement] = P(LexicalParser.keyword("else") ~/ block).map(x => x)
     *     P(ifParser ~ elseParser.?).map(x => If(x._1, x._2, x._3)).log
     */

}

function block(): P<BlockStmt> {
    // TODO Should repeat by either a semi-colon or a newline
    return seq(spaces(), str("{"), spaces(), rep(statement(), {sep: spaces()}), spaces(), str("}"))
        .map(result => new CurlyBraceBlock(result))
}

function statement(): P<Statement> {
    return eitherMany(expressionAsStatement())
}

function expressionAsStatement(): P<ExprAsStmt> {
    return seq(spaces(), expressionParser(), spaces()).map(result => new ExprAsStmt(result))
}

export {block, ifStatement, ifParser}