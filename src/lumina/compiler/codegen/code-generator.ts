import {Ir} from "../ast/ir";
import exp from "constants";

export namespace CodeGenerator {


    export function compilationUnitToCode(compilationUnit: Ir.CompilationUnit): string {
        return compilationUnit.statements.map(statementToCode).join(" \n")
    }

    function classToCode(classModel: Ir.ClassModel): string {
        return `export class ${classModel.name} {` + classModel.statements.map(statementToCode) + "}"
    }

    /**
     * A method defined outside a class
     * @param method
     * @private
     */
    function moduleMethodToCode(method: Ir.ModuleMethod): string {
        return `function ${method.name}(){` + method.statements.map(statementToCode) + "}"
    }

    function methodToCode(method: Ir.Method): string {
        return `${method.name}(){` + method.statements.map(statementToCode) + "}"
    }

    function assignToCode(assign: Ir.Assign): string {
        return `const ${assign.name} = ${statementToCode(assign.statement)}`
    }

    function exprAsStmtToCode(exprAsStmt: Ir.ExprAsStmt): string {
        return expressionToCode(exprAsStmt.expression)
    }

    function statementToCode(statement: Ir.Statement): string {
        switch (statement.constructor){
            case Ir.ClassModel:
                return   classToCode(statement as Ir.ClassModel)
            case Ir.ModuleMethod:
                return moduleMethodToCode(statement as Ir.ModuleMethod)
            case Ir.Method:
                return  methodToCode(statement as Ir.Method)
            case Ir.Assign:
                return  assignToCode(statement as Ir.Assign)
            case Ir.ExprAsStmt:
                return exprAsStmtToCode(statement as Ir.ExprAsStmt)
            default:
                throw new Error("Not found: " + JSON.stringify(statement))
        }
    }

    function expressionToCode(expression: Ir.Expression): string {
        switch (expression.constructor){
            case Ir.IntConst:
                return   intConstToCode(expression as Ir.IntConst)
            case Ir.ABinary:
                return aBinaryToCode(expression as Ir.ABinary)
            default:
                throw new Error("Not found: " + JSON.stringify(expression))
        }
    }


    function aBinaryToCode(aBinary: Ir.ABinary): string {
        return expressionToCode(aBinary.expression1) + opToCode(aBinary.op) + expressionToCode(aBinary.expression2)
    }

    function opToCode(operator:Ir.Operator): string {
        switch (operator.constructor){
            case Ir.Add:
                return "+"
            case Ir.Subtract:
                return "-"
            case Ir.Multiply:
                return "*"
            case Ir.Divide:
                return "/"
            default:
                throw new Error("Unknown operator: " + operator)
        }
    }

    function intConstToCode(intConst: Ir.IntConst): string {
        return intConst.value.toString()
    }
}