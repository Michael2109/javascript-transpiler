import {capture, charIn, charsWhileIn, cut, digit, either, P, rep, seq, str} from "./parser";
import {Ast} from "../compiler/ast/ast";
import IntConst = Ast.IntConst;
import Variable = Ast.Variable;


const KEYWORDS: Array<string> = Array(
    "public", "protected", "private", "abstract", "open", "pure", "and", "del", "from", "not", "while",
    "as", "elif", "global", "or", "with",
    "assert", "else", "if", "pass", "yield",
    "break", "except", "import",
    "class", "exec", "in", "raise",
    "continue", "finally", "is", "return",
    "for", "lambda", "try", "mutable",
    "let"
)


function letter(): P<string> {
    return either(charIn("a-z"), charIn("A-Z"))
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
    return seq(str("\""), cut(charsWhileIn("a-z0-9\\s_-")), str("\"")).map(result => result)
}

function integer(): P<IntConst> {
    return digit().map(result => new IntConst(BigInt(+result)))
}

function variable(): P<Variable> {
    return identifier().map(result => new Variable(result))
}

export {letter, keyword, identifier, stringLiteral, integer, variable}