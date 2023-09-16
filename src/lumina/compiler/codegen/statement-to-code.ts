import { ExpressionIr} from "../ir/expression-ir";
import { StatementIr} from "../ir/statement-ir";
import {ExpressionToCode} from "./expression-to-code";

export namespace CodeGenerator {


    import LocalType = StatementIr.LocalType;

    export function compilationUnitToCode(compilationUnit: StatementIr.CompilationUnit): string {
        return compilationUnit.statements.map(statementToCode).join(" \n")
    }

    function classToCode(classModel: StatementIr.ClassModel): string {

       const createConstructor = classModel.fields.length > 0

        const parent = classModel.parent ? `extends ${typeToCode(classModel.parent)}` : ""

       const constructor = "constructor(" + classModel.fields.map(classFieldToCode) + "){}"

        return `export class ${classModel.name} ${parent} {` + constructor + classModel.statements.map(statementToCode) + "}"
    }

    function typeToCode(type: StatementIr.Type): string {
        switch(type.constructor){
            case LocalType:
                return (type as LocalType).name
            default:
                throw new Error("Type not found:" + type)
        }

    }

    function classFieldToCode(field: StatementIr.Field): string {
        return `public ${field.name}` + (!field.required ? "?": "")
    }

    function fieldToCode(field: StatementIr.Field): string {
        return field.name + (!field.required ? "?": "")
    }

    /**
     * A method defined outside a class
     * @param method
     * @private
     */
    function moduleMethodToCode(method: StatementIr.ModuleMethod): string {
        return `function ${method.name}(){` + method.statements.map(statementToCode) + "}"
    }

    function methodToCode(method: StatementIr.Method): string {
        return `${method.name}(){` + method.statements.map(statementToCode) + "}"
    }

    function assignToCode(assign: StatementIr.Assign): string {
        return `const ${assign.name} = ${statementToCode(assign.statement)}`
    }

    function exprAsStmtToCode(exprAsStmt: StatementIr.ExprAsStmt): string {
        return ExpressionToCode.expressionToCode(exprAsStmt.expression)
    }

    function statementToCode(statement: StatementIr.Statement): string {
        switch (statement.constructor){
            case StatementIr.ClassModel:
                return   classToCode(statement as StatementIr.ClassModel)
            case StatementIr.ModuleMethod:
                return moduleMethodToCode(statement as StatementIr.ModuleMethod)
            case StatementIr.Method:
                return  methodToCode(statement as StatementIr.Method)
            case StatementIr.Assign:
                return  assignToCode(statement as StatementIr.Assign)
            case StatementIr.ExprAsStmt:
                return exprAsStmtToCode(statement as StatementIr.ExprAsStmt)
            default:
                throw new Error("Not found: " + JSON.stringify(statement))
        }
    }

}