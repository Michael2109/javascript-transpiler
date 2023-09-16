import {ExpressionIr} from "../ir/expression-ir";

namespace ExpressionToCode {

    export function expressionToCode(expression: ExpressionIr.Expression): string {
        switch (expression.constructor){
            case ExpressionIr.IntConst:
                return   intConstToCode(expression as ExpressionIr.IntConst)
            case ExpressionIr.ABinary:
                return aBinaryToCode(expression as ExpressionIr.ABinary)
            default:
                throw new Error("Not found: " + JSON.stringify(expression))
        }
    }

    export  function aBinaryToCode(aBinary: ExpressionIr.ABinary): string {
        return expressionToCode(aBinary.expression1) + opToCode(aBinary.op) + expressionToCode(aBinary.expression2)
    }

    export function opToCode(operator:ExpressionIr.Operator): string {
        switch (operator.constructor){
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
}

export {ExpressionToCode}