import {ExpressionIr} from "../ir/expression-ir";
import {DeclarationIr} from "../ir/declaration-ir";
import {CodeGenerator} from "./statement-to-code";
import {str} from "../../parser/parser";
import {StatementIr} from "../ir/statement-ir";

namespace ExpressionToCode {

    import MethodCall = ExpressionIr.MethodCall;
    import Increment = ExpressionIr.Increment;
    import Decrement = ExpressionIr.Decrement;

    export function expressionToCode(expression: ExpressionIr.Expression): string {
        switch (expression.constructor) {
            case ExpressionIr.IntConst:
                return intConstToCode(expression as ExpressionIr.IntConst)
            case ExpressionIr.ABinary:
                return aBinaryToCode(expression as ExpressionIr.ABinary)
            case ExpressionIr.Postfix:
                return postfixToCode(expression as ExpressionIr.Postfix)
            case ExpressionIr.Variable:
                return variableToCode(expression as ExpressionIr.Variable)
            case ExpressionIr.StringLiteral:
                return stringLiteralToCode(expression as ExpressionIr.StringLiteral)
            case ExpressionIr.Lambda:
                return lambdaToCode(expression as ExpressionIr.Lambda)
            case ExpressionIr.NewClassInstance:
                return  newClassInstanceToCode(expression as ExpressionIr.NewClassInstance)
            default:
                throw new Error("Not found: " + JSON.stringify(expression))
        }
    }

    export function aBinaryToCode(aBinary: ExpressionIr.ABinary): string {
        return expressionToCode(aBinary.expression1) + opToCode(aBinary.op) + expressionToCode(aBinary.expression2)
    }

    export function opToCode(operator: ExpressionIr.Operator): string {
        switch (operator.constructor) {
            case ExpressionIr.Add:
                return "+"
            case ExpressionIr.Subtract:
                return "-"
            case ExpressionIr.Multiply:
                return "*"
            case ExpressionIr.Divide:
                return "/"
            default:
                throw new Error("Unknown operator: " + operator)
        }
    }

    export function intConstToCode(intConst: ExpressionIr.IntConst): string {
        return intConst.value.toString()
    }


    function postfixToCode(postfix: ExpressionIr.Postfix): string {
        return expressionToCode(postfix.expression) + postfixOperatorToCode(postfix.operator)
    }

    function variableToCode(variable: ExpressionIr.Variable): string {
        return variable.name
    }

    function stringLiteralToCode(stringLiteral: ExpressionIr.StringLiteral): string {
        return "\"" + stringLiteral.value + "\""
    }

    function lambdaToCode(lambda: ExpressionIr.Lambda): string {
        return "("+ lambda.fields.map(fieldToCode) + ")=>{" + lambda.statements.map(CodeGenerator.statementToCode)  + "}"
    }

    function fieldToCode(field: DeclarationIr.Field): string {
        return field.name
    }

    function newClassInstanceToCode(newClassInstance: ExpressionIr.NewClassInstance): string {
        return "new " + typeToCode(newClassInstance.type) + "(" + newClassInstance.expressions.map(expressionToCode).join(",") +  ")"
    }

    function typeToCode(type: StatementIr.Type): string {
        switch (type.constructor){
            case StatementIr.LocalType:
                return (type as StatementIr.LocalType).name
            default:
                throw new Error("Type not found: " + type.constructor)
        }
    }

    function postfixOperatorToCode(postfixOperator: ExpressionIr.PostfixOperator): string {
        switch (postfixOperator.constructor){
            case  ExpressionIr.MethodCall:
                return "(" + (postfixOperator as ExpressionIr.MethodCall).args.map(expressionToCode) + ")"
            case  ExpressionIr.Increment:
                return "++"
            case  ExpressionIr.Decrement:
                return "--"
            default:
                throw new Error("Postfix operator not found: " + postfixOperator.constructor)
        }
    }

}

export {ExpressionToCode}