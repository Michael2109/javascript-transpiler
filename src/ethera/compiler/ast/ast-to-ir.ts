import {Ast} from "./ast";
import {Ir} from "./ir";

export namespace AstToIr {

    import ClassModel = Ast.ClassModel;
    import Statement = Ast.Statement;
    import Method = Ast.Method;
    import CompilationUnit = Ast.CompilationUnit;

   export function compilationUnitToIr(compilationUnit: CompilationUnit): Ir.CompilationUnit {
        return new Ir.CompilationUnit(compilationUnit.models.map(statementToIr))
    }

    function classModelToIr(classModel: ClassModel): Ir.ClassModel {
        return new Ir.ClassModel(classModel.name, classModel.statements.map(statementToIr))
    }

    function methodToIr(method: Method): Ir.Method {
        return new Ir.Method(method.name, method.statements.map(statementToIr))
    }

    function statementToIr(statement: Statement): Ir.Statement {

         switch (statement.constructor){
            case ClassModel:
                return   classModelToIr(statement as ClassModel)

             case Method:
                 return  methodToIr(statement as Method)

        }
    }

}