import {ExpressionAst} from "../ast/expression-ast";
import {StatementAst} from "../ast/statement-ast";
import {ExpressionIr} from "../ir/expression-ir";
import {StatementIr} from "../ir/statement-ir";
import {DeclarationAst} from "../ast/declaration-ast";
import {DeclarationIr} from "../ir/declaration-ir";
import exp from "constants";

export namespace AstToIr {

    import ClassModel = DeclarationAst.ClassModel;
    import Statement = StatementAst.Statement;
    import Method = DeclarationAst.Method;
    import CompilationUnit = DeclarationAst.CompilationUnit;
    import Assign = DeclarationAst.Assign;
    import IntConst = ExpressionAst.IntConst;
    import ExprAsStmt = StatementAst.ExprAsStmt;
    import Expression = ExpressionAst.Expression;
    import ABinary = ExpressionAst.ABinary;
    import Add = ExpressionAst.Add;
    import Subtract = ExpressionAst.Subtract;
    import Multiply = ExpressionAst.Multiply;
    import Divide = ExpressionAst.Divide;
    import Operator = ExpressionAst.Operator;
    import Field = DeclarationAst.Field;
    import RefLocal = ExpressionAst.LocalType;
    import Ref = ExpressionAst.Type;
    import Type = ExpressionAst.Type;
    import LocalType = ExpressionAst.LocalType;
    import Namespace = DeclarationAst.Namespace;
    import Postfix = ExpressionAst.Postfix;
    import PostfixOperator = ExpressionAst.PostfixOperator;
    import MethodCall = ExpressionAst.MethodCall;
    import Increment = ExpressionAst.Increment;
    import Decrement = ExpressionAst.Decrement;
    import Variable = ExpressionAst.Variable;
    import StringLiteral = ExpressionAst.StringLiteral;
    import Lambda = DeclarationAst.Lambda;
    import NewClassInstance = ExpressionAst.NewClassInstance;
    import Println = ExpressionAst.Println;


    interface IrState {
        isModule: boolean
    }

    export function compilationUnitToIr(compilationUnit: CompilationUnit): StatementIr.CompilationUnit {
        return new StatementIr.CompilationUnit(compilationUnit.statements.map(s => statementToIr(s, {isModule: true})))
    }

    function namespaceToIr(namespace: Namespace, irState: IrState): DeclarationIr.Namespace {
        return new DeclarationIr.Namespace(namespace.name, namespace.statements.map(statement => statementToIr(statement, irState)))
    }

    function classToIr(classModel: ClassModel, irState: IrState): StatementIr.ClassModel {
        return new StatementIr.ClassModel(classModel.name, classModel.parent ? typeToIr(classModel.parent, irState) : undefined, classModel.fields.map(field => fieldToIr(field, irState)), classModel.statements.map(s => statementToIr(s, {
            ...irState,
            isModule: false
        })))
    }

    function typeToIr(type: Type, irState: IrState): StatementIr.Type {
        switch (type.constructor) {
            case LocalType:
                return new StatementIr.LocalType((type as LocalType).name)
            default:
                throw new Error("Type not found: " + type.constructor)
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
        switch (ref.constructor) {
            case RefLocal:
                return new StatementIr.LocalType((ref as RefLocal).name)
            default:
                throw new Error("Ref not found: " + ref.constructor)
        }
    }

    function assignToIr(assign: Assign, irState: IrState): StatementIr.Assign {
        return new StatementIr.Assign(assign.name, assign.immutable, statementToIr(assign.statement, irState))
    }

    function exprAsStmtToIr(exprAsStmt: ExprAsStmt, irState: IrState): StatementIr.ExprAsStmt {
        return new StatementIr.ExprAsStmt(expressionToIr(exprAsStmt.expression, irState))
    }


    function statementToIr(statement: Statement, irState: IrState): StatementIr.Statement {

        switch (statement.constructor) {
            case ClassModel:
                return classToIr(statement as ClassModel, irState)
            case Method:
                return irState.isModule ? moduleMethodToIr(statement as Method, irState) : methodToIr(statement as Method, irState)
            case Assign:
                return assignToIr(statement as Assign, irState)
            case ExprAsStmt:
                return exprAsStmtToIr(statement as ExprAsStmt, irState)
            case Namespace:
                return namespaceToIr(statement as Namespace, irState)
            default:
                throw new Error("Unknown statement: " + statement.constructor)
        }
    }

    /**
     * Expressions
     */
    function expressionToIr(expression: Expression, irState: IrState): ExpressionIr.Expression {

        switch (expression.constructor) {
            case IntConst:
                return intConstToIr(expression as IntConst, irState)
            case ABinary:
                return aBinaryToIr(expression as ABinary, irState)
            case Postfix:
                return postfixToIr(expression as Postfix, irState)
            case Variable:
                return variableToIr(expression as Variable, irState)
            case StringLiteral:
                return stringLiteralToIr(expression as StringLiteral, irState)
            case Lambda:
                return lambdaToIr(expression as Lambda, irState)
            case NewClassInstance:
                return  newClassInstanceToIr(expression as NewClassInstance, irState)
            case Println:
                return printlnToIr(expression as Println, irState)
            default:
                throw new Error("Unknown expression: " + expression.constructor)
        }
    }

    function intConstToIr(intConst: IntConst, irState: IrState): ExpressionIr.IntConst {
        return new ExpressionIr.IntConst(intConst.value)
    }

    function aBinaryToIr(aBinary: ABinary, irState: IrState): ExpressionIr.ABinary {
        return new ExpressionIr.ABinary(opToIr(aBinary.op, irState), expressionToIr(aBinary.expression1, irState), expressionToIr(aBinary.expression2, irState))
    }

    function postfixToIr(postfix: Postfix, irState: IrState): ExpressionIr.Postfix {
        return new ExpressionIr.Postfix(expressionToIr(postfix.expression, irState), postfixOperatorToIr(postfix.operator, irState))
    }

    function variableToIr(variable: Variable, irState: IrState): ExpressionIr.Variable {
        return new ExpressionIr.Variable(variable.name)
    }

    function stringLiteralToIr(stringLiteral: StringLiteral, irState: IrState): ExpressionIr.StringLiteral {
        return new ExpressionIr.StringLiteral(stringLiteral.value)
    }

    function lambdaToIr(lambda: Lambda, irState: IrState): ExpressionIr.Lambda {
        return new ExpressionIr.Lambda(lambda.fields.map(field => fieldToIr(field, irState)), lambda.statements.map(statement => statementToIr(statement, irState)))
    }

    function newClassInstanceToIr(newClassInstance: NewClassInstance, irState: IrState): ExpressionIr.NewClassInstance {
        return new ExpressionIr.NewClassInstance(typeToIr(newClassInstance.type, irState), newClassInstance.expressions.map(expression => expressionToIr(expression, irState)))
    }
    function printlnToIr(println: Println, irState: IrState): ExpressionIr.Println {
        return new ExpressionIr.Println(expressionToIr(println.expression, irState))
    }

    function postfixOperatorToIr(postfixOperator: PostfixOperator, irState: IrState): ExpressionIr.PostfixOperator {
       switch (postfixOperator.constructor){
           case MethodCall:
               return new ExpressionIr.MethodCall((postfixOperator as MethodCall).args.map(expression => expressionToIr(expression, irState)))
           case Increment:
               return new ExpressionIr.Increment()
           case Decrement:
               return new ExpressionIr.Decrement()
           default:
               throw new Error("Postfix operator not found: " + postfixOperator.constructor)
       }
    }

    function opToIr(operator: Operator, irState: IrState): ExpressionIr.Operator {
        switch (operator.constructor) {
            case Add:
                return new ExpressionIr.Add()
            case Subtract:
                return new ExpressionIr.Subtract()
            case Multiply:
                return new ExpressionIr.Multiply()
            case Divide:
                return new ExpressionIr.Divide()
            default:
                throw new Error("Unknown operator: " + operator.constructor)
        }
    }
}