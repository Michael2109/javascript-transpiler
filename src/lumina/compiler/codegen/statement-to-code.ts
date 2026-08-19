import {StatementIr} from "../ir/statement-ir";
import {ExpressionToCode} from "./expression-to-code";
import {DeclarationIr} from "../ir/declaration-ir";
import {ControlFlowIr} from "../ir/control-flow-ir";

export namespace CodeGenerator {


    import LocalType = StatementIr.LocalType;

    /**
     * Joins a list of statements with an explicit `;` so that generated code never
     * depends on automatic semicolon insertion.
     */
    export function statementsToCode(statements: Array<StatementIr.Statement>): string {
        return statements.map(statementToCode).join(";\n")
    }

    export function compilationUnitToCode(compilationUnit: StatementIr.CompilationUnit): string {
        return statementsToCode(compilationUnit.statements)
    }

    function blockToCode(block: StatementIr.Block): string {
        return "{" + statementsToCode(block.statements) + "}"
    }

    function ifToCode(ifStatement: ControlFlowIr.If): string {

        const condition = ExpressionToCode.expressionToCode(ifStatement.condition)

        const elseBranch = ifStatement.elseBlock ? ` else ${statementToCode(ifStatement.elseBlock)}` : ""

        return `if(${condition})${statementToCode(ifStatement.ifBlock)}${elseBranch}`
    }


    function classToCode(classModel: StatementIr.ClassModel): string {

        const parent = classModel.parent ? `extends ${typeToCode(classModel.parent)}` : ""

        const constructor = "constructor(" + classModel.fields.map(classFieldToCode).join(",") + "){}"

        return `export class ${classModel.name} ${parent} {` + constructor + statementsToCode(classModel.statements) + "}"
    }

    function typeToCode(type: StatementIr.Type): string {
        switch (type.constructor) {
            case LocalType:
                return (type as LocalType).name
            default:
                throw new Error("Type not found:" + type)
        }

    }

    function classFieldToCode(field: StatementIr.Field): string {
        return `public ${field.name}` + (!field.required ? "?" : "")
    }

    function fieldToCode(field: StatementIr.Field): string {
        return field.name + (!field.required ? "?" : "")
    }

    /**
     * A method defined outside a class
     * @param method
     * @private
     */
    function moduleMethodToCode(method: StatementIr.ModuleMethod): string {
        return `function ${method.name}(){` + statementsToCode(method.statements) + "}"
    }

    function methodToCode(method: StatementIr.Method): string {
        return `${method.name}(){` + statementsToCode(method.statements) + "}"
    }

    function assignToCode(assign: StatementIr.Assign): string {
        return `const ${assign.name} = ${statementToCode(assign.statement)}`
    }

    function exprAsStmtToCode(exprAsStmt: StatementIr.ExprAsStmt): string {
        return ExpressionToCode.expressionToCode(exprAsStmt.expression)
    }

  export function statementToCode(statement: StatementIr.Statement): string {
        switch (statement.constructor) {
            case StatementIr.ClassModel:
                return classToCode(statement as StatementIr.ClassModel)
            case StatementIr.ModuleMethod:
                return moduleMethodToCode(statement as StatementIr.ModuleMethod)
            case StatementIr.Method:
                return methodToCode(statement as StatementIr.Method)
            case StatementIr.Assign:
                return assignToCode(statement as StatementIr.Assign)
            case StatementIr.ExprAsStmt:
                return exprAsStmtToCode(statement as StatementIr.ExprAsStmt)
            case StatementIr.Block:
                return blockToCode(statement as StatementIr.Block)
            case ControlFlowIr.If:
                return ifToCode(statement as ControlFlowIr.If)
            default:
                throw new Error("Not found: " + JSON.stringify(statement))
        }
    }

}