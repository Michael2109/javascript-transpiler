import {ControlFlowAst} from "../ast/control-flow-ast";
import For = ControlFlowAst.For;
import {cut, P, seq, spaces, str} from "../../parser/parser";
import {identifier, keyword, variable} from "./lexical-parser";
import {assign, block} from "./statement-parser";
import {booleanExpression, expressions} from "./expression-parser";
import While = ControlFlowAst.While;
import DoWhile = ControlFlowAst.DoWhile;

function doWhileLoop(): P<While> {
    return  seq(
        cut(keyword("do")),
        spaces(),
        block(),
        spaces(),
        str("while"),
        spaces(),
        str("("),
        spaces(),
        booleanExpression(),
        spaces(),
        str(")")
    ).map(results => {
        return new DoWhile(
            results[1],
            results[0]
        )
    })
}

function whileLoop(): P<While> {
    return  seq(
        cut(keyword("while")),
        spaces(),
        str("("),
        spaces(),
        booleanExpression(),
        spaces(),
        str(")"),
        spaces(),
        block()
    ).map(results => {
        return new While(
            results[0],
            results[1]
        )
    })
}

function forLoop(): P<For> {
   return  seq(
       cut(keyword("for")),
       spaces(),
       str("("),
       spaces(),
       identifier(),
       spaces(),
       str("in"),
       spaces(),
       expressions(),
       spaces(),
       str(")"),
       spaces(),
           block()
       ).map(results => {
           return new For(
               results[0],
               results[1],
               results[2]
           )
   })
}

export {forLoop, whileLoop, doWhileLoop}
