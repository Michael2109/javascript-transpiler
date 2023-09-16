namespace ExpressionIr {
    export class Expression {
    }


    export class ABinary implements Expression {
        constructor(public op: ABinOp, public expression1: Expression, public expression2: Expression) {
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

    export class IntConst implements Expression {
        constructor(public value: number) {
        }
    }
}

export {ExpressionIr}