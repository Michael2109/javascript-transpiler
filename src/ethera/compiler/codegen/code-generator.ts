import {Ir} from "../ast/ir";

export namespace CodeGenerator {

    export function compilationUnitToCode(compilationUnit: Ir.CompilationUnit): string {
        return compilationUnit.models.map(classToCode).join(" \n")
    }

    function classToCode(classModel: Ir.ClassModel): string {
        return `class  ${classModel.name} {` + classModel.statements.map(statementToCode) + "}"
    }

    function methodToCode(method: Ir.Method): string {
        return `function ${method.name} {` + method.statements.map(statementToCode) + "}"
    }

    function statementToCode(statement: Ir.Statement): string {
        switch (statement.constructor){
            case Ir.ClassModel:
                return   classToCode(statement as Ir.ClassModel)
            case Ir.Method:
                return  methodToCode(statement as Ir.Method)

            default:
                throw new Error("Not found: " + JSON.stringify(statement))
        }
    }

}