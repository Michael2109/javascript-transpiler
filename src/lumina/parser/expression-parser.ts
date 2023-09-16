import {capture, cut, either, eitherMany, lazy, P, rep, seq, spaces, str} from "./parser";
import {ExpressionAst} from "../compiler/ast/expression-ast"
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

function expressions(): P<Expression> {
    return addSubtract();
}


function expressionParser(): P<Expression> {
    return lazy(() => eitherMany<Expression>(methodCall(), integer(), variable(), parenthesis()))
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

    return lazy(() =>
        seq(
            identifier(),
            cut(capture(str("("))),
            spaces(),
            rep(expressionParser(), {sep: seq(spaces(), capture(str(",")), spaces())}),
            spaces(),
            capture(str(")"))
        )
            .map<MethodCall>(result => new MethodCall(result[0], result[2]))
    )
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

                    if(operator instanceof ABinOp){
                        r = new ABinary(operator, expression, rhsResults[1])
                    }else if(operator instanceof RBinOp){
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

function addSubtract(): P<Expression> {
    return chain(multiplyDivide(), add(), subtract())
}

function multiplyDivide(): P<Expression> {
    return chain(value(), multiply(), divide())
}

function value(): P<Expression> {
    return either(expressionParser(), parenthesis())
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

export {expressions, modifier, methodCall, expressionParser, multiply, divide, add, subtract, parenthesis}