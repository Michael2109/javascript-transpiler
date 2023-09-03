import {
    capture,
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
import Modifier = Ast.Modifier;
import {identifier, integer, keyword} from "./lexical-parser";
import Public = Ast.Public;
import Protected = Ast.Protected;
import MethodCall = Ast.MethodCall;
import Expression = Ast.Expression;
import Private = Ast.Private;
import PackageLocal = Ast.PackageLocal;
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

function expressionParser():LazyParser<Expression> {
    return eitherMany<Expression>(methodCall(), integer())
}

function modifier(): LazyParser<Modifier> {
    return eitherMany(
        keyword("public").map(() => Public),
        keyword("protected").map(result => Protected),
        keyword("private").map(result => Private),
        keyword("abstract").map(result => Abstract),
        keyword("open").map(result => Open)
    )
}

function methodCall(): LazyParser<MethodCall> {
    return new LazyParser<Ast.MethodCall>(() => seq(
            identifier(),
            cut(capture(str("("))),
            spaces(),
            rep(expressionParser(), {sep: seq(spaces(),capture(str(",")), spaces())}),
            spaces(),
        capture(str(")"))
        )
        .map(result => ({
            name: result[0],
            expressions: result[2]
        })).parserFn())
}

export {modifier, methodCall, expressionParser}