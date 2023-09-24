import {capture, charIn, charsWhileIn, cut, digit, either, opt, P, rep, seq, str} from "../../parser/parser";
import {ExpressionAst} from "../ast/expression-ast";
import IntConst = ExpressionAst.IntConst;
import Variable = ExpressionAst.Variable;
import {DeclarationAst} from "../ast/declaration-ast";
import Reassign = DeclarationAst.Reassign;
import ABinary = ExpressionAst.ABinary;
import Add = ExpressionAst.Add;


const KEYWORDS: Array<string> = Array(
    "namespace","extends", "public", "protected", "private", "abstract", "open", "pure", "and", "del", "from", "not", "while",
    "as", "elif", "global", "or", "with",
    "assert", "else", "if", "pass", "yield",
    "break", "except", "import",
    "class", "exec", "in", "raise",
    "continue", "finally", "is", "return",
    "for", "lambda", "try", "mutable",
    "let"
)

function letter(): P<string> {
    return either(capture(charIn("a-z")), capture(charIn("A-Z")))
}

function keyword(s: string): P<void> {
    return capture(str(s)).filter(s => KEYWORDS.includes(s)).map(() => {
    })
}

function identifier(): P<string> {
    return seq(either(letter(), capture(str("_"))), rep(either(either(letter(), digit()), capture(str("_")))))
        .map(results => results[0] + results[1].join(""));
}

function stringLiteral(): P<string> {
    return seq(str("\""), cut(capture(charsWhileIn("a-z0-9\\s_-"))), str("\"")).map(result => result)
}

function integer(): P<IntConst> {
    return digit().map(result => new IntConst(+result))
}

function variable(): P<Variable> {
    return seq(identifier(), opt(capture(str("++")))).map(results => {
        const v = new Variable(results[0]);
        if(results[1].isPresent()){
            return new Reassign(v.name, new ABinary(new Add(), v,new IntConst(1)))
        }
        return  v
    })
}

export {letter, keyword, identifier, stringLiteral, integer, variable}