import {Ast} from "./ast";
import {Ir} from "./ir";

export namespace AstToIr {

    import ClassModel = Ast.ClassModel;
    import Statement = Ast.Statement;
    import Method = Ast.Method;
    import CompilationUnit = Ast.CompilationUnit;


    interface IrState {
        isModule: boolean
    }

   export function compilationUnitToIr(compilationUnit: CompilationUnit): Ir.CompilationUnit {
        return new Ir.CompilationUnit(compilationUnit.statements.map(s => statementToIr(s, {isModule: true})))
    }

    function classModelToIr(classModel: ClassModel, irState: IrState): Ir.ClassModel {
        return new Ir.ClassModel(classModel.name, classModel.statements.map(s => statementToIr(s,  { ...irState, isModule: false })))
    }

    function moduleMethodToIr(method: Method, irState: IrState): Ir.Method {
        return new Ir.ModuleMethod(method.name, method.statements.map(s => statementToIr(s, irState)))
    }

    function methodToIr(method: Method, irState: IrState): Ir.Method {
        return new Ir.Method(method.name, method.statements.map(s => statementToIr(s, irState)))
    }

    function statementToIr(statement: Statement, irState: IrState): Ir.Statement {

         switch (statement.constructor){
            case ClassModel:
                return   classModelToIr(statement as ClassModel, irState)
             case Method:
                 return  irState.isModule ?moduleMethodToIr(statement as Method, irState) : methodToIr(statement as Method, irState)
        }
    }

}