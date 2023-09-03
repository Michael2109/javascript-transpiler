import {capture, cut, eitherMany, P, rep, seq, spaces, str} from "./parser";
import {Ast} from "../compiler/ast/ast"
import {identifier, integer, keyword, variable} from "./lexical-parser";
import Modifier = Ast.Modifier;
import Public = Ast.Public;
import Protected = Ast.Protected;
import MethodCall = Ast.MethodCall;
import Expression = Ast.Expression;
import Private = Ast.Private;
import Abstract = Ast.Abstract;
import Open = Ast.Open;

const KEYWORDS: Array<string> = Array(
    "public", "and", "del", "from", "not", "while",
    "as", "elif", "global", "or", "with",
    "assert", "else", "if", "pass", "yield",
    "break", "except", "import",
    "class", "exec", "in", "raise",
    "continue", "finally", "is", "return",
    "for", "lambda", "try", "mutable",
    "let"
)

function expressionParser(): P<Expression> {
    return eitherMany<Expression>(methodCall(), integer(), variable())
}

function modifier(): P<Modifier> {
    return eitherMany(
        keyword("public").map(() => Public),
        keyword("protected").map(result => Protected),
        keyword("private").map(result => Private),
        keyword("abstract").map(result => Abstract),
        keyword("open").map(result => Open)
    )
}

function methodCall(): P<MethodCall> {
    return new P<Ast.MethodCall>(() => seq(
        identifier(),
        cut(capture(str("("))),
        spaces(),
        rep(expressionParser(), {sep: seq(spaces(), capture(str(",")), spaces())}),
        spaces(),
        capture(str(")"))
    )
        .map(result => ({
            name: result[0],
            expressions: result[2]
        })).createParser())
}

export {modifier, methodCall, expressionParser}