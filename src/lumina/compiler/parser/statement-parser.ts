import {capture, cut, either, eitherMany, end, lazy, opt, P, regex, rep, seq, spaces, str} from "../../parser/parser";
import {ExpressionAst} from "../ast/expression-ast"
import {expressionParser, expressions} from "./expression-parser";
import {identifier, keyword} from "./lexical-parser";

import {DeclarationAst} from "../ast/declaration-ast";
import {StatementAst} from "../ast/statement-ast";
import {ControlFlowAst} from "../ast/control-flow-ast";

import Expression = ExpressionAst.Expression;
import Ref = ExpressionAst.Type;
import RefLocal = ExpressionAst.LocalType;

import If = ControlFlowAst.If;
import Method = DeclarationAst.Method;
import Field = DeclarationAst.Field;
import Statement = StatementAst.Statement;
import ExprAsStmt = StatementAst.ExprAsStmt;
import ClassModel = DeclarationAst.ClassModel;
import CompilationUnit = DeclarationAst.CompilationUnit;
import Assign = DeclarationAst.Assign;
import Reassign = DeclarationAst.Reassign;
import Import = DeclarationAst.Import;
import LocalType = ExpressionAst.LocalType;
import Namespace = DeclarationAst.Namespace;
import {namespace} from "./declaration-parser";

function compilationUnit(): P<CompilationUnit> {
    return seq(rep(statement()), end()).map(results => new CompilationUnit(
        {nameSpace: []},
        [],
        results
    ))
}

function importParser(): P<Import> {
    // import {variable} from "./lexical-parser";
    return seq(
        keyword("import"),
        spaces(),
        rep(identifier(), {sep: seq(spaces(), str("."), spaces())})
    )
        .map(results => new Import(results))
}


function statement(): P<Statement> {
    return lazy(() =>
        eitherMany<Statement>(namespace(), classParser(), method(), assign(), reassign(), expressionAsStatement())
    )
}

function classParser(): P<ClassModel> {

    return seq(
        spaces(),
        keyword("class"),
        spaces(),
        identifier(),
        spaces(),
        opt(
            seq(
                str("("),
                rep(field(), {sep: seq(spaces(), str(","), spaces())}),
                str(")"),
                spaces()
            )
        ),
        opt(seq(
                keyword("extends"),
                spaces(),
                identifier()
            )
        ),
        opt(block())
    )
        .map(results => {

            const fields = results[1].get();
            const parent = results[2].get()
            const statements = results[3].get()

            return new ClassModel(
                results[0],
                [],
                fields === undefined ? [] : fields,
                parent ? new LocalType(parent) : undefined,
                [],
                [],
                statements ? statements : []
            )
        })
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
        opt(keyword("let")),
        spaces(),
        identifier(),
        spaces(),
        opt(capture(str("?"))),
        spaces(),
        str(":"),
        spaces(),
        typeRef()
    ).map(results => new Field(results[1], !results[2].isPresent(), results[3]))
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
    return seq(
        identifier(),
        opt(
            seq(
                spaces(),
                str("["),
                spaces(),
                identifier(),
                spaces(),
                str("]"))
        )
    ).map(x => new RefLocal(x[0]))
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

function block(): P<Array<Statement>> {
    // TODO Should repeat by either a semi-colon or a newline
    return seq(spaces(), str("{"), spaces(), rep(statement(), {sep: spaces()}), spaces(), str("}"), spaces())
        .map(result => result)
}

function assign(): P<Assign> {
    return seq(
        str("let"),
        spaces(),
        identifier(),
        spaces(),
        opt(seq(
            str(":"),
            spaces(),
            typeRef(),
            spaces()
        )),
        str("="),
        statement()
    ).map(results => new Assign(
            results[0],
            results[1].get(),
            true,
            results[2]
        )
    )
}

function reassign(): P<Reassign> {
    return seq(
        spaces(),
        identifier(),
        spaces(),
        str("<-"),
        statement()
    ).map(results => new Reassign(
            results[0],
            results[1]
        )
    )
}


function expressionAsStatement(): P<ExprAsStmt> {
    return seq(spaces(), expressions(), spaces()).map(result => new ExprAsStmt(result))
}

export {compilationUnit, block, ifStatement, method, field, typeRef, comment, classParser, assign, reassign, statement}