import {Ast} from "./ast";
import {Ir} from "./ir";

export namespace AstToIr {

    import ClassModel = Ast.ClassModel;
    import Statement = Ast.Statement;
    import Method = Ast.Method;
    import CompilationUnit = Ast.CompilationUnit;
    import Assign = Ast.Assign;
    import IntConst = Ast.IntConst;
    import ExprAsStmt = Ast.ExprAsStmt;
    import Expression = Ast.Expression;
    import ABinary = Ast.ABinary;
    import Add = Ast.Add;
    import Subtract = Ast.Subtract;
    import Multiply = Ast.Multiply;
    import Divide = Ast.Divide;
    import Operator = Ast.Operator;
    import Field = Ast.Field;
    import RefLocal = Ast.LocalType;
    import Ref = Ast.Type;
    import Type = Ast.Type;
    import LocalType = Ast.LocalType;


    interface IrState {
        isModule: boolean
    }

    export function compilationUnitToIr(compilationUnit: CompilationUnit): Ir.CompilationUnit {
        return new Ir.CompilationUnit(compilationUnit.statements.map(s => statementToIr(s, {isModule: true})))
    }

    function classToIr(classModel: ClassModel, irState: IrState): Ir.ClassModel {
        return new Ir.ClassModel(classModel.name, classModel.parent ? typeToIr(classModel.parent, irState): undefined, classModel.fields.map(field => fieldToIr(field, irState)) ,classModel.statements.map(s => statementToIr(s,  { ...irState, isModule: false })))
    }

    function typeToIr(type: Type, irState: IrState): Ir.Type {
        switch(type.constructor){
            case LocalType:
                return new Ir.LocalType((type as LocalType).name)
            default:
                throw new Error("Type not found: " + type)
        }

    }

    function moduleMethodToIr(method: Method, irState: IrState): Ir.Method {
        return new Ir.ModuleMethod(method.name, method.statements.map(s => statementToIr(s, irState)))
    }

    function methodToIr(method: Method, irState: IrState): Ir.Method {
        return new Ir.Method(method.name, method.statements.map(s => statementToIr(s, irState)))
    }

    function fieldToIr(field: Field, irState: IrState): Ir.Field {
        return new Ir.Field(field.name, field.required, refToIr(field.ref, irState), field.init ? expressionToIr(field.init, irState) : undefined)
    }

    function refToIr(ref: Ref, irState: IrState): Ir.Type {
        switch(ref.constructor){
            case RefLocal:
                return new Ir.LocalType((ref as RefLocal).name)
            default:
                throw new Error("Ref not found: " + ref)
        }
    }

    function assignToIr(assign:Assign, irState: IrState): Ir.Assign {
        return new Ir.Assign(assign.name, assign.immutable,statementToIr(assign.statement, irState))
    }

    function exprAsStmtToIr(exprAsStmt: ExprAsStmt, irState: IrState): Ir.ExprAsStmt {
        return new Ir.ExprAsStmt(expressionToIr(exprAsStmt.expression, irState))
    }



    function statementToIr(statement: Statement, irState: IrState): Ir.Statement {

         switch (statement.constructor){
            case ClassModel:
                return   classToIr(statement as ClassModel, irState)
             case Method:
                 return  irState.isModule ?moduleMethodToIr(statement as Method, irState) : methodToIr(statement as Method, irState)
             case Assign:
                 return assignToIr(statement as Assign, irState)
             case ExprAsStmt:
                 return exprAsStmtToIr(statement as ExprAsStmt, irState)
             default:
                 throw new Error("Unknown statement: " + JSON.stringify(statement))
        }
    }

    /**
     * Expressions
     */
    function expressionToIr(expression: Expression, irState: IrState): Ir.Expression {

        switch (expression.constructor){
            case IntConst:
                return   intConstToIr(expression as IntConst, irState)
            case ABinary:
                return aBinaryToIr(expression as ABinary, irState)
            default:
                throw new Error("Unknown expression: " + JSON.stringify(expression))
        }
    }

    function intConstToIr(intConst: IntConst, irState: IrState): Ir.IntConst {
        return new Ir.IntConst(intConst.value)
    }

    function aBinaryToIr(aBinary: ABinary, irState: IrState): Ir.ABinary {
        return new Ir.ABinary(opToIr(aBinary.op, irState), expressionToIr(aBinary.expression1, irState), expressionToIr(aBinary.expression2, irState))
    }

    function opToIr(operator:Operator, irState: IrState): Ir.Operator {
        switch (operator.constructor){
            case Add:
                return new Ir.Add()
            case Subtract:
                return new Ir.Subtract()
            case Multiply:
                return new Ir.Multiply()
            case Divide:
                return new Ir.Divide()
            default:
                throw new Error("Unknown operator: " + JSON.stringify(operator))
        }
    }
}