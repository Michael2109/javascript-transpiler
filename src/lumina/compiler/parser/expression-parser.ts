import {
    capture,
    charIn,
    charsWhileIn, charWhile,
    cut,
    either,
    eitherMany,
    lazy,
    opt,
    P,
    rep,
    seq,
    spaces,
    str
} from "../../parser/parser";
import {ExpressionAst} from "../ast/expression-ast"
import {identifier, integer, keyword, variable} from "./lexical-parser";
import Modifier = ExpressionAst.Modifier;
import Public = ExpressionAst.Public;
import Protected = ExpressionAst.Protected;
import MethodCall = ExpressionAst.MethodCall;
import Expression = ExpressionAst.Expression;
import Private = ExpressionAst.Private;
import Abstract = ExpressionAst.Abstract;
import Open = ExpressionAst.Open;
import Subtract = ExpressionAst.Subtract;
import Add = ExpressionAst.Add;
import Divide = ExpressionAst.Divide;
import Multiply = ExpressionAst.Multiply;
import ABinOp = ExpressionAst.ABinOp;
import ABinary = ExpressionAst.ABinary;
import RBinOp = ExpressionAst.RBinOp;
import RBinary = ExpressionAst.RBinary;
import Operator = ExpressionAst.Operator;
import And = ExpressionAst.And;
import Or = ExpressionAst.Or;
import GreaterEqual = ExpressionAst.GreaterEqual;
import Greater = ExpressionAst.Greater;
import LessEqual = ExpressionAst.LessEqual;
import Less = ExpressionAst.Less;
import Range = ExpressionAst.Range;
import {lambda} from "./declaration-parser";
import Postfix = ExpressionAst.Postfix;
import {Optional} from "../../parser/optional";
import PostfixOperator = ExpressionAst.PostfixOperator;
import Increment = ExpressionAst.Increment;
import Decrement = ExpressionAst.Decrement;
import StringLiteral = ExpressionAst.StringLiteral;
import NewClassInstance = ExpressionAst.NewClassInstance;
import LocalType = ExpressionAst.LocalType;

function expressions(): P<Expression> {
    return postfix(booleanExpression());
}


function expressionParser(): P<Expression> {
    return lazy(() => postfix(eitherMany<Expression>(
        newClassInstance(),
        stringLiteral(),
        lambda(),
        range(),
        integer(),
        variable(),
        parenthesis()))
    )
}

function range(): P<Range> {
    return seq(integer(), str(".."), integer()).map(results => new Range(results[0], results[1]))
}

function stringLiteral(): P<StringLiteral> {
    return seq(
        cut(str("\"")),
        charWhile(char => char !== "\""),
        str("\""))
        .map(result => new StringLiteral(result))
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

function newClassInstance(): P<NewClassInstance>{
    return seq(
        cut(str("new")),
        spaces(true),
        identifier(),
        spaces(),
        str("("),
        rep(expressionParser(), {sep: seq(spaces(), str(","), spaces())}),
        str(")")
    ).map(results =>
        new ExpressionAst.NewClassInstance(
            new LocalType(results[0]),
            results[1]
        ))
}

function postfix(parser: P<Expression>): P<Expression> {
    return seq(parser, opt(eitherMany(methodCall(), increment(), decrement()))).map(results => {
            const postfixSection = results[1].get()

            if (postfixSection) {
                return new Postfix(results[0], postfixSection)
            }

            return results[0]
        }
    )
}

function methodCall(): P<MethodCall> {

    return lazy(() =>
        seq(
            cut(capture(str("("))),
            spaces(),
            rep(expressionParser(), {sep: seq(spaces(), capture(str(",")), spaces())}),
            spaces(),
            capture(str(")"))
        )
            .map<MethodCall>(result => new MethodCall(result[1]))
    )
}

function increment(): P<Increment> {
    return  capture(str("++"))
        .map(result => new Increment())
}

function decrement(): P<Decrement> {
    return  capture(str("--"))
        .map(result => new Decrement())
}


/**
 * Arithmetic
 */

/*
Expr    ← Sum
Sum     ← Product (('+' / '-') Product)*
Product ← Value (('*' / '/') Value)*
Value   ← [0-9]+ / '(' Expr ')'
 */
function chain(parser1: P<Expression>, operatorParser1: P<Operator>, operatorParser2: P<Operator>): P<Expression> {
    return seq(parser1, rep(seq(spaces(), eitherMany<Operator>(operatorParser1, operatorParser2), spaces(), parser1)))
        .map(results => {
            const lhs = results[0]
            const rhs = results[1]

            if (rhs.length > 0) {

                let r: ABinary
                rhs.forEach(rhsResults => {

                    const expression = r === undefined ? lhs : r;
                    const operator = rhsResults[0]

                    if (operator instanceof ABinOp) {
                        r = new ABinary(operator, expression, rhsResults[1])
                    } else if (operator instanceof RBinOp) {
                        r = new RBinary(operator, expression, rhsResults[1])
                    } else {
                        throw new Error("Unknown operator: " + operator)
                    }

                })

                // @ts-ignore
                return r;
            }
            return lhs
        })
}

function booleanExpression(): P<Expression> {
    return chain(greaterThanEqualGreaterThan(), and(), or())
}

function greaterThanEqualGreaterThan(): P<Expression> {
    return chain(lessThanEqualLessThan(), greaterEqual(), greater())
}

function lessThanEqualLessThan(): P<Expression> {
    return chain(arithmeticExpression(), lessEqual(), less())
}

function arithmeticExpression(): P<Expression> {
    return chain(multiplyDivide(), add(), subtract())
}

function multiplyDivide(): P<Expression> {
    return chain(value(), multiply(), divide())
}

function value(): P<Expression> {
    return either(expressionParser(), parenthesis())
}

function and(): P<And> {
    return str("&&").map(_ => new And())
}

function or(): P<Or> {
    return str("||").map(_ => new Or())
}

function greaterEqual(): P<GreaterEqual> {
    return str(">=").map(_ => new GreaterEqual())
}

function greater(): P<Greater> {
    return str(">").map(_ => new Greater())
}

function lessEqual(): P<LessEqual> {
    return str("<=").map(_ => new LessEqual())
}

function less(): P<Less> {
    return str("<").map(_ => new Less())
}

function multiply(): P<Multiply> {
    return str("*").map(_ => new Multiply())
}

function divide(): P<Divide> {
    return str("/").map(_ => new Divide())
}

function add(): P<Add> {
    return str("+").map(_ => new Add())
}

function subtract(): P<Subtract> {
    return str("-").map(_ => new Subtract())
}

function parenthesis(): P<Expression> {
    return lazy(() => seq(
        str("("),
        spaces(),
        expressions(),
        spaces(),
        str(")")
    ))
}

export {expressions, modifier, methodCall, expressionParser, multiply, divide, add, subtract, parenthesis, chain, booleanExpression, range, postfix}