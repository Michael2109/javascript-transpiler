import {StatementIr} from "./statement-ir";
import {DeclarationIr} from "./declaration-ir";

namespace ExpressionIr {
    export class Expression {
    }

    export class Variable extends  Expression{
        constructor(public name: string) {
            super()
        }
    }

    export class Println implements Expression {
        constructor(public expression: Expression) {
        }
    }


    export abstract class PostfixOperator {

    }

    export class Postfix implements Expression {
        constructor(
            public expression: Expression,
            public operator: PostfixOperator) {
        }
    }

    export class MethodCall implements PostfixOperator {
        constructor(public args: Expression[]) {
        }
    }

    export class Increment implements PostfixOperator {
    }

    export class Decrement implements PostfixOperator {
    }

    export class NewClassInstance implements Expression {
        constructor(public type: StatementIr.Type, public expressions: Expression[]) {
        }
    }

    export class StringLiteral implements Expression {
        constructor(public value: string) {
        }
    }

    export class Lambda {
        constructor(public fields: Array<DeclarationIr.Field>, public statements: Array<StatementIr.Statement>) {
        }
    }

    export class ABinary implements Expression {
        constructor(public op: ABinOp, public expression1: Expression, public expression2: Expression) {
        }
    }

    export class RBinary extends Expression {
        constructor(public op: RBinOp, public expression1: Expression, public expression2: Expression) {
            super()
        }
    }

    export class BBinary extends Expression {
        constructor(public op: BBinOp, public expression1: Expression, public expression2: Expression) {
            super()
        }
    }

    export abstract class Operator extends Expression {
    }

    export abstract class ABinOp extends Operator {

    }

    export class Add extends ABinOp {
        value = "Add"
    }

    export class Subtract extends ABinOp {
        value = "Subtract"
    }

    export class Multiply extends ABinOp {
        value = "Multiply"
    }

    export class Divide extends ABinOp {
        value = "Divide"
    }

    export abstract class RBinOp extends Operator {
    }

    export class GreaterEqual extends RBinOp {
        value = "GreaterEqual"
    }

    export class Greater extends RBinOp {
        value = "Greater"
    }

    export class LessEqual extends RBinOp {
        value = "LessEqual"
    }

    export class Less extends RBinOp {
        value = "Less"
    }

    export class Equal extends RBinOp {
        value = "Equal"
    }

    export abstract class BBinOp extends Operator {
    }

    export class And extends BBinOp {
        value = "And"
    }

    export class Or extends BBinOp {
        value = "Or"
    }

    export class IntConst implements Expression {
        constructor(public value: number) {
        }
    }
}

export {ExpressionIr}