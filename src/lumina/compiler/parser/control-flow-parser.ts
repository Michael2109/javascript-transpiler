import {ControlFlowAst} from "../ast/control-flow-ast";
import For = ControlFlowAst.For;
import {cut, P, seq, spaces, str} from "../../parser/parser";
import {keyword} from "./lexical-parser";
import {assign, block} from "./statement-parser";
import {booleanExpression, expressions} from "./expression-parser";



function forLoop(): P<For> {
   return  seq(
       cut(keyword("for")),
       spaces(),
       str("("),
       spaces(),
       assign(),
       spaces(),
       str(";"),
       spaces(),
        booleanExpression(),
       spaces(),
        str(";"),
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
               results[2],
               results[3]
           )
   })
}

export {forLoop}
