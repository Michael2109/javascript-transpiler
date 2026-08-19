import {
    capture,
    charIn,
    charsWhileIn,
    charWhile,
    cut,
    digit,
    either,
    label,
    opt,
    P,
    quiet,
    rep,
    seq,
    str,
    until
} from "../../parser/parser";
import {ExpressionAst} from "../ast/expression-ast";
import IntConst = ExpressionAst.IntConst;
import Variable = ExpressionAst.Variable;
import {DeclarationAst} from "../ast/declaration-ast";
import Reassign = DeclarationAst.Reassign;
import ABinary = ExpressionAst.ABinary;
import Add = ExpressionAst.Add;


const KEYWORDS: Array<string> = Array(
    "println","do","extends", "public", "protected", "private", "abstract", "open", "pure", "and", "del", "from", "not", "while",
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

/**
 * Whitespace and comments.
 *
 * Comments are handled here rather than by any grammar rule: treating them as a
 * kind of whitespace means no other rule ever has to know they exist.
 */

function lineComment(): P<void> {
    return seq(str("//"), charWhile(character => character !== "\n")).map(() => undefined)
}

function blockComment(): P<void> {
    return seq(str("/*"), until("*/"))
}

function comment(): P<void> {
    return either(lineComment(), blockComment())
}

/**
 * At least one whitespace character. Required so that `spaces` can repeat
 * without looping on a parser that matches the empty string.
 */
function whitespaceRun(): P<void> {
    return capture(charsWhileIn(" \r\n\t")).filter(characters => characters.length > 0).map(() => undefined)
}

/**
 * Any run of whitespace and comments. Replaces the combinator library's
 * `spaces()` throughout the Lumina grammar.
 */
function spaces(required?: boolean): P<void> {
    return quiet(
        rep(either(whitespaceRun(), comment()), {min: required ? 1 : 0}).map(() => undefined)
    )
}

/**
 * Whitespace and comments up to, but not including, the end of the line.
 *
 * `\r` counts as inline so that CRLF endings leave the `\n` for the statement
 * separator to match.
 */
function inlineWhitespaceRun(): P<void> {
    return capture(charsWhileIn(" \t\r")).filter(characters => characters.length > 0).map(() => undefined)
}

function inlineSpaces(): P<void> {
    return quiet(rep(either(inlineWhitespaceRun(), comment())).map(() => undefined))
}

/**
 * What separates two statements: a newline or a `;`, in any combination, with
 * blank lines and comments allowed around them.
 *
 * Statement rules must not consume their own trailing whitespace, or they eat
 * the newline this depends on.
 */
function statementSeparator(): P<void> {
    return label(`newline or ";"`,
        seq(
            inlineSpaces(),
            rep(seq(either(str(";"), str("\n")), inlineSpaces()), {min: 1})
        ).map(() => undefined)
    )
}

/**
 * A trailing separator before a closing brace or end of file.
 *
 * Maps to `void` rather than `Optional` so that `seq` filters it out and the
 * shape of the surrounding rule is unchanged.
 */
function optionalStatementSeparator(): P<void> {
    return opt(statementSeparator()).map(() => undefined)
}

function keyword(s: string): P<void> {
    return capture(str(s)).filter(s => KEYWORDS.includes(s)).map(() => {
    })
}

function identifier(): P<string> {
    return label("identifier",
        seq(either(letter(), capture(str("_"))), rep(either(either(letter(), digit()), capture(str("_")))))
            .map(results => results[0] + results[1].join("")));
}

function stringLiteral(): P<string> {
    return seq(str("\""), cut(capture(charsWhileIn("a-z0-9\\s_-"))), str("\"")).map(result => result)
}

function integer(): P<IntConst> {
    return label("number", digit().map(result => new IntConst(+result)))
}

function variable(): P<Variable> {
    return identifier().map(results => {
       return  new Variable(results);
    })
}

export {letter, keyword, identifier, stringLiteral, integer, variable, spaces, inlineSpaces, comment, statementSeparator, optionalStatementSeparator}