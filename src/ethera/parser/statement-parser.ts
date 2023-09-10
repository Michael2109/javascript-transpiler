import {cut, either, eitherMany, lazy, opt, P, regex, rep, seq, spaces, str} from "./parser";
import {Ast} from "../compiler/ast/ast"
import {expressionParser} from "./expression-parser";
import {identifier, keyword} from "./lexical-parser";
import CurlyBraceBlock = Ast.CurlyBraceBlock;
import Statement = Ast.Statement;
import ExprAsStmt = Ast.ExprAsStmt;
import BlockStmt = Ast.BlockStmt;
import Expression = Ast.Expression;
import If = Ast.If;
import Method = Ast.Method;
import Field = Ast.Field;
import Ref = Ast.Ref;
import RefLocal = Ast.RefLocal;
import ClassModel = Ast.ClassModel;

function classParser(): P<ClassModel> {

    return seq(
        spaces(),
        keyword("class"),
        spaces(),
        identifier(),
        spaces(),
        block()
    )
        .map(results => new ClassModel(
            results[0],
            [],
            [],
            undefined,
            [],
            [],
            results[1].statements
        ))
}

function method(): P<Method> {
    return seq(
        keyword("let"),
        spaces(),
        identifier(),
        spaces(),
        cut(str("(")),
        spaces(),
        rep(field(), {sep: seq(spaces(), str(","), spaces())}),
        str(")"),
        spaces(),
        opt(
            seq(str(":"), spaces(), typeRef())
        ),
        spaces(),
        block())
        .map(result => new Method(result[0], [], result[1], [], result[2].get(), result[3])
        )
}

function field(): P<Field> {
    return seq(
        identifier(),
        spaces(),
        str(":"),
        spaces(),
        typeRef()
    ).map(results => new Field(results[0], results[1]))
}

function comment(): P<void> {

    function blockComment(): P<void> {
        return seq(
            cut(str("/*")),
            regex(/(\*(?!\/)|[^*])*\*\//)
        )
    }

    return blockComment()
}


function typeRef(): P<Ref> {
    return identifier().map(x => new RefLocal(x))
}

function ifStatement(): P<If> {
    function ifParser(): P<[Expression, Statement]> {
        return seq(keyword("if"), spaces(), str("("), spaces(), expressionParser(), spaces(), str(")"), block()).map(result => result)
    }

    function elseParser(): P<Statement> {
        return lazy(() => either(
            seq(elifP(), opt(elseParser())).map(result => new If(result[0][0], result[0][1], result[1].get())),
            elseP())
        )
    }

    function elifP(): P<[Expression, Statement]> {
        return seq(spaces(), keyword("else"), spaces(), keyword("if"), spaces(), cut(str("(")), spaces(), expressionParser(), spaces(), str(")"), block())
    }

    function elseP(): P<Statement> {
        return seq(spaces(), keyword("else"), block())
    }

    return seq(ifParser(), opt(elseParser())).map(result => {
        return new If(result[0][0], result[0][1], result[1].get())
    })
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

export {block, ifStatement, method, field, typeRef, comment, classParser}