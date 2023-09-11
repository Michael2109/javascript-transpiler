import {Ir} from "../ast/ir";

export namespace CodeGenerator {

    export function compilationUnitToCode(compilationUnit: Ir.CompilationUnit): string {
        return compilationUnit.statements.map(statementToCode).join(" \n")
    }

    function classToCode(classModel: Ir.ClassModel): string {
        return `class  ${classModel.name} {` + classModel.statements.map(statementToCode) + "}"
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

    function statementToCode(statement: Ir.Statement): string {
        switch (statement.constructor){
            case Ir.ClassModel:
                return   classToCode(statement as Ir.ClassModel)
            case Ir.ModuleMethod:
                return moduleMethodToCode(statement as Ir.ModuleMethod)
            case Ir.Method:
                return  methodToCode(statement as Ir.Method)

            default:
                throw new Error("Not found: " + JSON.stringify(statement))
        }
    }

}