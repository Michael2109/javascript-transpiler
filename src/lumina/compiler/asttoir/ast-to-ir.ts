import {ExpressionAst} from "../ast/expression-ast";
import {StatementAst} from "../ast/statement-ast";
import {ExpressionIr} from "../ir/expression-ir";
import {StatementIr} from "../ir/statement-ir";

export namespace AstToIr {

    import ClassModel = StatementAst.ClassModel;
    import Statement = StatementAst.Statement;
    import Method = StatementAst.Method;
    import CompilationUnit = StatementAst.CompilationUnit;
    import Assign = StatementAst.Assign;
    import IntConst = ExpressionAst.IntConst;
    import ExprAsStmt = StatementAst.ExprAsStmt;
    import Expression = ExpressionAst.Expression;
    import ABinary = ExpressionAst.ABinary;
    import Add = ExpressionAst.Add;
    import Subtract = ExpressionAst.Subtract;
    import Multiply = ExpressionAst.Multiply;
    import Divide = ExpressionAst.Divide;
    import Operator = ExpressionAst.Operator;
    import Field = StatementAst.Field;
    import RefLocal = ExpressionAst.LocalType;
    import Ref = ExpressionAst.Type;
    import Type = ExpressionAst.Type;
    import LocalType = ExpressionAst.LocalType;


    interface IrState {
        isModule: boolean
    }

    export function compilationUnitToIr(compilationUnit: CompilationUnit): StatementIr.CompilationUnit {
        return new StatementIr.CompilationUnit(compilationUnit.statements.map(s => statementToIr(s, {isModule: true})))
    }

    function classToIr(classModel: ClassModel, irState: IrState): StatementIr.ClassModel {
        return new StatementIr.ClassModel(classModel.name, classModel.parent ? typeToIr(classModel.parent, irState): undefined, classModel.fields.map(field => fieldToIr(field, irState)) ,classModel.statements.map(s => statementToIr(s,  { ...irState, isModule: false })))
    }

    function typeToIr(type: Type, irState: IrState): StatementIr.Type {
        switch(type.constructor){
            case LocalType:
                return new StatementIr.LocalType((type as LocalType).name)
            default:
                throw new Error("Type not found: " + type)
        }

    }

    function moduleMethodToIr(method: Method, irState: IrState): StatementIr.Method {
        return new StatementIr.ModuleMethod(method.name, method.statements.map(s => statementToIr(s, irState)))
    }

    function methodToIr(method: Method, irState: IrState): StatementIr.Method {
        return new StatementIr.Method(method.name, method.statements.map(s => statementToIr(s, irState)))
    }

    function fieldToIr(field: Field, irState: IrState): StatementIr.Field {
        return new StatementIr.Field(field.name, field.required, refToIr(field.ref, irState), field.init ? expressionToIr(field.init, irState) : undefined)
    }

    function refToIr(ref: Ref, irState: IrState): StatementIr.Type {
        switch(ref.constructor){
            case RefLocal:
                return new StatementIr.LocalType((ref as RefLocal).name)
            default:
                throw new Error("Ref not found: " + ref)
        }
    }

    function assignToIr(assign:Assign, irState: IrState): StatementIr.Assign {
        return new StatementIr.Assign(assign.name, assign.immutable,statementToIr(assign.statement, irState))
    }

    function exprAsStmtToIr(exprAsStmt: ExprAsStmt, irState: IrState): StatementIr.ExprAsStmt {
        return new StatementIr.ExprAsStmt(expressionToIr(exprAsStmt.expression, irState))
    }



    function statementToIr(statement: Statement, irState: IrState): StatementIr.Statement {

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
    function expressionToIr(expression: Expression, irState: IrState): ExpressionIr.Expression {

        switch (expression.constructor){
            case IntConst:
                return   intConstToIr(expression as IntConst, irState)
            case ABinary:
                return aBinaryToIr(expression as ABinary, irState)
            default:
                throw new Error("Unknown expression: " + JSON.stringify(expression))
        }
    }

    function intConstToIr(intConst: IntConst, irState: IrState): ExpressionIr.IntConst {
        return new ExpressionIr.IntConst(intConst.value)
    }

    function aBinaryToIr(aBinary: ABinary, irState: IrState): ExpressionIr.ABinary {
        return new ExpressionIr.ABinary(opToIr(aBinary.op, irState), expressionToIr(aBinary.expression1, irState), expressionToIr(aBinary.expression2, irState))
    }

    function opToIr(operator:Operator, irState: IrState): ExpressionIr.Operator {
        switch (operator.constructor){
            case Add:
                return new ExpressionIr.Add()
            case Subtract:
                return new ExpressionIr.Subtract()
            case Multiply:
                return new ExpressionIr.Multiply()
            case Divide:
                return new ExpressionIr.Divide()
            default:
                throw new Error("Unknown operator: " + JSON.stringify(operator))
        }
    }
}